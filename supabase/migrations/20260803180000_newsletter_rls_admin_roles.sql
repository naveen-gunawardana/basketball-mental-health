-- Align newsletter_subscribers/newsletter_issues RLS with the admin dashboard's
-- actual access model: middleware.ts already lets admin, outreach, and
-- operations roles into /admin/*, but these policies only checked for
-- role = 'admin', so outreach/operations saw an empty subscriber list and
-- could not save drafts on /admin/newsletter.

drop policy if exists "Admin full access to subscribers" on public.newsletter_subscribers;
create policy "Admin dashboard access to subscribers" on public.newsletter_subscribers
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'outreach', 'operations'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'outreach', 'operations'));

drop policy if exists "Admin full access to issues" on public.newsletter_issues;
create policy "Admin dashboard access to issues" on public.newsletter_issues
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'outreach', 'operations'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'outreach', 'operations'));
