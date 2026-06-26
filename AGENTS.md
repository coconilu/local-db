# Local PostgreSQL Workspace

Keep local PostgreSQL related scripts, schema files, skills, notes tooling, and future generated artifacts in this directory.

Use `local-postgres-tools\dbnote.py` as the default CLI for the local `notes` table unless the user asks for a different storage shape.

Use `local-postgres-tools\dbadmin.py` for database inspection, arbitrary SQL checks, and applying migration files. Put schema changes under `migrations\` and apply them with `dbadmin.py apply`.

The local dashboard is Dockerized in the root `compose.yaml`. Use `docker compose up -d --build` from this directory and open `http://localhost:15173`. The dashboard is read-only; keep writes and migrations in CLI tools unless the user explicitly asks to broaden the dashboard.

The default local service assumptions are:

- Docker container: `local-postgres`
- PostgreSQL user: `app`
- Database: `localdb`
