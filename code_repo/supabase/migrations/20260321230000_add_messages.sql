create table public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Match participants can read messages
create policy "Match participants can read messages" on public.messages
  for select using (
    auth.uid() = sender_id or
    exists (
      select 1 from public.matches m
      where m.id = match_id
        and (m.player_id = auth.uid() or m.mentor_id = auth.uid())
    )
  );

-- Match participants can send messages
create policy "Match participants can insert messages" on public.messages
  for insert with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.matches m
      where m.id = match_id
        and (m.player_id = auth.uid() or m.mentor_id = auth.uid())
    )
  );

-- Admin can read all messages
create policy "Admin can read all messages" on public.messages
  for select using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
