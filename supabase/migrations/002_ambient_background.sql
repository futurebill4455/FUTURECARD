-- Ambient shell background (admin-configured video or 3-image slideshow)
alter table public.platform_settings
  add column if not exists ambient_mode text not null default 'gradient'
    check (ambient_mode in ('gradient', 'video', 'slideshow')),
  add column if not exists ambient_video text not null default '',
  add column if not exists ambient_images jsonb not null default '[]'::jsonb;
