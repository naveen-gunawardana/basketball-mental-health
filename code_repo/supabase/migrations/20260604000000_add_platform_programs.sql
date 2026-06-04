-- ════════════════════════════════════════════════════════════════════════════
-- PLATFORM EXPANSION — Mentality Sports goes multi-program
--
-- Adds the data layer for four new programs alongside 1-on-1 mentorship:
--   • Group Sessions  (live virtual sessions w/ open RSVP)
--   • Newsletter      (subscribers + sent issue archive, powered by Resend)
--   • Training         (video courses / workout plans + per-user progress)
--   • Podcast          (episode catalog — seeded empty, "coming soon")
--
-- Admin role check uses the same JWT claim the rest of the app uses:
--   (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
-- Public reads are gated to "published"/"sent" rows. Privacy-sensitive writes
-- (RSVPs, subscriber rows) happen through server routes using the service role,
-- so no permissive anon INSERT policies are needed.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── GROUP SESSIONS ───────────────────────────────────────────────────────────
create table public.group_sessions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,                       -- markdown
  host_name text,
  host_title text,                        -- e.g. "Former D1 Guard"
  sport text,
  topic text,                             -- e.g. "Confidence", "Anxiety"
  starts_at timestamptz not null,
  duration_min int not null default 60,
  meeting_url text,                       -- virtual room (Jitsi / Zoom / Meet)
  capacity int,                           -- null = unlimited
  cover_url text,
  status text not null default 'published'
    check (status in ('draft', 'published', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);
create index group_sessions_starts_at_idx on public.group_sessions (starts_at);

alter table public.group_sessions enable row level security;
create policy "Published group sessions are public" on public.group_sessions
  for select using (status = 'published');
create policy "Admin full access to group sessions" on public.group_sessions
  for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ─── GROUP SESSION RSVPs ──────────────────────────────────────────────────────
create table public.session_rsvps (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.group_sessions on delete cascade,
  name text not null,
  email text not null,
  created_at timestamptz not null default now(),
  unique (session_id, email)
);
create index session_rsvps_session_id_idx on public.session_rsvps (session_id);

alter table public.session_rsvps enable row level security;
-- Writes/reads happen via the service role in server routes. Admins can also read.
create policy "Admin full access to rsvps" on public.session_rsvps
  for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ─── NEWSLETTER SUBSCRIBERS ───────────────────────────────────────────────────
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  status text not null default 'subscribed'
    check (status in ('subscribed', 'unsubscribed')),
  source text,                            -- where they signed up
  resend_contact_id text,                 -- mirror id in Resend audience
  unsubscribe_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

alter table public.newsletter_subscribers enable row level security;
-- Managed entirely through the service role (subscribe/unsubscribe routes).
-- Admins can read/manage the list from the admin console.
create policy "Admin full access to subscribers" on public.newsletter_subscribers
  for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ─── NEWSLETTER ISSUES (sent archive) ─────────────────────────────────────────
create table public.newsletter_issues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  subject text not null,
  title text not null,
  preview_text text,
  content text not null,                  -- markdown
  excerpt text,
  status text not null default 'draft'
    check (status in ('draft', 'sent')),
  resend_broadcast_id text,
  recipient_count int,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.newsletter_issues enable row level security;
create policy "Sent issues are public" on public.newsletter_issues
  for select using (status = 'sent');
create policy "Admin full access to issues" on public.newsletter_issues
  for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ─── TRAINING: COURSES ────────────────────────────────────────────────────────
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,                           -- one-liner for cards
  description text,                       -- markdown, full
  level text,                             -- Beginner / Intermediate / Advanced
  category text,                          -- Strength / Conditioning / Mental / Skills
  sport text,
  cover_url text,
  instructor text,
  status text not null default 'published'
    check (status in ('draft', 'published')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.courses enable row level security;
create policy "Published courses are public" on public.courses
  for select using (status = 'published');
create policy "Admin full access to courses" on public.courses
  for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ─── TRAINING: LESSONS ────────────────────────────────────────────────────────
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses on delete cascade,
  title text not null,
  slug text not null,
  content text,                           -- markdown notes
  video_url text,                         -- YouTube url or id
  duration text,                          -- e.g. "12 min"
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (course_id, slug)
);
create index lessons_course_id_idx on public.lessons (course_id);

alter table public.lessons enable row level security;
create policy "Lessons of published courses are public" on public.lessons
  for select using (
    exists (select 1 from public.courses c where c.id = lessons.course_id and c.status = 'published')
  );
create policy "Admin full access to lessons" on public.lessons
  for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ─── TRAINING: PER-USER LESSON PROGRESS ───────────────────────────────────────
create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  lesson_id uuid not null references public.lessons on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);
create index lesson_progress_user_id_idx on public.lesson_progress (user_id);

alter table public.lesson_progress enable row level security;
create policy "Users view own progress" on public.lesson_progress
  for select using (auth.uid() = user_id);
create policy "Users insert own progress" on public.lesson_progress
  for insert with check (auth.uid() = user_id);
create policy "Users delete own progress" on public.lesson_progress
  for delete using (auth.uid() = user_id);

-- ─── PODCAST EPISODES ─────────────────────────────────────────────────────────
create table public.podcast_episodes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  episode_number int,
  season int,
  spotify_url text,
  apple_url text,
  youtube_url text,
  audio_url text,
  duration text,
  status text not null default 'published'
    check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.podcast_episodes enable row level security;
create policy "Published episodes are public" on public.podcast_episodes
  for select using (status = 'published');
create policy "Admin full access to episodes" on public.podcast_episodes
  for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ════════════════════════════════════════════════════════════════════════════
-- SEED DATA
-- ════════════════════════════════════════════════════════════════════════════

-- ── Group sessions (upcoming, virtual) ──
insert into public.group_sessions (slug, title, description, host_name, host_title, sport, topic, starts_at, duration_min, meeting_url, capacity, status) values
(
  'handling-pressure-moments',
  'Handling Pressure Moments: A Live Workshop',
  E'## What we''ll cover\n\nEvery athlete knows the feeling — the game tightens, the crowd gets loud, and your body starts working against you. This live session breaks down what''s actually happening in your nervous system and gives you three tools you can use the very next time you compete.\n\nBring a notebook. We''ll do a short guided exercise together and leave time for an open Q&A.\n\n**This is a group session** — you''ll be on with other athletes working through the same thing. Come as you are.',
  'Coach Marcus',
  'Former D1 Guard',
  'General',
  'Pressure & Anxiety',
  '2026-06-12 18:00:00-07',
  60,
  'https://meet.jit.si/mentality-group-handling-pressure-moments',
  50,
  'published'
),
(
  'rebuilding-confidence-after-a-slump',
  'Rebuilding Confidence After a Slump',
  E'## You''re not broken — you''re in a dip\n\nSlumps mess with your head more than your body. In this session we''ll talk about why confidence disappears, why "just be confident" never works, and the small daily reps that actually rebuild belief.\n\nOpen to athletes of every sport and level. Hosted live with real talk and real questions.',
  'Jordan Rivera',
  'Former College Forward',
  'General',
  'Confidence',
  '2026-06-19 17:30:00-07',
  60,
  'https://meet.jit.si/mentality-group-rebuilding-confidence',
  50,
  'published'
),
(
  'the-mental-side-of-injury-recovery',
  'The Mental Side of Injury Recovery',
  E'## Coming back is half physical, half mental\n\nGetting cleared to play and feeling ready to play are two different things. This session is for any athlete working back from an injury — we''ll cover fear of re-injury, identity while you''re sidelined, and how to trust your body again.\n\nLed by an athlete who''s been through it. Bring your story if you want to share — or just listen.',
  'Sam Carter',
  'Former College Athlete',
  'General',
  'Injury Recovery',
  '2026-06-26 18:00:00-07',
  75,
  'https://meet.jit.si/mentality-group-injury-recovery',
  40,
  'published'
);

-- ── Newsletter: one sent issue so the archive isn't empty ──
insert into public.newsletter_issues (slug, subject, title, preview_text, content, excerpt, status, sent_at, recipient_count) values
(
  'the-mental-rep-issue-01',
  'The Mental Rep #01 — Why your brain treats games differently',
  'The Mental Rep #01',
  'The first issue: closing the practice-to-game gap.',
  E'## Welcome to The Mental Rep\n\nThis is the newsletter for athletes who train the mental game like they train everything else. Once or twice a month, we send one idea you can actually use — no fluff, no filler.\n\n## This issue: the practice-to-game gap\n\nYou''re a different player in practice. Clean release, fast reads, high confidence. Then the game starts and it all feels foreign. That''s not weakness — it''s neuroscience. Adrenaline shifts control of your brain toward instinct and away from the deliberate thinking you rely on in practice.\n\n**One thing to try this week:** before your next competition, run the exact same 5-minute warm-up routine. Same order, every time. You''re teaching your nervous system that game-day arousal is familiar, not threatening.\n\n## Want more?\n\nReply to this email and tell us what you''re working through. We read every one.\n\n— The Mentality Sports Team',
  'The first issue of The Mental Rep — closing the practice-to-game gap, plus one thing to try this week.',
  'sent',
  '2026-05-20 09:00:00-07',
  0
);

-- ── Training: one sample course with lessons ──
with c as (
  insert into public.courses (slug, title, summary, description, level, category, sport, instructor, status, sort_order)
  values (
    'mental-reps-confidence',
    'Mental Reps: The Confidence Course',
    'A 3-part video course on building durable, game-day confidence.',
    E'## Build confidence that holds up under pressure\n\nConfidence isn''t a personality trait — it''s a skill you train. This short course walks you through the mental reps that build belief you can actually rely on when the game is on the line.\n\nWatch at your own pace. Each lesson is short, practical, and ends with one thing to put into practice.',
    'Beginner',
    'Mental',
    'General',
    'Mentality Sports',
    'draft',
    1
  )
  returning id
)
insert into public.lessons (course_id, title, slug, content, video_url, duration, sort_order)
select c.id, v.title, v.slug, v.content, v.video_url, v.duration, v.sort_order
from c, (values
  ('What confidence actually is', 'what-confidence-actually-is', E'## Confidence is built, not born\n\nIn this opening lesson we reframe confidence as a trainable skill. Watch the video, then jot down one moment this week where your confidence wavered — we''ll use it later.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '8 min', 1),
  ('The pre-game routine', 'the-pre-game-routine', E'## Program your nervous system\n\nA consistent pre-game routine tells your brain it''s time to compete. Build yours in 5 minutes using the framework in this lesson.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '11 min', 2),
  ('Resetting after mistakes', 'resetting-after-mistakes', E'## The 3-second rule\n\nMistakes are inevitable; dwelling on them is optional. Learn the reset cue that the best competitors use to move to the next play.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '9 min', 3)
) as v(title, slug, content, video_url, duration, sort_order);
