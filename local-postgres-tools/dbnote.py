#!/usr/bin/env python3
import argparse
import os
import sys

from pgcli import positive_int, run_psql, sql_array, sql_literal

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")


def cmd_init(_: argparse.Namespace) -> None:
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    with open(schema_path, "r", encoding="utf-8") as schema_file:
        run_psql(schema_file.read())
    print("initialized notes schema")


def cmd_add(args: argparse.Namespace) -> None:
    tags = args.tag or []
    sql = (
        "insert into notes (content, source, tags) values "
        f"({sql_literal(args.content)}, {sql_literal(args.source) if args.source else 'null'}, {sql_array(tags)}) "
        "returning id, coalesce(source, ''), created_at;"
    )
    output = run_psql(sql)
    note_id, source, created_at = (output.split("\t", 2) + [""] * 3)[:3]
    print(f"added note {note_id} at {created_at}")
    if source:
        print(f"source: {source}")


def cmd_get(args: argparse.Namespace) -> None:
    sql = (
        "select id, created_at, updated_at, coalesce(source, ''), array_to_string(tags, ','), content "
        "from notes "
        f"where id = {args.id};"
    )
    output = run_psql(sql)
    if not output:
        print(f"note not found: {args.id}", file=sys.stderr)
        raise SystemExit(1)
    print_note(output)


def cmd_update(args: argparse.Namespace) -> None:
    if args.clear_tags and args.tag:
        print("use either --tag or --clear-tags, not both", file=sys.stderr)
        raise SystemExit(2)
    if args.clear_source and args.source is not None:
        print("use either --source or --clear-source, not both", file=sys.stderr)
        raise SystemExit(2)

    assignments = []
    if args.content is not None:
        assignments.append(f"content = {sql_literal(args.content)}")
    if args.clear_source:
        assignments.append("source = null")
    elif args.source is not None:
        assignments.append(f"source = {sql_literal(args.source)}")
    if args.clear_tags:
        assignments.append("tags = ARRAY[]::text[]")
    elif args.tag is not None:
        assignments.append(f"tags = {sql_array(args.tag)}")

    if not assignments:
        print("nothing to update; pass --content, --source, --clear-source, --tag, or --clear-tags", file=sys.stderr)
        raise SystemExit(2)

    sql = (
        "update notes set "
        + ", ".join(assignments)
        + f" where id = {args.id} "
        + "returning id, created_at, updated_at, coalesce(source, ''), array_to_string(tags, ','), content;"
    )
    output = run_psql(sql)
    if not output:
        print(f"note not found: {args.id}", file=sys.stderr)
        raise SystemExit(1)
    print_note(output)


def cmd_delete(args: argparse.Namespace) -> None:
    output = run_psql(f"delete from notes where id = {args.id} returning id;")
    if not output:
        print(f"note not found: {args.id}", file=sys.stderr)
        raise SystemExit(1)
    print(f"deleted note {output}")


def cmd_list(args: argparse.Namespace) -> None:
    limit = positive_int(args.limit, maximum=100)
    sql = (
        "select id, created_at, coalesce(source, ''), array_to_string(tags, ','), "
        "replace(content, E'\\n', ' ') "
        "from notes order by created_at desc "
        f"limit {limit};"
    )
    print_rows(run_psql(sql))


def cmd_search(args: argparse.Namespace) -> None:
    limit = positive_int(args.limit, maximum=100)
    query = args.query
    sql = (
        "select id, created_at, coalesce(source, ''), array_to_string(tags, ','), "
        "replace(content, E'\\n', ' ') "
        "from notes "
        f"where content ilike '%' || {sql_literal(query)} || '%' "
        f"or source ilike '%' || {sql_literal(query)} || '%' "
        f"or exists (select 1 from unnest(tags) tag where tag ilike '%' || {sql_literal(query)} || '%') "
        "order by created_at desc "
        f"limit {limit};"
    )
    print_rows(run_psql(sql))


def print_note(output: str) -> None:
    note_id, created_at, updated_at, source, tags, content = (output.split("\t", 5) + [""] * 6)[:6]
    tag_text = f" [{tags}]" if tags else ""
    print(f"{note_id} | created {created_at} | updated {updated_at}{tag_text}")
    if source:
        print(f"source: {source}")
    print(content)


def print_rows(output: str) -> None:
    if not output:
        print("no rows")
        return
    for line in output.splitlines():
        note_id, created_at, source, tags, content = (line.split("\t", 4) + [""] * 5)[:5]
        tag_text = f" [{tags}]" if tags else ""
        source_text = f" <{source}>" if source else ""
        print(f"{note_id} | {created_at}{tag_text}{source_text} | {content}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="dbnote",
        description="Tiny CLI for the local PostgreSQL notes table.",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    init = subparsers.add_parser("init", help="Create or update the notes schema.")
    init.set_defaults(func=cmd_init)

    add = subparsers.add_parser("add", help="Add one note.")
    add.add_argument("content")
    add.add_argument("--source", help="Related source URL or reference.")
    add.add_argument("--tag", action="append", help="Attach a tag. Repeatable.")
    add.set_defaults(func=cmd_add)

    get = subparsers.add_parser("get", help="Get one note by id.")
    get.add_argument("id", type=int)
    get.set_defaults(func=cmd_get)

    update = subparsers.add_parser("update", help="Update one note.")
    update.add_argument("id", type=int)
    update.add_argument("--content", help="Replace the note content.")
    update.add_argument("--source", help="Replace the related source URL or reference.")
    update.add_argument("--clear-source", action="store_true", help="Remove the source.")
    update.add_argument("--tag", action="append", help="Replace tags. Repeatable.")
    update.add_argument("--clear-tags", action="store_true", help="Remove all tags.")
    update.set_defaults(func=cmd_update)

    delete = subparsers.add_parser("delete", help="Delete one note.")
    delete.add_argument("id", type=int)
    delete.set_defaults(func=cmd_delete)

    list_notes = subparsers.add_parser("list", help="List recent notes.")
    list_notes.add_argument("--limit", type=int, default=20)
    list_notes.set_defaults(func=cmd_list)

    search = subparsers.add_parser("search", help="Search notes by content or tag.")
    search.add_argument("query")
    search.add_argument("--limit", type=int, default=20)
    search.set_defaults(func=cmd_search)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
