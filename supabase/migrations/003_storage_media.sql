-- Public media bucket for profile images, backgrounds, gallery videos
-- Run in Supabase SQL Editor (safe to re-run)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  41943040,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Wipe conflicting policies, then recreate wide public read + write
-- (API uploads use service_role; public bucket needs SELECT for browser display)
drop policy if exists "Public read media" on storage.objects;
drop policy if exists "Service uploads media" on storage.objects;
drop policy if exists "Service update media" on storage.objects;
drop policy if exists "Service delete media" on storage.objects;
drop policy if exists "Anyone can upload media" on storage.objects;
drop policy if exists "Anyone can update media" on storage.objects;
drop policy if exists "Anyone can delete media" on storage.objects;

create policy "Public read media"
  on storage.objects for select
  to public
  using (bucket_id = 'media');

-- Allow inserts (service_role bypasses RLS, but these keep anon/authenticated tooling working)
create policy "Anyone can upload media"
  on storage.objects for insert
  to public
  with check (bucket_id = 'media');

create policy "Anyone can update media"
  on storage.objects for update
  to public
  using (bucket_id = 'media');

create policy "Anyone can delete media"
  on storage.objects for delete
  to public
  using (bucket_id = 'media');
