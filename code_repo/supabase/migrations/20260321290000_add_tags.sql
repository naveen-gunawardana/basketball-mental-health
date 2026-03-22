alter table public.resources
  add column sport text not null default 'All Sports',
  add column media_type text not null default 'Article';

-- Explicitly tag the seeded articles (defaults already handle this, but be explicit)
update public.resources set sport = 'All Sports', media_type = 'Article'
where slug in (
  'pre-game-confidence-routine',
  'dealing-with-mistakes-during-games',
  'setting-weekly-mental-goals',
  'how-to-stay-motivated-during-a-plateau',
  'the-practice-to-game-gap',
  'how-to-talk-to-your-coach-about-playing-time',
  'pre-competition-anxiety'
);
