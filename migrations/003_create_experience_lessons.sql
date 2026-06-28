create table if not exists experience_lessons (
  id bigserial primary key,

  -- Stable key for dedupe, cross-reference, and future updates.
  lesson_key text not null,

  -- Human-readable classification.
  title text not null,
  domain text not null,
  project text,
  environment text,
  severity text not null default 'medium',
  status text not null default 'resolved',

  -- Core lesson content.
  context text not null,
  symptoms text[] not null default '{}'::text[],
  root_cause text not null,
  resolution text not null,
  prevention text,
  verification text,

  -- Evidence and reproducibility helpers.
  commands jsonb not null default '[]'::jsonb,
  artifacts jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}'::text[],
  metadata jsonb not null default '{}'::jsonb,

  learned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint experience_lessons_severity_check
    check (severity in ('low', 'medium', 'high', 'critical')),
  constraint experience_lessons_status_check
    check (status in ('open', 'resolved', 'workaround', 'obsolete'))
);

create unique index if not exists experience_lessons_lesson_key_idx
  on experience_lessons (lesson_key);

create index if not exists experience_lessons_domain_idx
  on experience_lessons (domain);

create index if not exists experience_lessons_project_idx
  on experience_lessons (project);

create index if not exists experience_lessons_learned_at_idx
  on experience_lessons (learned_at desc);

create index if not exists experience_lessons_symptoms_idx
  on experience_lessons using gin (symptoms);

create index if not exists experience_lessons_tags_idx
  on experience_lessons using gin (tags);

create index if not exists experience_lessons_metadata_idx
  on experience_lessons using gin (metadata);
