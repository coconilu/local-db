create table if not exists notes (
  id bigserial primary key,
  content text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_created_at_idx on notes (created_at desc);
create index if not exists notes_tags_idx on notes using gin (tags);

create or replace function set_notes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists notes_set_updated_at on notes;
create trigger notes_set_updated_at
before update on notes
for each row
execute function set_notes_updated_at();
