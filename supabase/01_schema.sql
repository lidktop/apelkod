-- АпельКод (React/Vite версия) — схема базы данных (Supabase / PostgreSQL)
-- Вставь целиком в Supabase → SQL Editor → New query → Run
--
-- Важное отличие от обычных схем: часть бизнесов в каталоге — это демо-карточки
-- (seedOffers из mockData.ts), у которых нет настоящего аккаунта. Поэтому
-- profiles.user_id — НЕ первичный ключ, а отдельное nullable-поле:
-- у демо-бизнесов user_id = null, у реальных пользователей — их auth id.

-- ===== 1. Бизнесы (и реальные пользователи, и демо-карточки) =====
create table if not exists profiles (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid unique references auth.users(id) on delete cascade, -- null = демо-бизнес без аккаунта
  name           text not null,              -- BusinessCard.name / UserProfile.name
  email          text,
  city           text not null default '',
  sphere         text not null default '',
  description    text not null default '',
  audience       integer not null default 0,
  engagement     numeric(5,2) not null default 0,
  rating         integer not null default 100,
  deals_completed integer not null default 0,
  deals_total     integer not null default 0,
  dolki          integer not null default 5,
  weekly_quota   integer not null default 3,
  weekly_used    integer not null default 0,
  created_at     timestamptz not null default now()
);

