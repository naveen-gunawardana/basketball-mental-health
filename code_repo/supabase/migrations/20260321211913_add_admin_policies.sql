-- Admin can read/write everything across all tables
-- Admin role is set in app_metadata (only settable server-side/via Supabase dashboard)

create policy "Admins can view all profiles" on public.profiles
  for select using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can view all player profiles" on public.player_profiles
  for select using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can view all mentor profiles" on public.mentor_profiles
  for select using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can view all matches" on public.matches
  for select using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can insert matches" on public.matches
  for insert with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update matches" on public.matches
  for update using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can view all sessions" on public.sessions
  for select using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can view all weekly goals" on public.weekly_goals
  for select using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can view all reflections" on public.reflections
  for select using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
