-- =============================================================================
-- 016 — Per-card “Why choose us” items (editable + per-item enabled)
-- Safe to re-run.
-- =============================================================================

alter table public.cards
  add column if not exists why_choose_items jsonb not null default '[
    {"id":"client-first","title":"Client First Approach","description":"Every recommendation starts with your goals and risk profile.","enabled":true},
    {"id":"transparent","title":"Transparent Advice","description":"Clear options, honest trade-offs — no pressure tactics.","enabled":true},
    {"id":"best-options","title":"Best Options","description":"Curated plans across segments so you choose with confidence.","enabled":true},
    {"id":"claims","title":"Claim Assistance","description":"Hands-on support when you need documentation and follow-ups.","enabled":true},
    {"id":"after-sales","title":"After Sales Support","description":"Ongoing guidance after purchase — not just at signup.","enabled":true},
    {"id":"relationship","title":"Long Term Relationship","description":"A lasting partnership for protection, growth, and beyond.","enabled":true}
  ]'::jsonb;

comment on column public.cards.why_choose_items is
  'Mini-site Why Choose Us items: title, description, and enabled flag per item.';
