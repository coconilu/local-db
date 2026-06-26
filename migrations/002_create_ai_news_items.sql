create table if not exists ai_news_items (
  id bigserial primary key,

  -- Digest window that produced this item.
  digest_window_start timestamptz,
  digest_window_end timestamptz,
  digest_run_at timestamptz not null default now(),
  digest_rank integer,

  -- Main classification fields.
  priority text not null default 'medium',
  category text not null,
  signal_type text not null,
  verification_status text not null default 'unverified',

  -- Human-readable content.
  title text not null,
  source_name text not null,
  source_platform text,
  author_name text,
  published_at timestamptz,
  source_url text not null,
  summary text not null,
  why_it_matters text,

  -- Filtering and dedupe helpers.
  entities text[] not null default '{}'::text[],
  tags text[] not null default '{}'::text[],
  related_urls jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  content_hash text,

  -- User review fields.
  user_rating smallint,
  user_note text,
  is_archived boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint ai_news_items_priority_check
    check (priority in ('high', 'medium_high', 'medium', 'low')),
  constraint ai_news_items_signal_type_check
    check (signal_type in (
      'official',
      'news',
      'paper',
      'github',
      'x_opinion',
      'community',
      'blog'
    )),
  constraint ai_news_items_verification_status_check
    check (verification_status in (
      'official',
      'verified',
      'partially_verified',
      'unverified',
      'rumor'
    )),
  constraint ai_news_items_user_rating_check
    check (user_rating is null or user_rating between 1 and 5)
);

create unique index if not exists ai_news_items_content_hash_idx
  on ai_news_items (content_hash)
  where content_hash is not null;

create index if not exists ai_news_items_digest_run_at_idx
  on ai_news_items (digest_run_at desc);

create index if not exists ai_news_items_published_at_idx
  on ai_news_items (published_at desc);

create index if not exists ai_news_items_priority_idx
  on ai_news_items (priority);

create index if not exists ai_news_items_category_idx
  on ai_news_items (category);

create index if not exists ai_news_items_signal_type_idx
  on ai_news_items (signal_type);

create index if not exists ai_news_items_entities_idx
  on ai_news_items using gin (entities);

create index if not exists ai_news_items_tags_idx
  on ai_news_items using gin (tags);

create index if not exists ai_news_items_metadata_idx
  on ai_news_items using gin (metadata);
