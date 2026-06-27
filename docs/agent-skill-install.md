# Agent Skill Installation

This project includes a portable skill template for agents:

```text
.agents/skills/local-postgres-notes/SKILL.md
```

The template is not installed automatically after `git clone`. Each agent has its own way to load skills, project instructions, memory files, or custom workflows. Use this document to guide the current agent through the installation.

Important: this guide is for installing or registering the existing skill. Do not generate a new generic HTTP API skill from the dashboard URL. The dashboard at `http://localhost:15173` is the read-only UI; the skill operates the database through Docker Compose and the `db-tools` service.

## What The Skill Does

The skill teaches an agent to operate this project through Docker Compose:

- Start or converge the stack with `docker compose up -d`.
- Use the Dockerized `db-tools` service for SQL.
- Add, list, search, update, and delete notes.
- Inspect tables and columns.
- Apply migration files.
- Verify every insert, update, delete, and migration with a follow-up query.

It does not require local Python, Node.js, or a local PostgreSQL client.

## Install Concept

1. Find the skill or custom-instruction location used by the current agent.
2. Copy `.agents/skills/local-postgres-notes/SKILL.md` into that location, or paste its content into the agent's project instructions.
3. Replace this placeholder with the absolute path of the cloned repo:

```text
__LOCAL_DB_REPO_PATH__
```

For example, on Windows:

```text
C:\Users\you\dev\local-db
```

On macOS or Linux:

```text
/Users/alice/dev/local-db
```

4. Reload or restart the agent if it does not pick up new skills automatically.
5. Ask the agent to verify installation:

```text
Use the local-postgres-notes skill and list the database tables.
```

The expected command shape is:

```bash
docker compose run --rm -T db-tools -c "select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name;"
```

## Prompt To Give An Agent

If your agent can edit its own skills or project instructions, give it this prompt from the cloned repo root:

```text
Install/register this repository's existing database skill. Do not create a new skill template.

Read `docs/agent-skill-install.md` and `.agents/skills/local-postgres-notes/SKILL.md`.
Use `.agents/skills/local-postgres-notes/SKILL.md` as the skill body/source template.
Register it in your own skill/workflow/custom-instruction location.
Replace `__LOCAL_DB_REPO_PATH__` with the absolute path of this repository.
After installation, reload yourself if needed and verify by listing the database tables through Docker Compose.
Do not require local Python, Node.js, or a local PostgreSQL client.
Do not ask for API endpoints; this skill uses `docker compose run --rm -T db-tools ...`, not the dashboard HTTP URL.
```

## Notes For Different Agents

- If the agent supports skills, register the template as a skill.
- If the agent supports project instructions only, paste the template into the project instruction file.
- If the agent supports memory or rules files, store the template there and keep the repo path replacement.
- If the agent has no persistent instruction mechanism, paste the template into the chat before asking it to operate the database.
