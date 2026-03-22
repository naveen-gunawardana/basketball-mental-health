-- The existing profiles SELECT policy references the matches table, which causes
-- Supabase to return null for joined profile data (circular RLS evaluation).
-- Fix: allow any authenticated user to read basic profile info.
-- Detailed data (player_profiles, mentor_profiles) still has proper RLS.

drop policy if exists "Users can view own or matched profile" on public.profiles;

create policy "Authenticated users can view profiles" on public.profiles
  for select using (auth.role() = 'authenticated');
