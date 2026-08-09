-- =============================================================================
-- users.phone — required at signup (app-validated); optional for legacy rows
-- =============================================================================

alter table public.users
  add column if not exists phone text;

comment on column public.users.phone is
  'Mobile number collected at registration; required for new self-signups.';
