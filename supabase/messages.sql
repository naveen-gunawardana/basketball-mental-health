-- Messages table for mentor <-> mentee chat
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null
);

-- Index for fast lookups per match
create index if not exists messages_match_id_idx on messages(match_id, created_at);

-- Enable RLS
alter table messages enable row level security;

-- Only participants in the match can read
create policy "match participants can read messages"
  on messages for select
  using (
    exists (
      select 1 from matches
      where matches.id = messages.match_id
        and (matches.mentor_id = auth.uid() or matches.player_id = auth.uid())
    )
  );

-- Only participants can insert, and only as themselves
create policy "match participants can insert messages"
  on messages for insert
  with check (
    sender_id = auth.uid() and
    exists (
      select 1 from matches
      where matches.id = messages.match_id
        and (matches.mentor_id = auth.uid() or matches.player_id = auth.uid())
    )
  );

-- Enable Realtime for this table
alter publication supabase_realtime add table messages;
