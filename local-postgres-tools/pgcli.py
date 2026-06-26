import os
import subprocess
import sys


DEFAULT_CONTAINER = "local-postgres"
DEFAULT_USER = "app"
DEFAULT_DB = "localdb"

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")


def env(name: str, default: str) -> str:
    return os.environ.get(name, default)


def sql_literal(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def sql_array(values: list[str]) -> str:
    if not values:
        return "ARRAY[]::text[]"
    return "ARRAY[" + ", ".join(sql_literal(v) for v in values) + "]::text[]"


def positive_int(value: int, *, maximum: int | None = None) -> int:
    if value < 1:
        return 1
    if maximum is not None and value > maximum:
        return maximum
    return value


def run_psql(
    sql: str,
    *,
    tuples_only: bool = True,
    field_separator: str = "\t",
) -> str:
    container = env("DBNOTE_CONTAINER", DEFAULT_CONTAINER)
    user = env("DBNOTE_USER", DEFAULT_USER)
    database = env("DBNOTE_DB", DEFAULT_DB)

    cmd = [
        "docker",
        "exec",
        "-i",
        container,
        "psql",
        "-U",
        user,
        "-d",
        database,
        "-X",
        "-v",
        "ON_ERROR_STOP=1",
    ]
    if tuples_only:
        cmd.extend(["-qAt", "-F", field_separator])

    result = subprocess.run(
        cmd,
        input=sql,
        text=True,
        encoding="utf-8",
        errors="replace",
        capture_output=True,
    )
    if result.returncode != 0:
        if result.stderr:
            print(result.stderr.strip(), file=sys.stderr)
        raise SystemExit(result.returncode)
    return result.stdout.strip()
