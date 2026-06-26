# Local PostgreSQL Workspace

Keep local PostgreSQL related scripts, schema files, skills, notes tooling, and future generated artifacts in this directory.

Use Docker Compose as the default runtime boundary. The user should not need local Python, Node.js, or a local PostgreSQL client for normal project usage.

Use `docker compose run --rm -T db-tools ...` as the default CLI for database inspection, CRUD, and applying migration files. The Python scripts under `local-postgres-tools\` are optional convenience tools, not the primary path.

The local dashboard is Dockerized in the root `compose.yaml`. Use `docker compose up -d --build` from this directory and open `http://localhost:15173`. The dashboard is read-only; keep writes and migrations in Docker CLI tools unless the user explicitly asks to broaden the dashboard.

The `db-init` service applies the bundled idempotent schema SQL. It should run during `docker compose up`; use `docker compose run --rm -T db-init` to rerun initialization manually.

For inserts, updates, deletes, and migrations, always run a follow-up query that verifies the expected database state.

The default local service assumptions are:

- Docker container: `local-postgres`
- PostgreSQL user: `app`
- Database: `localdb`
