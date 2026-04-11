create table if not exists public.session_reflections (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  shared boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, author_id)
);

alter table public.session_reflections enable row level security;

-- Author can read/write their own reflection
create policy "author can manage own reflection"
  on public.session_reflections
  for all
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

-- Other party in the session can read shared reflections
create policy "match partner can read shared reflections"
  on public.session_reflections
  for select
  using (
    shared = true
    and exists (
      select 1 from public.sessions s
      join public.matches m on m.id = s.match_id
      where s.id = session_id
        and (m.mentor_id = auth.uid() or m.player_id = auth.uid())
    )
  );
