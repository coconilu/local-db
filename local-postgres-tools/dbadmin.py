#!/usr/bin/env python3
import argparse
import os
import sys

from pgcli import positive_int, run_psql, sql_literal

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")


def cmd_tables(_: argparse.Namespace) -> None:
    sql = """
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_type = 'BASE TABLE'
order by table_name;
"""
    output = run_psql(sql)
    print(output or "no tables")


def cmd_describe(args: argparse.Namespace) -> None:
    table_literal = sql_literal(args.table)
    columns_sql = f"""
select
  column_name,
  data_type,
  is_nullable,
  coalesce(column_default, '')
from information_schema.columns
where table_schema = 'public'
  and table_name = {table_literal}
order by ordinal_position;
"""
    indexes_sql = f"""
select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = {table_literal}
order by indexname;
"""
    columns = run_psql(columns_sql)
    if not columns:
        print(f"table not found: {args.table}", file=sys.stderr)
        raise SystemExit(1)

    print("columns")
    for line in columns.splitlines():
        name, data_type, nullable, default = (line.split("\t", 3) + [""] * 4)[:4]
        default_text = f" default {default}" if default else ""
        print(f"- {name}: {data_type}, nullable={nullable}{default_text}")

    indexes = run_psql(indexes_sql)
    if indexes:
        print("indexes")
        for line in indexes.splitlines():
            name, definition = (line.split("\t", 1) + [""])[:2]
            print(f"- {name}: {definition}")


def cmd_query(args: argparse.Namespace) -> None:
    output = run_psql(args.sql, tuples_only=not args.aligned)
    print(output or "ok")


def cmd_apply(args: argparse.Namespace) -> None:
    if not os.path.exists(args.file):
        print(f"file not found: {args.file}", file=sys.stderr)
        raise SystemExit(1)
    with open(args.file, "r", encoding="utf-8") as sql_file:
        run_psql(sql_file.read(), tuples_only=False)
    print(f"applied {args.file}")


def cmd_sample_migration(args: argparse.Namespace) -> None:
    migrations_dir = os.path.join(os.getcwd(), "migrations")
    os.makedirs(migrations_dir, exist_ok=True)
    path = os.path.join(migrations_dir, args.name)
    if os.path.exists(path) and not args.force:
        print(f"file already exists: {path}", file=sys.stderr)
        raise SystemExit(1)
    with open(path, "w", encoding="utf-8") as migration_file:
        migration_file.write(
            "create table if not exists example_items (\n"
            "  id bigserial primary key,\n"
            "  name text not null,\n"
            "  created_at timestamptz not null default now()\n"
            ");\n"
        )
    print(path)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="dbadmin",
        description="Small PostgreSQL admin CLI for the local Docker database.",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    tables = subparsers.add_parser("tables", help="List public tables.")
    tables.set_defaults(func=cmd_tables)

    describe = subparsers.add_parser("describe", help="Describe one public table.")
    describe.add_argument("table")
    describe.set_defaults(func=cmd_describe)

    query = subparsers.add_parser("query", help="Run SQL and print the result.")
    query.add_argument("sql")
    query.add_argument("--aligned", action="store_true", help="Use psql's aligned table output.")
    query.set_defaults(func=cmd_query)

    apply = subparsers.add_parser("apply", help="Apply a SQL file.")
    apply.add_argument("file")
    apply.set_defaults(func=cmd_apply)

    sample = subparsers.add_parser("sample-migration", help="Create a starter migration file.")
    sample.add_argument("name", nargs="?", default="001_create_example_items.sql")
    sample.add_argument("--force", action="store_true")
    sample.set_defaults(func=cmd_sample_migration)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
