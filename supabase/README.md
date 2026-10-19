# База данных (Supabase / PostgreSQL)

Эти файлы — схема базы данных проекта. Если понадобится поднять новый
Supabase-проект с нуля (например, для другого окружения), выполни их по
порядку в SQL Editor (Supabase → SQL Editor → New query → вставить
содержимое файла → Run):

1. `01_schema.sql` — таблицы (`profiles`, `offers`, `deals`, `chat_threads`,
   `chat_messages`, `notifications`), RLS-политики, функции `confirm_deal` и
   `run_deal_reminders`, расписание напоминаний через `pg_cron`.
2. `02_addendum.sql` — поля каталога (`type`/`owner`/`is_published`),
   демо-бизнесы для каталога, функции `auto_confirm_demo_partner`,
   `send_bot_reply`, `extend_deadline`.

Перед выполнением `01_schema.sql` нужно один раз включить расширение
`pg_cron`: Database → Extensions → найти `pg_cron` → включить.

## Переменные окружения

Код подключается к базе через `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`
(см. `.env.local.example` в корне проекта). Эти значения — не секрет
(`anon`/`publishable` ключ предназначен для фронтенда), но сам файл
`.env.local` в git не кладём.

**Никогда не коммить и не публикуй** `service_role`/`secret` ключ Supabase —
он даёт полный доступ к базе в обход защиты (RLS).
