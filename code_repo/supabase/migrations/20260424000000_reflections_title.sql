-- Add optional title to standalone player reflections.
alter table public.reflections add column if not exists title text;
