-- =============================================================================
-- 014 — Ensure cards columns required by create/update APIs exist
-- Safe to re-run. Fixes /api/cards 500s when 004/006/010/011 were never applied.
-- Does not require background_animations FK (slug is plain text here).
-- =============================================================================

alter table public.cards
  add column if not exists features_enabled jsonb not null default '{
    "identityCard": true,
    "about": true,
    "stats": true,
    "whyChoose": true,
    "services": true,
    "portfolio": true,
    "reviews": true,
    "qrTerminal": true,
    "connect": true,
    "finalCta": true
  }'::jsonb;

alter table public.cards
  add column if not exists profile_type text not null default 'business';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cards_profile_type_check'
  ) then
    alter table public.cards
      add constraint cards_profile_type_check
      check (profile_type in ('individual', 'business', 'shop'));
  end if;
exception
  when duplicate_object then null;
end $$;

-- Prefer plain text (no FK) so inserts succeed even if catalog table is missing.
-- If an older FK exists from migration 010, leave it — app strips slug on 23503.
alter table public.cards
  add column if not exists background_animation_slug text;

alter table public.cards
  add column if not exists background_slideshow_images jsonb not null default '[]'::jsonb;

comment on column public.cards.features_enabled is
  'Per-card section toggles (intersected with users.card_sections).';

comment on column public.cards.profile_type is
  'Public mini-site template preset: individual, business, or shop.';

comment on column public.cards.background_animation_slug is
  'Selected background animation slug (catalog optional).';

comment on column public.cards.background_slideshow_images is
  '2–5 image URLs when slideshow background is selected.';
