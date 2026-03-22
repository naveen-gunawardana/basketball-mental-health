# TODO

## Email & Notifications
- Welcome email when a player or mentor signs up
- Confirmation email when a match is created (intro both parties)
- Email notification when a call is scheduled (to the other person)
- Reminder email before a scheduled call (e.g. 1 hour before)
- Notification when a new message is received (for users not actively on the platform)
- Email when a mentor's article is approved and goes live
- Email when a mentor application is approved

## Resend API Key
- Sign up at resend.com, create an API key, and add `RESEND_API_KEY=re_...` to `.env.local` (and Vercel env vars) to enable all email notifications

## Vercel / Production Setup
- Add `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, and `CRON_SECRET` to Vercel environment variables
- Add `vercel.json` with cron config to call `/api/cron/call-reminders?secret=YOUR_SECRET` every hour (`0 * * * *`) for call reminder emails
- Verify Supabase email confirmation is enabled (or disabled) intentionally — currently signup goes straight to dashboard without email verification
- Set up a custom sender domain in Resend so emails come from `@mentalitysports.com` (required to move off Resend's sandbox/test limits)
- Test all email flows end-to-end in production: welcome, match created, mentor approved, call scheduled, new message, article approved, call reminder
