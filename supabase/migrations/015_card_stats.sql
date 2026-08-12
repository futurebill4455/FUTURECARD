-- =============================================================================
-- 015 — Per-card mini-site stats / counters (editable from dashboard)
-- Safe to re-run.
-- =============================================================================

alter table public.cards
  add column if not exists stats jsonb not null default '[
    {"id":"years","value":5,"suffix":"+","label":"Years of Experience"},
    {"id":"clients","value":500,"suffix":"+","label":"Happy Clients"},
    {"id":"partners","value":20,"suffix":"+","label":"Partner Companies"},
    {"id":"support","value":24,"display":"24/7","label":"Support Available"}
  ]'::jsonb;

comment on column public.cards.stats is
  'Mini-site stats counters: years, clients, partners, support (label/value/suffix/display).';
