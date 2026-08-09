-- =============================================================================
-- FutureCard — Supabase / Postgres schema (REQUIRED)
-- =============================================================================
-- Run this in the Supabase SQL Editor (or via supabase db push).
-- The Next.js app uses @supabase/supabase-js with SUPABASE_SERVICE_ROLE_KEY.
-- Nested documents are stored as JSONB. Auth remains NextAuth + bcrypt.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  avatar text,
  is_active boolean not null default true,
  features jsonb not null default '{
    "services": true,
    "payment": true,
    "gallery": true,
    "inquiryForm": true,
    "socialLinks": true,
    "bankAndBrochures": true,
    "analytics": true,
    "customTheme": true,
    "verifiedBadge": true,
    "customDomain": false
  }'::jsonb,
  limits jsonb not null default '{
    "maxCards": 3,
    "maxServices": 10,
    "maxGalleryImages": 24,
    "maxGalleryVideos": 12
  }'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_email_idx on public.users (email);
create index if not exists users_role_idx on public.users (role);

-- ---------------------------------------------------------------------------
-- cards (includes custom domain mapping fields)
-- ---------------------------------------------------------------------------
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  username text not null unique,
  profile_image text,
  cover_image text,
  background_media_type text not null default 'none'
    check (background_media_type in ('none', 'slideshow', 'video')),
  background_images jsonb not null default '[]'::jsonb,
  background_video text,
  company_name text not null,
  job_title text not null,
  business_type text,
  business_category text,
  about_us text,
  gst_number text,
  email text,
  phone text,
  whatsapp_number text,
  website text,
  social_links jsonb not null default '{}'::jsonb,
  location jsonb not null default '{}'::jsonb,
  business_hours jsonb not null default '[]'::jsonb,
  theme jsonb not null default '{
    "backgroundColor": "#FFF1F2",
    "headerColor": "#BE123C",
    "buttonColor": "#E11D48"
  }'::jsonb,
  primary_ctas jsonb not null default '[]'::jsonb,
  extra_links jsonb not null default '{}'::jsonb,
  gallery_images jsonb not null default '[]'::jsonb,
  services jsonb not null default '[]'::jsonb,
  payment_info jsonb not null default '{}'::jsonb,
  bank_details jsonb not null default '{}'::jsonb,
  gallery_videos jsonb not null default '[]'::jsonb,
  action_buttons jsonb not null default '[]'::jsonb,
  is_verified boolean not null default false,
  -- Custom domain mapping (Super Admin approval flow)
  custom_domain text unique,
  custom_domain_status text not null default 'none'
    check (custom_domain_status in (
      'none', 'pending', 'approved', 'rejected', 'verified', 'failed'
    )),
  custom_domain_active boolean not null default false,
  custom_domain_requested_at timestamptz,
  custom_domain_reviewed_at timestamptz,
  is_active boolean not null default true,
  template text not null default 'classic',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cards_user_id_idx on public.cards (user_id);
create index if not exists cards_username_idx on public.cards (username);
create index if not exists cards_custom_domain_idx
  on public.cards (custom_domain)
  where custom_domain is not null;
create index if not exists cards_custom_domain_status_idx
  on public.cards (custom_domain_status);

-- ---------------------------------------------------------------------------
-- subscriptions (one per user)
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'basic', 'premium')),
  start_date timestamptz not null,
  end_date timestamptz not null,
  is_active boolean not null default true,
  auto_renew boolean not null default false,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'expired', 'cancelled')),
  amount numeric(12, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_plan_idx on public.subscriptions (plan);
create index if not exists subscriptions_active_idx
  on public.subscriptions (is_active);

-- ---------------------------------------------------------------------------
-- analytics events
-- ---------------------------------------------------------------------------
create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards (id) on delete cascade,
  event_type text not null
    check (event_type in ('view', 'click', 'action', 'share', 'save_contact')),
  event_detail text,
  ip_address text,
  user_agent text,
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists analytics_card_created_idx
  on public.analytics (card_id, created_at desc);
create index if not exists analytics_card_event_idx
  on public.analytics (card_id, event_type);

-- ---------------------------------------------------------------------------
-- platform_settings (singleton row key = 'default')
-- ---------------------------------------------------------------------------
create table if not exists public.platform_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique default 'default',
  admin_whatsapp_number text not null default '',
  company_website_url text not null default '',
  company_name text not null default 'Future Shield',
  footer_tagline text not null default 'Verified digital visiting cards by Future Shield',
  platform_cname_target text not null default 'app.futurecard.pro',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.platform_settings (key)
values ('default')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists cards_set_updated_at on public.cards;
create trigger cards_set_updated_at
  before update on public.cards
  for each row execute function public.set_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

drop trigger if exists platform_settings_set_updated_at on public.platform_settings;
create trigger platform_settings_set_updated_at
  before update on public.platform_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Helpful view for Super Admin domain requests
-- ---------------------------------------------------------------------------
create or replace view public.custom_domain_requests as
select
  c.id as card_id,
  c.username,
  c.company_name,
  c.custom_domain,
  c.custom_domain_status,
  c.custom_domain_active,
  c.custom_domain_requested_at,
  c.custom_domain_reviewed_at,
  u.id as user_id,
  u.name as owner_name,
  u.email as owner_email,
  coalesce((u.features->>'customDomain')::boolean, false) as custom_domain_feature
from public.cards c
join public.users u on u.id = c.user_id
where c.custom_domain is not null and c.custom_domain <> '';

-- Optional RLS stubs (enable only after wiring Supabase Auth)
-- alter table public.users enable row level security;
-- alter table public.cards enable row level security;
-- alter table public.subscriptions enable row level security;
-- alter table public.analytics enable row level security;
-- alter table public.platform_settings enable row level security;
