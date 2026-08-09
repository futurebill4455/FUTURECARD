-- =============================================================================
-- Background animation catalog (admin-managed) + per-card selection
-- =============================================================================

create table if not exists public.background_animations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  thumbnail_url text not null default '',
  is_active boolean not null default true,
  is_default boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint background_animations_slug_format check (
    slug ~ '^[a-z0-9_]+$'
  )
);

create unique index if not exists background_animations_one_default_idx
  on public.background_animations (is_default)
  where is_default = true;

create index if not exists background_animations_active_sort_idx
  on public.background_animations (is_active, sort_order);

alter table public.cards
  add column if not exists background_animation_slug text
    references public.background_animations (slug)
    on delete set null
    on update cascade;

comment on column public.cards.background_animation_slug is
  'User-selected mini-site background animation (must be an active catalog design).';

-- Seed built-in designs (idempotent)
insert into public.background_animations
  (slug, name, description, thumbnail_url, is_active, is_default, sort_order)
values
  (
    'design_a_particles',
    'Particles',
    'Floating luminous particles for a premium futuristic stage.',
    '/bg-previews/particles.svg',
    true,
    true,
    10
  ),
  (
    'design_b_waves',
    'Waves',
    'Soft animated energy waves behind your profile.',
    '/bg-previews/waves.svg',
    true,
    false,
    20
  ),
  (
    'design_c_geometric',
    'Geometric',
    'Rotating geometric accents with clean neon edges.',
    '/bg-previews/geometric.svg',
    true,
    false,
    30
  ),
  (
    'design_d_none',
    'Minimal',
    'No motion — clean dark stage for maximum focus.',
    '/bg-previews/none.svg',
    true,
    false,
    40
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  thumbnail_url = excluded.thumbnail_url,
  sort_order = excluded.sort_order,
  updated_at = now();
