alter table notes add column if not exists source text;

create index if not exists notes_source_idx on notes (source) where source is not null;
