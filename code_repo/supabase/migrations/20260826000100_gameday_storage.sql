-- ═══════════════════════════════════════════════════════════════════════════
-- Gameday storage.
--
-- Two buckets, created here rather than by hand in the dashboard so a fresh
-- environment comes up complete.
--
--   gameday-voice  private  — debrief voice notes
--   gameday-audio  public   — guided drill audio
-- ═══════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'gameday-voice',
    'gameday-voice',
    false,
    12582912,  -- 12 MB, roughly four minutes of m4a
    array['audio/m4a', 'audio/mp4', 'audio/mpeg', 'audio/aac', 'audio/x-m4a']
  ),
  (
    'gameday-audio',
    'gameday-audio',
    true,
    52428800,  -- 50 MB
    array['audio/mpeg', 'audio/mp4', 'audio/m4a', 'audio/aac']
  )
on conflict (id) do nothing;

-- ─── Voice notes ───────────────────────────────────────────────────────────
--
-- Objects are keyed `{athlete_id}/{uuid}.m4a`, so the first path segment is
-- the owner. Nobody at Mentality listens to these and there is no admin view
-- that surfaces them — the only reader is the athlete who recorded it.
--
-- The upload itself goes through /api/app/v1/voice/transcribe under the
-- service role, which bypasses these. They exist so a direct client read is
-- still scoped correctly, and so a leaked anon key can't walk the bucket.

drop policy if exists "Athletes read own voice notes" on storage.objects;
create policy "Athletes read own voice notes" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'gameday-voice'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Athletes write own voice notes" on storage.objects;
create policy "Athletes write own voice notes" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'gameday-voice'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Athletes delete own voice notes" on storage.objects;
create policy "Athletes delete own voice notes" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'gameday-voice'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ─── Drill audio ───────────────────────────────────────────────────────────
-- Published content. The bucket is public so the app can cache the files for
-- offline use without minting a signed URL per drill per launch; writes stay
-- restricted to the service role used by the admin tooling.

drop policy if exists "Anyone reads drill audio" on storage.objects;
create policy "Anyone reads drill audio" on storage.objects
  for select
  using (bucket_id = 'gameday-audio');
