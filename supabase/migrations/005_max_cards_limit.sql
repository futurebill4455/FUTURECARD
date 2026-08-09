-- Per-user card usage limit (source of truth for create-card gating)
-- Keep in sync with users.limits.maxCards in application code

alter table public.users
  add column if not exists max_cards_limit integer not null default 1;

-- Backfill from existing limits JSON when present
update public.users
set max_cards_limit = greatest(
  1,
  coalesce(
    nullif((limits->>'maxCards')::integer, 0),
    1
  )
)
where true;

-- Keep future inserts honest if somehow null slips through
alter table public.users
  alter column max_cards_limit set default 1;

comment on column public.users.max_cards_limit is
  'Maximum digital cards this account may create (Super Admin controlled)';
