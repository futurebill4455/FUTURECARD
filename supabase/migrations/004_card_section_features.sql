-- Card section feature toggles
-- Admin grants live on users.card_sections (per account)
-- User preferences live on cards.features_enabled (per card)
-- Effective visibility = admin grant AND user preference (default true)

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
