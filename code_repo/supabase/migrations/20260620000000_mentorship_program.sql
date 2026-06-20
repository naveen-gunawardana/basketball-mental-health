-- ════════════════════════════════════════════════════════════════════════════
-- MENTORSHIP → TIME-BOXED PROGRAM
--
-- The flagship 1-on-1 mentorship stops being open-ended and becomes a structured
-- 1-month program: 4 meetings, one per week. The `matches` row is reframed as the
-- "program engagement" — it gains a start/end window, a completion stamp, and a
-- 'completed' status so finished programs archive out of the active Locker Room.
--
-- This change is ADDITIVE and backward compatible: existing `active` rows keep
-- working unchanged. The data conversion of live matches is a SEPARATE migration
-- (20260620000100_migrate_live_matches.sql) so it can be reviewed and applied
-- deliberately against production.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Program window on the engagement ─────────────────────────────────────────
alter table public.matches
  add column if not exists program_start date,
  add column if not exists program_end   date,
  add column if not exists completed_at   timestamptz;

comment on column public.matches.program_start is 'First day of the 1-month program (meeting 1 week).';
comment on column public.matches.program_end   is 'Last day of the 1-month program (program_start + 28 days).';
comment on column public.matches.completed_at  is 'Set when the 4-meeting program finishes; engagement archives out of the active hub.';

-- Widen the status check to include 'completed'.
alter table public.matches drop constraint if exists matches_status_check;
alter table public.matches
  add constraint matches_status_check
  check (status in ('active', 'inactive', 'pending', 'completed'));

-- ─── Tie group-session RSVPs to the member's account ──────────────────────────
-- The RSVP route already requires a signed-in user (members-only). Recording the
-- user id lets the Locker Room show "your upcoming sessions". Writes still happen
-- through the service role; members get read access to their own rows.
alter table public.session_rsvps
  add column if not exists user_id uuid references auth.users on delete cascade;
create index if not exists session_rsvps_user_id_idx on public.session_rsvps (user_id);

drop policy if exists "Users read own rsvps" on public.session_rsvps;
create policy "Users read own rsvps" on public.session_rsvps
  for select using (auth.uid() = user_id);
