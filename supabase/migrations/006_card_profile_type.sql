-- Per-card profile / template type (Super Admin controlled)
-- individual | business | shop

alter table public.cards
  add column if not exists profile_type text not null default 'business';

alter table public.cards
  drop constraint if exists cards_profile_type_check;

alter table public.cards
  add constraint cards_profile_type_check
  check (profile_type in ('individual', 'business', 'shop'));

comment on column public.cards.profile_type is
  'Public mini-site template preset: individual, business, or shop (Super Admin only)';
