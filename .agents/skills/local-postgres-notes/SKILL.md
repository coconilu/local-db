---
name: local-postgres-notes
description: Use when the user wants to add, read, update, delete, list, or search notes, inspect local PostgreSQL tables, run SQL, apply migration files, or verify data in the local-postgres Docker Compose database.
---

# Local PostgreSQL Notes

Use the project's Docker Compose services to operate the local PostgreSQL database. Do not require the user to install Python, Node.js, or a local PostgreSQL client for normal database work.

## Workspace

Before running commands, switch to the cloned project workspace:

```powershell
Set-Location -LiteralPath 'C:/Users/admin/Documents/GitHub/local-db'
```

On macOS or Linux, use the equivalent shell command:

```bash
cd 'C:/Users/admin/Documents/GitHub/local-db'
```

## Startup

Start or converge the service stack before database operations:

```bash
docker compose up -d
```

If images or source files changed, use:

```bash
docker compose up -d --build
```

The `db-init` service creates required tables with idempotent SQL. It is safe for it to run again.

## SQL Command Pattern

Use the Dockerized `db-tools` service for SQL:

```bash
docker compose run --rm -T db-tools -c "select now();"
```

Run a migration file:

```bash
docker compose run --rm -T db-tools -f /migrations/001_create_agent_test_items.sql
```

Re-run all bundled initialization SQL if needed:

```bash
docker compose run --rm -T db-init
```

## Notes CRUD

Add a note and return its id:

```bash
docker compose run --rm -T db-tools -c "insert into notes (content, source, tags) values ('note text', 'https://example.com/source', array['idea','local']::text[]) returning id, content, source, tags, created_at;"
```

Verify the inserted note immediately:

```bash
docker compose run --rm -T db-tools -c "select id, content, source, tags, created_at, updated_at from notes where id = <id>;"
```

List recent notes:

```bash
docker compose run --rm -T db-tools -c "select id, left(content, 120) as content, source, tags, created_at from notes order by created_at desc limit 20;"
```

Search notes:

```bash
docker compose run --rm -T db-tools -c "select id, content, source, tags, created_at from notes where content ilike '%keyword%' or source ilike '%keyword%' or exists (select 1 from unnest(tags) tag where tag ilike '%keyword%') order by created_at desc limit 20;"
```

Update a note:

```bash
docker compose run --rm -T db-tools -c "update notes set content = 'updated note', source = 'https://example.com/updated', tags = array['edited']::text[] where id = <id> returning id, content, source, tags, updated_at;"
```

Verify the updated note immediately:

```bash
docker compose run --rm -T db-tools -c "select id, content, source, tags, updated_at from notes where id = <id>;"
```

Delete a note:

```bash
docker compose run --rm -T db-tools -c "delete from notes where id = <id> returning id;"
```

Verify deletion immediately:

```bash
docker compose run --rm -T db-tools -c "select count(*) as remaining from notes where id = <id>;"
```

## Inspection

List public tables:

```bash
docker compose run --rm -T db-tools -c "select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name;"
```

Describe a table:

```bash
docker compose run --rm -T db-tools -c "select column_name, data_type, is_nullable, coalesce(column_default, '') as column_default from information_schema.columns where table_schema = 'public' and table_name = 'notes' order by ordinal_position;"
```

Run read-only checks:

```bash
docker compose run --rm -T db-tools -c "select count(*) from notes;"
```

## Behavior Rules

- Prefer `docker compose run --rm -T db-tools` for database operations.
- Store related URLs or references in `notes.source` when the user provides a source; leave it null when no source is known.
- Use `returning` on inserts, updates, and deletes so the changed row is visible.
- After every insert, update, delete, or migration, run a follow-up `select` that verifies the expected state.
- Before schema changes, inspect existing tables and columns.
- Put schema changes under `migrations/` and apply them with `db-tools -f /migrations/<file>.sql`.
- Keep the dashboard read-only unless the user explicitly asks to add write UI.
- If a command fails because services are not running, run `docker compose up -d` and retry once.
- If a SQL string contains user-provided text, escape single quotes by doubling them before embedding in SQL.

## Assumptions

- Compose project name: `local-postgres`
- PostgreSQL service: `postgres`
- Docker container: `local-postgres`
- PostgreSQL user: `app`
- Database: `localdb`
- Main note table: `notes`
