-- Expand player_profiles: add location and parent/guardian contact fields
ALTER TABLE player_profiles
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS parent_name text,
  ADD COLUMN IF NOT EXISTS parent_email text,
  ADD COLUMN IF NOT EXISTS parent_phone text;

-- Expand mentor_profiles: rename college → institution, add playing level, location, mentee age preference, bio
ALTER TABLE mentor_profiles RENAME COLUMN college TO institution;

ALTER TABLE mentor_profiles
  ADD COLUMN IF NOT EXISTS playing_level text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS mentee_age_pref text,
  ADD COLUMN IF NOT EXISTS bio text;
