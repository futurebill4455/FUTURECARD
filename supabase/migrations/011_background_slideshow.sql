-- =============================================================================
-- Photo slideshow background type + per-card slideshow images
-- =============================================================================

alter table public.background_animations
  add column if not exists animation_type text not null default 'effect'
    check (animation_type in ('effect', 'slideshow'));

comment on column public.background_animations.animation_type is
  'effect = motion overlay; slideshow = cross-fade photo background (user images on card).';

alter table public.cards
  add column if not exists background_slideshow_images jsonb not null default '[]'::jsonb;

comment on column public.cards.background_slideshow_images is
  '2–5 public image URLs for mini-site photo slideshow when background_animation_slug is a slideshow design.';

-- Seed Photo Slideshow design (admin can activate / set default)
insert into public.background_animations
  (slug, name, description, thumbnail_url, animation_type, is_active, is_default, sort_order)
values
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
  sort_order = excluded.sort_order,
  updated_at = now();

-- Mark existing seeded designs as effect (idempotent)
update public.background_animations
set animation_type = 'effect'
where slug in (
  'design_a_particles',
  'design_b_waves',
  'design_c_geometric',
  'design_d_none'
)
and animation_type is distinct from 'effect';
