-- =============================================================================
-- 013 — Ensure users columns required by registration exist
-- Safe to re-run. Fixes signup 500s when 004/005/007/009 were never applied.
-- =============================================================================

alter table public.users
  add column if not exists phone text;

alter table public.users
  add column if not exists is_approved boolean not null default false;

alter table public.users
  add column if not exists card_sections jsonb not null default '{
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

alter table public.users
  add column if not exists max_cards_limit integer not null default 1;

-- Existing admins should remain usable
update public.users
set is_approved = true
where role = 'admin' and is_approved = false;

comment on column public.users.phone is
  'Mobile number captured at signup (app-validated).';

comment on column public.users.is_approved is
  'Super-admin approval gate before a user can sign in.';

comment on column public.users.card_sections is
  'Per-account toggle map for digital card sections.';

comment on column public.users.max_cards_limit is
  'Max digital cards this account may create.';
