---
name: local-postgres-notes
description: Use when the user wants to add, read, update, delete, list, or search notes, inspect local PostgreSQL tables, run SQL, or apply migration files in the local-postgres Docker container.
---

# Local PostgreSQL Notes

Use the local `dbnote` CLI to manage simple notes in the user's local PostgreSQL database. Use `dbadmin` for table inspection, one-off SQL checks, and applying schema migrations.

## Commands

Before running commands, switch to the cloned project workspace:

```powershell
Set-Location -LiteralPath '__LOCAL_DB_REPO_PATH__'
python .\local-postgres-tools\dbnote.py init
python .\local-postgres-tools\dbnote.py add "note text" --tag idea --tag local
python .\local-postgres-tools\dbnote.py get 1
python .\local-postgres-tools\dbnote.py update 1 --content "updated note" --tag edited
python .\local-postgres-tools\dbnote.py delete 1
python .\local-postgres-tools\dbnote.py list --limit 20
python .\local-postgres-tools\dbnote.py search "keyword" --limit 20
python .\local-postgres-tools\dbadmin.py tables
python .\local-postgres-tools\dbadmin.py describe notes
python .\local-postgres-tools\dbadmin.py query "select count(*) from notes"
python .\local-postgres-tools\dbadmin.py apply .\migrations\001_create_agent_test_items.sql
```

## Assumptions

- Docker container: `local-postgres`
- PostgreSQL user: `app`
- Database: `localdb`
- Table: `notes`

If the CLI fails because the schema is missing, run `init` once and retry.

## Behavior

- Use `add` for capturing a short memory, idea, or note.
- Use `get`, `update`, and `delete` for note CRUD by id.
- Use `search` before adding when the user asks whether something already exists.
- Use `list` when the user asks for recent local database entries.
- Use `dbadmin.py tables` and `describe` before writing schema changes.
- For table creation or schema changes, create a SQL file under `migrations\` and run `dbadmin.py apply`.
- Use `dbadmin.py query` for direct SQL inspection when the user explicitly asks for database inspection or broad database operations.
