-- Backfill: auto-schedule an intro call for any active match that has no scheduled_calls row yet.
-- Time: 7 days from now, 17:00 UTC (10am PT / 1pm ET). Pairs are expected to reschedule.
insert into public.scheduled_calls (match_id, proposed_by, scheduled_at, note)
select
  m.id,
  m.mentor_id,
  date_trunc('day', now() + interval '7 days') + interval '17 hours',
  'Intro call — auto-scheduled. Reschedule if this time doesn''t work.'
from public.matches m
where m.status = 'active'
  and not exists (
    select 1 from public.scheduled_calls sc where sc.match_id = m.id
  );
