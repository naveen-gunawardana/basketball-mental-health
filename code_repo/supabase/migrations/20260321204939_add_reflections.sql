create table public.reflections (
  id uuid default gen_random_uuid() primary key,
  player_id uuid references public.profiles on delete cascade not null,
  content text not null,
  shared_with_mentor boolean default false not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.reflections enable row level security;

-- Players can do everything with their own reflections
create policy "Players can insert own reflections" on public.reflections
  for insert with check (auth.uid() = player_id);

create policy "Players can view own reflections" on public.reflections
  for select using (auth.uid() = player_id);

create policy "Players can update own reflections" on public.reflections
  for update using (auth.uid() = player_id);

create policy "Players can delete own reflections" on public.reflections
  for delete using (auth.uid() = player_id);

-- Mentors can only read reflections that are shared, and only for their matched players
create policy "Mentors can view shared reflections from mentees" on public.reflections
  for select using (
    shared_with_mentor = true and
    exists (
      select 1 from public.matches
      where matches.player_id = reflections.player_id
        and matches.mentor_id = auth.uid()
        and matches.status = 'active'
    )
  );
