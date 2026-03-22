-- Add approval column to mentor_profiles
alter table mentor_profiles add column if not exists approved boolean default false not null;
