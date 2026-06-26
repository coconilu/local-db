# Migrations

Put table-creation and schema-change SQL files here.

Apply a migration from the cloned project root:

```powershell
python .\local-postgres-tools\dbadmin.py apply .\migrations\001_create_agent_test_items.sql
```

Use timestamped or numbered file names, for example:

```text
001_create_agent_test_items.sql
002_add_agent_test_item_status.sql
```
