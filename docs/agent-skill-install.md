# Agent Skill Installation

This project includes a portable skill template for agents:

```text
.agents/skills/local-postgres-notes/SKILL.md
```

The template is not installed automatically after `git clone`. Each agent has its own way to load skills, project instructions, memory files, or custom workflows. Use this document to guide the current agent through the installation.

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

For example:

```text
C:\Users\admin\Documents\GitHub\local-db
```

or:

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
Install this repository's agent skill.

Use `.agents/skills/local-postgres-notes/SKILL.md` as the source template.
Register it in your own skill/workflow/custom-instruction location.
Replace `__LOCAL_DB_REPO_PATH__` with the absolute path of this repository.
After installation, reload yourself if needed and verify by listing the database tables through Docker Compose.
Do not require local Python, Node.js, or a local PostgreSQL client.
```

## Optional Windows Helper

On Windows, this repository also includes a convenience installer:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-skill.ps1
```

It copies the skill to:

```text
%USERPROFILE%\.agents\skills\local-postgres-notes
```

Use `-SkillRoot` if your agent expects a different skill directory:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-skill.ps1 -SkillRoot "C:\path\to\agent\skills"
```

This script is optional. The portable source of truth is the template plus the replacement rule above.

## Notes For Different Agents

- If the agent supports skills, register the template as a skill.
- If the agent supports project instructions only, paste the template into the project instruction file.
- If the agent supports memory or rules files, store the template there and keep the repo path replacement.
- If the agent has no persistent instruction mechanism, paste the template into the chat before asking it to operate the database.
