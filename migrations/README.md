# Public schema migrations

Only table creation, indexes, constraints, and permission migrations belong here. They are part of the reproducible public project and are applied by `db-init`.

Do not put personal notes, daily reports, source exports, repair scripts, or secret-bearing SQL in this directory. Put those files under the Git-ignored `local-data/` directory instead.

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

Use ordered file names, for example:

```text
001_create_agent_test_items.sql
002_add_agent_test_item_status.sql
```

Migration SQL should be idempotent when possible, using patterns like `create table if not exists` and `create index if not exists`.
