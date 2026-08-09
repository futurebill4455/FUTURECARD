-- Landing page CMS (Hero, Features, Pricing, Testimonials, CTA, Footer)
-- Stored as JSONB on platform_settings for a single editable document

alter table public.platform_settings
  add column if not exists landing_cms jsonb not null default '{}'::jsonb;

comment on column public.platform_settings.landing_cms is
  'Super Admin–editable landing page content (hero, features, pricing, testimonials, cta, footer)';
