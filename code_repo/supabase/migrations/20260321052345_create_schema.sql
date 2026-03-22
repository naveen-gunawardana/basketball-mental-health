-- ─── TABLES ───────────────────────────────────────────────────────────────────

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  role text not null check (role in ('player', 'mentor')),
  sport text,
  created_at timestamptz default now()
);

create table public.player_profiles (
  id uuid references public.profiles on delete cascade primary key,
  age int, school text, grade text, level text,
  challenges text[], goal text, availability text
);

create table public.mentor_profiles (
  id uuid references public.profiles on delete cascade primary key,
  college text, years_played int, skills text[], why text, availability text
);

create table public.matches (
  id uuid default gen_random_uuid() primary key,
  player_id uuid references public.profiles on delete cascade not null,
  mentor_id uuid references public.profiles on delete cascade not null,
  status text default 'active' check (status in ('active', 'inactive', 'pending')),
  created_at timestamptz default now()
);

create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matches on delete cascade not null,
  date timestamptz default now(),
  duration int,
  topics text[],
  mood int check (mood between 1 and 10),
  notes text,
  rating int check (rating between 1 and 5),
  flagged boolean default false,
  flag_reason text,
  logged_by uuid references public.profiles not null,
  created_at timestamptz default now()
);

create table public.weekly_goals (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matches on delete cascade not null,
  week_start date default current_date,
  effort_description text, effort_score int check (effort_score between 1 and 5),
  attitude_description text, attitude_score int check (attitude_score between 1 and 5),
  focus_description text, focus_score int check (focus_score between 1 and 5),
  created_at timestamptz default now()
);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.player_profiles enable row level security;
alter table public.mentor_profiles enable row level security;
alter table public.matches enable row level security;
alter table public.sessions enable row level security;
alter table public.weekly_goals enable row level security;

-- profiles
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can view own or matched profile" on public.profiles for select using (
  auth.uid() = id or
  exists (select 1 from public.matches where (matches.player_id = auth.uid() and matches.mentor_id = id) or (matches.mentor_id = auth.uid() and matches.player_id = id))
);

-- player_profiles
create policy "Insert own player profile" on public.player_profiles for insert with check (auth.uid() = id);
create policy "Update own player profile" on public.player_profiles for update using (auth.uid() = id);
create policy "View player profile" on public.player_profiles for select using (
  auth.uid() = id or exists (select 1 from public.matches where matches.player_id = id and matches.mentor_id = auth.uid())
);

-- mentor_profiles
create policy "Insert own mentor profile" on public.mentor_profiles for insert with check (auth.uid() = id);
create policy "Update own mentor profile" on public.mentor_profiles for update using (auth.uid() = id);
create policy "View mentor profile" on public.mentor_profiles for select using (
  auth.uid() = id or exists (select 1 from public.matches where matches.mentor_id = id and matches.player_id = auth.uid())
);

-- matches
create policy "Match participants can view matches" on public.matches for select using (auth.uid() = player_id or auth.uid() = mentor_id);

-- sessions
create policy "Match participants can view sessions" on public.sessions for select using (
  exists (select 1 from public.matches where matches.id = sessions.match_id and (matches.player_id = auth.uid() or matches.mentor_id = auth.uid()))
);
create policy "Match participants can insert sessions" on public.sessions for insert with check (
  auth.uid() = logged_by and
  exists (select 1 from public.matches where matches.id = match_id and (matches.player_id = auth.uid() or matches.mentor_id = auth.uid()))
);

-- weekly_goals
create policy "Match participants can view goals" on public.weekly_goals for select using (
  exists (select 1 from public.matches where matches.id = weekly_goals.match_id and (matches.player_id = auth.uid() or matches.mentor_id = auth.uid()))
);
create policy "Mentors can insert goals" on public.weekly_goals for insert with check (
  exists (select 1 from public.matches where matches.id = match_id and matches.mentor_id = auth.uid())
);
create policy "Mentors can update goals" on public.weekly_goals for update using (
  exists (select 1 from public.matches where matches.id = weekly_goals.match_id and matches.mentor_id = auth.uid())
);
