-- Manual Super Admin approval for self-registered users

alter table public.users
  add column if not exists is_approved boolean not null default false;

-- Existing accounts keep access (not locked out by this rollout)
update public.users
set is_approved = true
where is_approved = false;

-- Admins are always approved
update public.users
set is_approved = true
where role = 'admin';

comment on column public.users.is_approved is
  'False for new self-signups until Super Admin approves; admins and admin-created users are approved';
