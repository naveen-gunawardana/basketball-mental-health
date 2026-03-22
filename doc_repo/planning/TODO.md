# TODO

## Vercel / Production Setup
- [ ] Upgrade Vercel to Pro plan (required for cron jobs)
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel environment variables
- [ ] Add `NEXT_PUBLIC_SITE_URL=https://mentalitysports.com` to Vercel environment variables
- [ ] Add `CRON_SECRET=mentality-cron-2026` to Vercel environment variables
- [ ] Set up custom sender domain in Resend so emails come from `@mentalitysports.com`
- [ ] Test all email flows end-to-end: welcome, match created, mentor approved, call scheduled, new message, article approved, call reminder

## Supabase
- [ ] Decide on email verification — currently signup goes straight to dashboard without verifying email

## Done
- [x] RESEND_API_KEY added to .env.local and Vercel env vars
- [x] Wire match_created email in admin page
- [x] CRON_SECRET added to .env.local
- [x] vercel.json created with hourly cron config
- [x] All Vercel build lint errors fixed
- [x] Timezone display on scheduled calls
- [x] Terms/privacy checkbox on signup
- [x] Dynamic recommended articles (pulled from DB, no hardcoded slugs)
- [x] Orphaned /sessions page redirects to /dashboard
