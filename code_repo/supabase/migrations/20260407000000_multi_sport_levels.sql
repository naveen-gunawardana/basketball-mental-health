-- Change profiles.sport from text to text[]
ALTER TABLE profiles
  ALTER COLUMN sport TYPE text[]
  USING CASE WHEN sport IS NULL THEN NULL ELSE ARRAY[sport] END;

-- Change player_profiles.level from text to text[]
ALTER TABLE player_profiles
  ALTER COLUMN level TYPE text[]
  USING CASE WHEN level IS NULL THEN NULL ELSE ARRAY[level] END;

-- Change mentor_profiles.playing_level from text to text[]
ALTER TABLE mentor_profiles
  ALTER COLUMN playing_level TYPE text[]
  USING CASE WHEN playing_level IS NULL THEN NULL ELSE ARRAY[playing_level] END;
