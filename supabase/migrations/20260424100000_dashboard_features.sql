-- Mood on reflections + message reactions

alter table public.reflections add column if not exists mood text;

create table if not exists public.message_reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null,
  created_at timestamptz default now(),
  unique (message_id, user_id, emoji)
);

create index if not exists message_reactions_message_id_idx on public.message_reactions (message_id);

alter table public.message_reactions enable row level security;

drop policy if exists "read_reactions_on_my_match_messages" on public.message_reactions;
create policy "read_reactions_on_my_match_messages"
  on public.message_reactions for select using (
    exists (
      select 1 from public.messages m
      join public.matches mt on mt.id = m.match_id
      where m.id = message_id and (mt.mentor_id = auth.uid() or mt.player_id = auth.uid())
    )
  );

drop policy if exists "insert_my_reactions" on public.message_reactions;
create policy "insert_my_reactions"
  on public.message_reactions for insert with check (
    user_id = auth.uid() and exists (
      select 1 from public.messages m
      join public.matches mt on mt.id = m.match_id
      where m.id = message_id and (mt.mentor_id = auth.uid() or mt.player_id = auth.uid())
    )
  );

drop policy if exists "delete_my_reactions" on public.message_reactions;
create policy "delete_my_reactions"
  on public.message_reactions for delete using (user_id = auth.uid());
