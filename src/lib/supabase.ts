import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // Если видишь эту ошибку в консоли — не создан .env.local (см. .env.local.example)
  // и/или dev-сервер не перезапущен после его создания.
  throw new Error(
    'Не заданы VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Создай .env.local в корне проекта по образцу .env.local.example.'
  );
}

export const supabase = createClient(url, anonKey);
