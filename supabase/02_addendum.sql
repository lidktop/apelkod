-- АпельКод — ДОПОЛНЕНИЕ к schema_react.sql (запусти ПОСЛЕ него, тоже через SQL Editor → Run)
-- Добавляет то, чего не хватало для реальной работы каталога и бартера с демо-бизнесами.

-- ===== 1. Недостающие поля каталога в profiles =====
alter table profiles add column if not exists type text not null default 'Бартер' check (type in ('Бартер','Коллаборация'));
alter table profiles add column if not exists owner text not null default '';
-- профиль виден в публичном каталоге, только когда явно "опубликован" (через OfferDialog)
alter table profiles add column if not exists is_published boolean not null default false;

grant update (name, city, sphere, description, audience, engagement, type, owner, is_published)
  on profiles to authenticated;

-- ===== 2. Демо-бизнесы (видны в каталоге сразу, без настоящего аккаунта) =====
insert into profiles (name, city, sphere, type, description, audience, engagement, rating, deals_completed, deals_total, owner, is_published)
select v.name, v.city, v.sphere, v.type, v.description, v.audience, v.engagement, v.rating, v.deals_completed, v.deals_total, v.owner, true
from (values
  ('Кофейня «Зерно»','Москва','Общепит','Бартер','Пост о вашем бренде в Instagram (18 тыс. подписчиков). Ищем партнёра для обмена контентом.',18000,4.2,100,12,12,'Анна К.'),
  ('Студия йоги «Дыxание»','Санкт-Петербург','Фитнес','Бартер','Упоминание в сторис + репост. Ищем кросс-промо с косметикой или едой.',9500,5.8,92,11,12,'Мария В.'),
  ('Бренд «Тёплый дом»','Москва','Одежда','Коллаборация','Совместный набор: свитер + кофе. Готовы к долгосрочному партнёрству.',24000,3.6,88,7,8,'Дмитрий П.'),
  ('Цветочная «Пион»','Казань','Цветы','Бартер','Обмен постами и сторис. Ищем фотографа или свадебного организатора.',6200,7.1,100,5,5,'Лена С.'),
  ('Крафтовая пекарня «Мякиш»','Екатеринбург','Общепит','Бартер','Розыгрыш набора выпечки у нас — упоминание вашего бренда. 12 тыс. охват.',12000,6.3,75,3,4,'Игорь Л.'),
  ('Фотостудия «Свет»','Москва','Услуги','Коллаборация','Бесплатная съёмка для вашего бренда — вы упоминаете студию. Ищем одежду или декор.',15000,4.9,95,9,10,'Сергей М.'),
  ('Косметика «Нежность»','Новосибирск','Красота','Бартер','Обмен постами в Instagram. Ищем блогеров или салоны красоты.',21000,5.2,100,8,8,'Ольга Р.'),
  ('Книжный «Стопка»','Санкт-Петербург','Розница','Коллаборация','Совместный розыгрыш книг и вашего товара. Ищем кофейни или косметику.',8000,6.8,83,5,6,'Катя Д.'),
  ('Кондитерская «Сладость»','Казань','Общепит','Бартер','Тортик на ваш ивент — вы про нас в сторис. Ищем ивент-агентства.',5500,8.2,90,6,7,'Юля А.')
) as v(name, city, sphere, type, description, audience, engagement, rating, deals_completed, deals_total, owner)
where not exists (
  select 1 from profiles p where p.name = v.name and p.user_id is null
);

-- ===== 3. Демо-партнёр авто-подтверждает условия сделки =====
-- Вызывается клиентом сразу после создания сделки с демо-бизнесом (у которого нет
-- настоящего аккаунта). Если у партнёра есть реальный аккаунт — функция ничего не делает,
-- и он должен подтвердить сделку сам через confirm_deal().
create or replace function auto_confirm_demo_partner(p_deal uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare
  d deals%rowtype;
  my_profile uuid;
  other_profile uuid;
  other_user_id uuid;
begin
  select id into my_profile from profiles where user_id = auth.uid();
  select * into d from deals where id = p_deal;
  if not found then raise exception 'Сделка не найдена'; end if;
  if my_profile not in (d.business_a_id, d.business_b_id) then raise exception 'Нет доступа'; end if;

  other_profile := case when my_profile = d.business_a_id then d.business_b_id else d.business_a_id end;
  select user_id into other_user_id from profiles where id = other_profile;
  if other_user_id is not null then
    return; -- у партнёра настоящий аккаунт — подтверждает сам
  end if;

  if other_profile = d.business_a_id then
    update deals set confirmed_a = true where id = p_deal;
  else
    update deals set confirmed_b = true where id = p_deal;
  end if;
end;
$$;

-- ===== 4. Авто-ответ демо-бота в чате =====
-- sender_id = null помечает сообщение как "от демо-бота" (chat_messages.sender_id nullable).
-- Обычная RLS-политика чата не разрешает вставлять сообщения за null, поэтому для
-- симуляции ответа используем отдельную security-definer функцию с проверкой, что
-- у партнёра в этом треде правда нет настоящего аккаунта.
create or replace function send_bot_reply(p_thread uuid, p_text text)
returns void language plpgsql security definer set search_path = public
as $$
declare
  t chat_threads%rowtype;
  d deals%rowtype;
  my_profile uuid;
  other_profile uuid;
  other_user_id uuid;
begin
  select * into t from chat_threads where id = p_thread;
  if not found then raise exception 'Тред не найден'; end if;
  select * into d from deals where id = t.deal_id;
  select id into my_profile from profiles where user_id = auth.uid();
  if my_profile not in (d.business_a_id, d.business_b_id) then raise exception 'Нет доступа'; end if;

  other_profile := case when my_profile = d.business_a_id then d.business_b_id else d.business_a_id end;
  select user_id into other_user_id from profiles where id = other_profile;
  if other_user_id is not null then
    raise exception 'У партнёра настоящий аккаунт — бот недоступен';
  end if;

  insert into chat_messages (thread_id, sender_id, body) values (p_thread, null, p_text);
end;
$$;

-- ===== 5. Продление дедлайна =====
-- У deals нет update-политики (чтобы клиент не мог сам менять статусы/даты),
-- поэтому продление дедлайна — тоже отдельная функция, а не прямой update.
create or replace function extend_deadline(p_deal uuid)
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
  if d.extended then raise exception 'Дедлайн уже продлевался'; end if;

  update deals set deadline = deadline + 3, extended = true where id = p_deal;
end;
$$;
