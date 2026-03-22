-- Add avatar_url to profiles
alter table public.profiles add column avatar_url text;

-- Create avatars storage bucket (public so images load without auth)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

-- Storage RLS: files are stored as avatars/{user_id}/avatar
create policy "Users can upload own avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own avatar" on storage.objects
  for update using (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own avatar" on storage.objects
  for delete using (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Avatars are publicly readable" on storage.objects
  for select using (bucket_id = 'avatars');
