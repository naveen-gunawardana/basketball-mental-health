-- Personal reflections per user per session
create table public.session_reflections (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions on delete cascade not null,
  author_id uuid references public.profiles not null,
  body text not null,
  shared boolean default false not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(session_id, author_id)
);

alter table public.session_reflections enable row level security;

-- Authors can always manage their own reflections
create policy "Authors can manage own session reflections"
  on public.session_reflections
  for all
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- Match counterpart can view reflections the author chose to share
create policy "Counterpart can view shared session reflections"
  on public.session_reflections
  for select
  using (
    shared = true
    and auth.uid() != author_id
    and exists (
      select 1 from public.sessions s
      join public.matches m on m.id = s.match_id
      where s.id = session_reflections.session_id
        and (m.player_id = auth.uid() or m.mentor_id = auth.uid())
    )
  );

-- Allow either match participant to update session notes after the fact
create policy "Match participants can update sessions"
  on public.sessions
  for update
  using (
    exists (
      select 1 from public.matches
      where matches.id = sessions.match_id
        and (matches.player_id = auth.uid() or matches.mentor_id = auth.uid())
    )
  );
