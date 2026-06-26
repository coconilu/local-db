# Migrations

Put table-creation and schema-change SQL files here.

The bundled SQL files are applied automatically by the Docker Compose `db-init` service during startup:

```bash
docker compose up -d --build
```

Re-run all bundled initialization SQL manually:

```bash
docker compose run --rm -T db-init
```

Apply one migration file:

```bash
docker compose run --rm -T db-tools -f /migrations/001_create_agent_test_items.sql
```

Use timestamped or numbered file names, for example:

```text
001_create_agent_test_items.sql
002_add_agent_test_item_status.sql
```

Migration SQL should be idempotent when possible, using patterns like `create table if not exists` and `create index if not exists`.
