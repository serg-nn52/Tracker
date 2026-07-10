-- Создание таблицы sessions

-- Включаем расширение UUID
create extension if not exists "pgcrypto";

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  duration integer not null, -- в миллисекундах
  date date not null,
  created_at timestamptz default now()
);

-- Индексы для быстрых запросов
create index if not exists idx_sessions_user_id on sessions(user_id);
create index if not exists idx_sessions_date on sessions(date);
create index if not exists idx_sessions_user_date on sessions(user_id, date);

-- Включаем Row Level Security
alter table sessions enable row level security;

-- Политика: пользователь видит только свои сессии
create policy "Users can view own sessions"
  on sessions for select
  using (auth.uid() = user_id);

-- Политика: пользователь создаёт только свои сессии
create policy "Users can create own sessions"
  on sessions for insert
  with check (auth.uid() = user_id);

-- Политика: пользователь удаляет только свои сессии
create policy "Users can delete own sessions"
  on sessions for delete
  using (auth.uid() = user_id);
