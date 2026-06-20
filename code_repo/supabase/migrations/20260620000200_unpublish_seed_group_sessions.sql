-- The platform-expansion seed shipped three demo group sessions with
-- placeholder hosts (Coach Marcus / Jordan Rivera / Sam Carter). Unpublish them
-- so the live Group Sessions page shows the "more coming soon" state until real
-- sessions are scheduled. Safe + idempotent.
update public.group_sessions
set status = 'draft'
where slug in (
  'handling-pressure-moments',
  'rebuilding-confidence-after-a-slump',
  'the-mental-side-of-injury-recovery'
);
