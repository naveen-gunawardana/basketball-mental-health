create table scheduled_calls (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade not null,
  proposed_by uuid references profiles(id) on delete cascade not null,
  scheduled_at timestamptz not null,
  note text,
  status text not null default 'upcoming' check (status in ('upcoming', 'cancelled')),
  created_at timestamptz default now()
);

alter table scheduled_calls enable row level security;

create policy "Match participants can view scheduled calls"
  on scheduled_calls for select using (
    match_id in (
      select id from matches where player_id = auth.uid() or mentor_id = auth.uid()
    )
  );

create policy "Match participants can propose calls"
  on scheduled_calls for insert with check (
    match_id in (
      select id from matches where player_id = auth.uid() or mentor_id = auth.uid()
    )
    and proposed_by = auth.uid()
  );

create policy "Match participants can cancel calls"
  on scheduled_calls for update using (
    match_id in (
      select id from matches where player_id = auth.uid() or mentor_id = auth.uid()
    )
  );
