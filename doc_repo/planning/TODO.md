# TODO

## Backlog / Future
- [ ] Post-match onboarding flow — when a player/mentor gets matched, walk them through the dashboard UI (intro tour, highlight key features like chat, goal setting, scheduling calls)

## Still Pending
- [ ] Upgrade Vercel to Pro plan (required for hourly cron jobs — currently daily)
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel environment variables ← REQUIRED for signup + emails to work in prod
- [ ] Add `CRON_SECRET=mentality-cron-2026` to Vercel environment variables
- [ ] Test all email flows end-to-end: welcome, match created, mentor approved, call scheduled, new message, article approved, call reminder
- [ ] Reconnect Vercel GitHub integration for auto-deploys (Settings → Git)

## Done
- [x] RESEND_API_KEY added to .env.local and Vercel env vars
- [x] Resend sender domain set up for @mentalitysports.com
- [x] Wire match_created email in admin page
- [x] CRON_SECRET added to .env.local
- [x] vercel.json cron job configured (daily at midnight UTC)
- [x] All Vercel build type/lint errors fixed
- [x] Timezone display on scheduled calls
- [x] Terms/privacy checkbox on signup
- [x] Dynamic recommended articles (pulled from DB)
- [x] Orphaned /sessions page redirects to /dashboard
- [x] Email verification on signup with /verify-email page
- [x] Custom 404 page (not-found.tsx)
- [x] /colors route hidden in production
- [x] Favicons generated from logo.png (16, 32, 192, 512px + favicon.ico)
- [x] OG image + openGraph/twitter card metadata
- [x] Password reset PKCE flow fixed (/auth/callback route)
- [x] Supabase site URL updated to mentalitysports.com
- [x] mentalitysports.com domain added to Vercel
