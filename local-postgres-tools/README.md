# Local PostgreSQL Tools

This folder contains optional Python helper CLIs.

The primary project workflow is Docker-first:

```bash
docker compose up -d
docker compose run --rm -T db-tools -c "select now();"
```

Use these Python tools only if you already have Python available and prefer the convenience wrappers.

## Optional Notes CRUD

```bash
python ./local-postgres-tools/dbnote.py init
python ./local-postgres-tools/dbnote.py add "first local note" --tag test --tag local
python ./local-postgres-tools/dbnote.py get 1
python ./local-postgres-tools/dbnote.py update 1 --content "updated note" --tag edited
python ./local-postgres-tools/dbnote.py update 1 --clear-tags
python ./local-postgres-tools/dbnote.py delete 1
python ./local-postgres-tools/dbnote.py list --limit 10
python ./local-postgres-tools/dbnote.py search local
```

## Optional Database Admin

```bash
python ./local-postgres-tools/dbadmin.py tables
python ./local-postgres-tools/dbadmin.py describe notes
python ./local-postgres-tools/dbadmin.py query "select count(*) from notes"
python ./local-postgres-tools/dbadmin.py apply ./migrations/001_create_agent_test_items.sql
```

## Docker Equivalent

List tables:

```bash
docker compose run --rm -T db-tools -c "select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name;"
```

Apply a migration:

```bash
docker compose run --rm -T db-tools -f /migrations/001_create_agent_test_items.sql
```

## Defaults

- Container: `local-postgres`
- User: `app`
- Database: `localdb`

Override Python helper defaults with environment variables:

```bash
DBNOTE_CONTAINER=local-postgres
DBNOTE_USER=app
DBNOTE_DB=localdb
```
