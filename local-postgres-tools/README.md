# Local PostgreSQL Tools

Small Python CLIs for the `local-postgres` Docker container.

Run commands from the cloned project root.

## Notes CRUD

```powershell
python .\local-postgres-tools\dbnote.py init
python .\local-postgres-tools\dbnote.py add "first local note" --tag test --tag local
python .\local-postgres-tools\dbnote.py get 1
python .\local-postgres-tools\dbnote.py update 1 --content "updated note" --tag edited
python .\local-postgres-tools\dbnote.py update 1 --clear-tags
python .\local-postgres-tools\dbnote.py delete 1
python .\local-postgres-tools\dbnote.py list --limit 10
python .\local-postgres-tools\dbnote.py search local
```

## Database Admin

```powershell
python .\local-postgres-tools\dbadmin.py tables
python .\local-postgres-tools\dbadmin.py describe notes
python .\local-postgres-tools\dbadmin.py query "select count(*) from notes"
python .\local-postgres-tools\dbadmin.py apply .\migrations\001_create_agent_test_items.sql
```

Use `dbadmin.py apply` for table creation and schema changes. Put migration SQL files in `.\migrations`.

## Defaults

- Container: `local-postgres`
- User: `app`
- Database: `localdb`

Override with environment variables:

```powershell
$env:DBNOTE_CONTAINER = "local-postgres"
$env:DBNOTE_USER = "app"
$env:DBNOTE_DB = "localdb"
```
