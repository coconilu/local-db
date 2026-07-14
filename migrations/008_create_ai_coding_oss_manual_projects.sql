create table if not exists ai_coding_oss_manual_projects (
  id bigserial primary key,
  normalized_repo_url text not null unique,
  repo_owner text not null,
  repo_name text not null,
  project_name text not null,
  repo_url text not null,
  positioning text not null,
  primary_language text,
  momentum_text text not null,
  labels text[] not null default '{}'::text[],
  github_metadata jsonb not null default '{}'::jsonb,
  manual_mention_count integer not null default 1,
  analyzed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_coding_oss_manual_projects_manual_mention_count_check
    check (manual_mention_count >= 1)
);

create index if not exists ai_coding_oss_manual_projects_labels_idx
  on ai_coding_oss_manual_projects using gin (labels);

create index if not exists ai_coding_oss_manual_projects_github_metadata_idx
  on ai_coding_oss_manual_projects using gin (github_metadata);
