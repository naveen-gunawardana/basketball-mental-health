-- ════════════════════════════════════════════════════════════════════════════
-- CONVERT LIVE MATCHES → PROGRAM ENGAGEMENTS  (data migration)
--
-- Run AFTER 20260620000000_mentorship_program.sql. The existing live matches
-- were open-ended relationships with no program window. We convert them into the
-- new program model by starting a fresh 1-month window from today, and we KEEP
-- them active — we deliberately do NOT auto-archive live mentorships just because
-- they were created a while ago. Completion is forward-looking: new programs (and
-- these, once their fresh month elapses) complete going forward, marked by the
-- mentor/admin. Idempotent: coalesce guards make re-running safe.
-- ════════════════════════════════════════════════════════════════════════════

update public.matches m
set program_start = coalesce(m.program_start, current_date),
    program_end   = coalesce(m.program_end,   current_date + 28)
where m.status = 'active';
