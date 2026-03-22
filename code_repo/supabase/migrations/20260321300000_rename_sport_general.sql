alter table public.resources alter column sport set default 'General';
update public.resources set sport = 'General' where sport = 'All Sports';