-- автоматически создаём запись в profiles при регистрации через auth
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into profiles (user_id, email, name, city, sphere, description)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'city', ''),
    coalesce(new.raw_user_meta_data->>'sphere', ''),
    coalesce(new.raw_user_meta_data->>'description', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ===== 2. Предложения (каталог) =====
-- в текущем коде BusinessCard и есть "карточка в каталоге" — то есть одна
-- запись profiles = одно предложение. Если захотите, чтобы один бизнес мог
-- публиковать НЕСКОЛЬКО предложений (как в вашем промпте), используйте offers.
create table if not exists offers (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references profiles(id) on delete cascade,
  type        text not null check (type in ('Бартер', 'Коллаборация')),
  description text not null,
  audience    integer not null default 0,
  engagement  numeric(5,2) not null default 0,
  created_at  timestamptz not null default now()
);

-- ===== 3. Сделки (связаны по id, не по имени) =====
create table if not exists deals (
  id                        uuid primary key default gen_random_uuid(),
  offer_id                  uuid references offers(id) on delete set null,
  business_a_id             uuid not null references profiles(id) on delete cascade, -- кто предложил
  business_b_id             uuid not null references profiles(id) on delete cascade, -- с кем сделка
  type                      text not null,
  description               text not null,
  deadline                  date not null,
  status                    text not null default 'pending'
                              check (status in ('pending','confirmed','active','completed','overdue')),
  confirmed_a               boolean not null default false,
  confirmed_b               boolean not null default false,
  template_name             text,
  extended                  boolean not null default false,
  user_confirmed_completion boolean not null default false,
  created_at                timestamptz not null default now(),
  check (business_a_id <> business_b_id)
);

-- ===== 4. Чаты и сообщения =====
create table if not exists chat_threads (
  id         uuid primary key default gen_random_uuid(),
  deal_id    uuid not null references deals(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id         uuid primary key default gen_random_uuid(),
  thread_id  uuid not null references chat_threads(id) on delete cascade,
  sender_id  uuid references profiles(id) on delete set null, -- null = демо-бот
  body       text not null check (char_length(body) between 1 and 600),
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ===== 5. Уведомления (в т.ч. напоминания о дедлайнах) =====
create table if not exists notifications (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  deal_id    uuid references deals(id) on delete cascade,
  kind       text not null, -- 'deadline_soon' | 'overdue' | 'deal_created' | 'deal_completed'
  text       text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists deals_deadline_idx on deals (status, deadline);
create index if not exists chat_thread_idx on chat_messages (thread_id, created_at);
create index if not exists notif_profile_idx on notifications (profile_id, is_read);

-- ===== 6. Безопасность (Row Level Security) =====
alter table profiles       enable row level security;
alter table offers         enable row level security;
alter table deals          enable row level security;
alter table chat_threads    enable row level security;
alter table chat_messages  enable row level security;
alter table notifications  enable row level security;

-- профили (каталог): видят все авторизованные, править может только владелец своей записи
create policy "profiles: read all authed" on profiles
  for select to authenticated using (true);
create policy "profiles: update own" on profiles
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
revoke update on profiles from authenticated;
grant update (name, city, sphere, description, audience, engagement)
  on profiles to authenticated;

-- предложения
create policy "offers: read all authed" on offers
  for select to authenticated using (true);
create policy "offers: insert own" on offers
  for insert to authenticated with check (
    owner_id in (select id from profiles where user_id = auth.uid())
  );
create policy "offers: delete own" on offers
  for delete to authenticated using (
    owner_id in (select id from profiles where user_id = auth.uid())
  );

-- сделки: видят и создают только настоящие участники (по user_id их профиля)
create policy "deals: read participants" on deals
  for select to authenticated using (
    auth.uid() in (
      select user_id from profiles where id in (business_a_id, business_b_id)
    )
  );
create policy "deals: insert as proposer" on deals
  for insert to authenticated with check (
    business_a_id in (select id from profiles where user_id = auth.uid())
  );

-- чаты: видят только участники сделки
create policy "chat threads: participants" on chat_threads
  for select to authenticated using (
    exists (
      select 1 from deals d
      join profiles p on p.id in (d.business_a_id, d.business_b_id)
      where d.id = chat_threads.deal_id and p.user_id = auth.uid()
    )
  );
create policy "chat messages: read participants" on chat_messages
  for select to authenticated using (
    exists (
      select 1 from chat_threads t
      join deals d on d.id = t.deal_id
      join profiles p on p.id in (d.business_a_id, d.business_b_id)
      where t.id = chat_messages.thread_id and p.user_id = auth.uid()
    )
  );
create policy "chat messages: write participants" on chat_messages
  for insert to authenticated with check (
    sender_id in (select id from profiles where user_id = auth.uid())
    and exists (
      select 1 from chat_threads t
      join deals d on d.id = t.deal_id
      where t.id = thread_id and auth.uid() in (
        select user_id from profiles where id in (d.business_a_id, d.business_b_id)
      )
    )
  );

-- уведомления: видит только адресат
create policy "notifications: read own" on notifications
  for select to authenticated using (
    profile_id in (select id from profiles where user_id = auth.uid())
  );
create policy "notifications: mark read own" on notifications
  for update to authenticated using (
    profile_id in (select id from profiles where user_id = auth.uid())
  );

-- ===== 7. Функции для действий, которые нельзя доверять клиенту =====

-- подтвердить сделку (сторона A или B — определяется автоматически по auth.uid())
create or replace function confirm_deal(p_deal uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare
  d deals%rowtype;
  my_profile uuid;
begin
  select id into my_profile from profiles where user_id = auth.uid();
  select * into d from deals where id = p_deal for update;
  if not found then raise exception 'Сделка не найдена'; end if;
  if my_profile not in (d.business_a_id, d.business_b_id) then raise exception 'Нет доступа'; end if;

  if my_profile = d.business_a_id then
    update deals set confirmed_a = true where id = p_deal;
  else
    update deals set confirmed_b = true where id = p_deal;
  end if;

  select * into d from deals where id = p_deal;
  if d.confirmed_a and d.confirmed_b and d.status <> 'completed' then
    update deals set status = 'completed' where id = p_deal;
    update profiles set dolki = dolki + 3, deals_completed = deals_completed + 1, deals_total = deals_total + 1
      where id in (d.business_a_id, d.business_b_id);
    insert into notifications (profile_id, deal_id, kind, text) values
      (d.business_a_id, d.id, 'deal_completed', 'Сделка закрыта. +3 дольки'),
      (d.business_b_id, d.id, 'deal_completed', 'Сделка закрыта. +3 дольки');
  elsif d.confirmed_a and d.confirmed_b and d.status = 'pending' then
    update deals set status = 'active' where id = p_deal; -- обе стороны согласовали условия
  end if;
end;
$$;

-- ===== 8. Напоминания о дедлайнах (запуск по расписанию) =====
create or replace function run_deal_reminders()
returns void language plpgsql security definer set search_path = public
as $$
begin
  insert into notifications (profile_id, deal_id, kind, text)
  select d.business_a_id, d.id, 'deadline_soon', 'Завтра срок по сделке «' || coalesce(d.template_name, d.type) || '»'
  from deals d
  where d.status in ('active','confirmed') and d.deadline = current_date + 1 and not d.confirmed_a;

  insert into notifications (profile_id, deal_id, kind, text)
  select d.business_b_id, d.id, 'deadline_soon', 'Завтра срок по сделке «' || coalesce(d.template_name, d.type) || '»'
  from deals d
  where d.status in ('active','confirmed') and d.deadline = current_date + 1 and not d.confirmed_b;

  update deals set status = 'overdue'
  where status in ('active','confirmed') and deadline < current_date;
end;
$$;

-- включи расширение pg_cron в Dashboard → Database → Extensions перед этой строкой
select cron.schedule('apelkod-deal-reminders', '0 6 * * *', $$select run_deal_reminders();$$);

-- живые обновления уведомлений и чата в интерфейсе
alter publication supabase_realtime add table notifications, chat_messages;
