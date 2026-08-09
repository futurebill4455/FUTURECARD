-- =============================================================================
-- Ensure background_animations exists, is seeded, and is readable via RLS
-- =============================================================================
-- This app authenticates with NextAuth (not Supabase Auth). The API normally
-- uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS). If the app falls back to the
-- anon key, open SELECT policies are required for the picker to work.
-- =============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.background_animations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  thumbnail_url text not null default '',
  animation_type text not null default 'effect'
    check (animation_type in ('effect', 'slideshow')),
  is_active boolean not null default true,
  is_default boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint background_animations_slug_format check (
    slug ~ '^[a-z0-9_]+$'
  )
);

-- Older installs may lack animation_type
alter table public.background_animations
  add column if not exists animation_type text;

update public.background_animations
set animation_type = coalesce(nullif(animation_type, ''), 'effect')
where animation_type is null or animation_type = '';

do $$
begin
  alter table public.background_animations
    alter column animation_type set default 'effect';
exception when others then
  null;
end $$;

do $$
begin
  alter table public.background_animations
    alter column animation_type set not null;
exception when others then
  null;
end $$;

create unique index if not exists background_animations_one_default_idx
  on public.background_animations (is_default)
  where is_default = true;

create index if not exists background_animations_active_sort_idx
  on public.background_animations (is_active, sort_order);

alter table public.cards
  add column if not exists background_animation_slug text;

alter table public.cards
  add column if not exists background_slideshow_images jsonb not null default '[]'::jsonb;

-- Seed designs
insert into public.background_animations
  (slug, name, description, thumbnail_url, animation_type, is_active, is_default, sort_order)
values
  (
    'design_a_particles',
    'Particles',
    'Floating luminous particles for a premium futuristic stage.',
    '/bg-previews/particles.svg',
    'effect',
    true,
    true,
    10
  ),
  (
    'design_b_waves',
    'Waves',
    'Soft animated energy waves behind your profile.',
    '/bg-previews/waves.svg',
    'effect',
    true,
    false,
    20
  ),
  (
    'design_c_geometric',
    'Geometric',
    'Rotating geometric accents with clean neon edges.',
    '/bg-previews/geometric.svg',
    'effect',
    true,
    false,
    30
  ),
  (
    'design_d_none',
    'Minimal',
    'No motion — clean dark stage for maximum focus.',
    '/bg-previews/none.svg',
    'effect',
    true,
    false,
    40
  ),
  (
    'design_e_slideshow',
    'Photo Slideshow',
    'Full-bleed cross-fade + Ken Burns photo background. Upload 2–5 images on your card.',
    '/bg-previews/slideshow.svg',
    'slideshow',
    true,
    false,
    50
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  thumbnail_url = excluded.thumbnail_url,
  animation_type = excluded.animation_type,
  is_active = true,
  sort_order = excluded.sort_order,
  updated_at = now();

-- Ensure exactly one default (Particles if none)
update public.background_animations set is_default = false where is_default = true;
update public.background_animations
set is_default = true
where slug = 'design_a_particles';

-- ---------------------------------------------------------------------------
-- RLS: allow SELECT for everyone (anon + authenticated)
-- Writes remain service_role / table owner only.
-- ---------------------------------------------------------------------------
alter table public.background_animations enable row level security;

drop policy if exists "Anyone can read background animations" on public.background_animations;
drop policy if exists "Authenticated read background animations" on public.background_animations;
drop policy if exists "Public read active background animations" on public.background_animations;

create policy "Anyone can read background animations"
  on public.background_animations
  for select
  to anon, authenticated
  using (true);

grant usage on schema public to anon, authenticated;
grant select on table public.background_animations to anon, authenticated;
