create table if not exists ai_coding_oss_top5_items (
  id bigserial primary key,

  -- Report identity.
  brief_date date not null,
  digest_run_at timestamptz not null default now(),
  digest_rank integer not null,

  -- Repository identity.
  repo_owner text not null,
  repo_name text not null,
  project_name text not null,
  repo_url text not null,

  -- Display content from the daily HTML brief.
  positioning text not null,
  primary_language text,
  momentum_text text not null,
  recent_update_text text,
  recent_update_date date,
  labels text[] not null default '{}'::text[],
  brief_summary text,

  -- Traceability helpers.
  source_links jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint ai_coding_oss_top5_items_rank_check
    check (digest_rank between 1 and 5),
  constraint ai_coding_oss_top5_items_brief_date_repo_url_key
    unique (brief_date, repo_url),
  constraint ai_coding_oss_top5_items_brief_date_rank_key
    unique (brief_date, digest_rank)
);

create index if not exists ai_coding_oss_top5_items_brief_date_idx
  on ai_coding_oss_top5_items (brief_date desc);

create index if not exists ai_coding_oss_top5_items_project_name_idx
  on ai_coding_oss_top5_items (project_name);

create index if not exists ai_coding_oss_top5_items_labels_idx
  on ai_coding_oss_top5_items using gin (labels);

create index if not exists ai_coding_oss_top5_items_metadata_idx
  on ai_coding_oss_top5_items using gin (metadata);
