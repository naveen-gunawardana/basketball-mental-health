-- ═══════════════════════════════════════════════════════════════════════════
-- Gameday — the Mentality Sports mobile app.
--
-- Runs against the same project the website uses, so an athlete who signed up
-- on mentalitysports.org signs into the app with the account they already have
-- and keeps their profile, mentor match, and message history.
--
-- Everything here is additive. The website's tables are untouched except for
-- one optional foreign key from `debriefs` into the existing `reflections`,
-- which is what lets an athlete share a single debrief with their mentor.
--
-- RLS on these tables is deliberately simpler than the site's: every row is
-- owned by exactly one athlete and nobody else can read it. The site's
-- policies are complex because mentors need scoped access to mentee data;
-- nothing in Gameday works that way.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Athlete settings ──────────────────────────────────────────────────────
-- Extends `profiles` with what the app needs and the website doesn't have.

create table if not exists public.athlete_settings (
  id                    uuid primary key references public.profiles on delete cascade,
  primary_sport         text not null default 'basketball',
  level                 text,
  position              text,
  focus_areas           text[] not null default '{}',
  anchor_word           text,
  baseline_pressure     int check (baseline_pressure between 1 and 10),
  baseline_body_areas   text[] not null default '{}',
  notifications_opt_in  boolean not null default false,
  tz                    text default 'America/New_York',
  season_start          date,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

comment on table public.athlete_settings is
  'Gameday app profile. One row per athlete, extends public.profiles.';

-- ─── Games ─────────────────────────────────────────────────────────────────
-- The core object. Sport-agnostic on purpose: a game is an event with a start
-- time and a venue, and the period structure lives in the app''s sport config.
-- Going the other way — from a basketball-specific schema to multi-sport — is
-- a migration nobody wants to run.

create table if not exists public.games (
  id          uuid primary key default gen_random_uuid(),
  athlete_id  uuid not null references public.profiles on delete cascade,
  sport       text not null,
  kind        text not null default 'game'
                check (kind in ('game','practice','tryout','meet','scrimmage')),
  opponent    text,
  starts_at   timestamptz not null,
  tz          text not null default 'America/New_York',
  venue       text check (venue in ('home','away','neutral')),
  status      text not null default 'upcoming'
                check (status in ('upcoming','live','complete','skipped')),
  result      text check (result in ('win','loss','draw')),
  created_at  timestamptz not null default now()
);

create index if not exists games_athlete_starts_idx
  on public.games (athlete_id, starts_at desc);

-- Drives the prep cron without scanning the whole table.
create index if not exists games_upcoming_idx
  on public.games (starts_at)
  where status = 'upcoming';

-- ─── Game entries ──────────────────────────────────────────────────────────
-- Typed columns for anything the app charts; jsonb for everything else, so a
-- new question in a check-in doesn''t need a migration.

create table if not exists public.game_entries (
  id            uuid primary key default gen_random_uuid(),
  game_id       uuid not null references public.games on delete cascade,
  athlete_id    uuid not null references public.profiles on delete cascade,
  phase         text not null
                  check (phase in ('night_before','walk_in','warmup','in_game')),
  pressure      int check (pressure between 1 and 10),
  energy        int check (energy between 1 and 10),
  valence       int check (valence between 1 and 10),
  arousal       int check (arousal between 1 and 10),
  sleep_hours   numeric(3,1) check (sleep_hours between 0 and 24),
  body_areas    text[] not null default '{}',
  controllable  text,
  payload       jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists game_entries_game_idx on public.game_entries (game_id);
create index if not exists game_entries_athlete_idx
  on public.game_entries (athlete_id, created_at desc);

-- ─── Debriefs ──────────────────────────────────────────────────────────────
-- One per game. The highest-value ninety seconds in the product.

create table if not exists public.debriefs (
  id                uuid primary key default gen_random_uuid(),
  game_id           uuid not null unique references public.games on delete cascade,
  athlete_id        uuid not null references public.profiles on delete cascade,
  performance       int not null check (performance between 1 and 10),
  effort            int check (effort between 1 and 10),
  mindset           int check (mindset between 1 and 10),
  routine_followed  boolean,
  worked            text[] not null default '{}',
  didnt             text[] not null default '{}',
  letting_go        text,
  voice_path        text,
  transcript        text,
  -- Optional, opt-in per debrief, defaults null. Writing this row is what
  -- makes an app journal entry visible to a web mentor, and the app never
  -- creates one without an explicit tap.
  reflection_id     uuid references public.reflections on delete set null,
  created_at        timestamptz not null default now()
);

create index if not exists debriefs_athlete_idx
  on public.debriefs (athlete_id, created_at desc);

-- ─── Routines ──────────────────────────────────────────────────────────────

create table if not exists public.routines (
  id          uuid primary key default gen_random_uuid(),
  athlete_id  uuid not null references public.profiles on delete cascade,
  kind        text not null check (kind in ('warmup','reset','wind_down','mistake')),
  name        text not null,
  is_default  boolean not null default false,
  anchor_word text,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index if not exists routines_athlete_idx on public.routines (athlete_id, kind);

create table if not exists public.routine_steps (
  id          uuid primary key default gen_random_uuid(),
  routine_id  uuid not null references public.routines on delete cascade,
  position    int not null,
  kind        text not null
                check (kind in ('breath','visualize','cue','movement','music','silence','custom')),
  label       text not null,
  seconds     int not null check (seconds between 1 and 3600),
  config      jsonb not null default '{}'::jsonb,
  unique (routine_id, position)
);

create index if not exists routine_steps_routine_idx
  on public.routine_steps (routine_id, position);

-- ─── Drills ────────────────────────────────────────────────────────────────
-- Content, authored on the website. The app ships a starter set bundled so day
-- one works offline; anything published later syncs down and is cached.

create table if not exists public.drills (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  category    text not null,
  sports      text[] not null default '{}',   -- empty means every sport
  seconds     int not null,
  blurb       text,
  script      jsonb not null default '{"steps":[]}'::jsonb,
  audio_path  text,
  published   boolean not null default false,
  version     int not null default 1,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index if not exists drills_published_idx
  on public.drills (version) where published = true;

create table if not exists public.drill_completions (
  id           uuid primary key default gen_random_uuid(),
  athlete_id   uuid not null references public.profiles on delete cascade,
  -- Bundled drills have no database row, so the slug is the stable key and the
  -- id is only filled in for drills that came down from the server.
  drill_slug   text not null,
  drill_id     uuid references public.drills on delete set null,
  helpful      boolean,
  completed_at timestamptz not null default now()
);

create index if not exists drill_completions_athlete_idx
  on public.drill_completions (athlete_id, completed_at desc);

-- ─── Push tokens ───────────────────────────────────────────────────────────
-- The timezone lives here so an hourly cron can resolve each athlete''s local
-- 9pm without a second lookup.

create table if not exists public.device_tokens (
  id          uuid primary key default gen_random_uuid(),
  athlete_id  uuid not null references public.profiles on delete cascade,
  token       text not null unique,
  platform    text not null check (platform in ('ios','android')),
  tz          text,
  last_seen   timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index if not exists device_tokens_athlete_idx on public.device_tokens (athlete_id);

-- ─── Notification ledger ───────────────────────────────────────────────────
-- The cap (three per game, one per non-game day) has to be enforced somewhere
-- the client can''t bypass. Every send is recorded here first, and the unique
-- constraint is what makes a double-fire impossible rather than unlikely.

create table if not exists public.notification_sends (
  id          uuid primary key default gen_random_uuid(),
  athlete_id  uuid not null references public.profiles on delete cascade,
  game_id     uuid references public.games on delete cascade,
  kind        text not null,
  sent_at     timestamptz not null default now(),
  unique (athlete_id, game_id, kind)
);

create index if not exists notification_sends_athlete_idx
  on public.notification_sends (athlete_id, sent_at desc);

-- ─── Insights ──────────────────────────────────────────────────────────────
-- Computed nightly, with a hard sample threshold. A confident-sounding claim
-- from four data points would poison trust in the whole feature, so the
-- evidence travels with the claim and nothing publishes under six games.

create table if not exists public.insights (
  id           uuid primary key default gen_random_uuid(),
  athlete_id   uuid not null references public.profiles on delete cascade,
  kind         text not null,
  title        text not null,
  body         text not null,
  evidence     jsonb not null default '{}'::jsonb,
  sample_size  int not null check (sample_size >= 6),
  generated_at timestamptz not null default now(),
  dismissed_at timestamptz,
  unique (athlete_id, kind)
);

create index if not exists insights_athlete_idx
  on public.insights (athlete_id, generated_at desc);

-- ═══════════════════════════════════════════════════════════════════════════
-- Row-level security
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.athlete_settings  enable row level security;
alter table public.games             enable row level security;
alter table public.game_entries      enable row level security;
alter table public.debriefs          enable row level security;
alter table public.routines          enable row level security;
alter table public.routine_steps     enable row level security;
alter table public.drills            enable row level security;
alter table public.drill_completions enable row level security;
alter table public.device_tokens     enable row level security;
alter table public.notification_sends enable row level security;
alter table public.insights          enable row level security;

-- Owner-only, one policy per table.
create policy "own settings" on public.athlete_settings
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own games" on public.games
  for all using (auth.uid() = athlete_id) with check (auth.uid() = athlete_id);

create policy "own entries" on public.game_entries
  for all using (auth.uid() = athlete_id) with check (auth.uid() = athlete_id);

create policy "own debriefs" on public.debriefs
  for all using (auth.uid() = athlete_id) with check (auth.uid() = athlete_id);

create policy "own routines" on public.routines
  for all using (auth.uid() = athlete_id) with check (auth.uid() = athlete_id);

-- Steps inherit through their parent rather than carrying a duplicate
-- athlete_id that could drift out of sync with it.
create policy "own routine steps" on public.routine_steps
  for all using (
    exists (
      select 1 from public.routines r
      where r.id = routine_steps.routine_id and r.athlete_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.routines r
      where r.id = routine_steps.routine_id and r.athlete_id = auth.uid()
    )
  );

create policy "own completions" on public.drill_completions
  for all using (auth.uid() = athlete_id) with check (auth.uid() = athlete_id);

create policy "own device tokens" on public.device_tokens
  for all using (auth.uid() = athlete_id) with check (auth.uid() = athlete_id);

create policy "own insights" on public.insights
  for select using (auth.uid() = athlete_id);

-- Athletes may dismiss an insight but never write one — those come from the
-- nightly job under the service role.
create policy "dismiss own insights" on public.insights
  for update using (auth.uid() = athlete_id) with check (auth.uid() = athlete_id);

-- Read-only to athletes; the ledger is written by the cron under service role.
create policy "own notification history" on public.notification_sends
  for select using (auth.uid() = athlete_id);

-- Drills are published content, readable by any signed-in athlete.
create policy "read published drills" on public.drills
  for select using (published = true);

-- ═══════════════════════════════════════════════════════════════════════════
-- Triggers
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists athlete_settings_touch on public.athlete_settings;
create trigger athlete_settings_touch
  before update on public.athlete_settings
  for each row execute function public.touch_updated_at();

drop trigger if exists routines_touch on public.routines;
create trigger routines_touch
  before update on public.routines
  for each row execute function public.touch_updated_at();

drop trigger if exists drills_touch on public.drills;
create trigger drills_touch
  before update on public.drills
  for each row execute function public.touch_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- Views
-- ═══════════════════════════════════════════════════════════════════════════

-- The Game Log, joined once so the insights job and the recap endpoint aren''t
-- each reassembling it. security_invoker keeps the caller''s RLS in force.
create or replace view public.v_game_log
with (security_invoker = true) as
select
  g.id            as game_id,
  g.athlete_id,
  g.sport,
  g.kind,
  g.opponent,
  g.starts_at,
  g.venue,
  g.status,
  g.result,
  e.pressure      as walk_in_pressure,
  e.sleep_hours,
  e.body_areas,
  e.controllable,
  d.performance,
  d.routine_followed,
  d.worked,
  d.didnt,
  d.letting_go,
  d.created_at    as debriefed_at
from public.games g
left join lateral (
  select * from public.game_entries
  where game_id = g.id and phase = 'walk_in'
  order by created_at desc
  limit 1
) e on true
left join public.debriefs d on d.game_id = g.id
where g.status <> 'skipped';

comment on view public.v_game_log is
  'One row per played game: what the athlete walked in with, what they walked out saying.';
