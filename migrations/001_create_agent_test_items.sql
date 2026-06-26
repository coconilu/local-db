create table if not exists agent_test_items (
  id bigserial primary key,
  name text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
