#!/usr/bin/env python3
import argparse
import hashlib
import json
import sys
from typing import Any

from pgcli import positive_int, run_psql, sql_array, sql_literal

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")


PRIORITIES = {"high", "medium_high", "medium", "low"}
SIGNAL_TYPES = {"official", "news", "paper", "github", "x_opinion", "community", "blog"}
VERIFICATION_STATUSES = {"official", "verified", "partially_verified", "unverified", "rumor"}


def cmd_import(args: argparse.Namespace) -> None:
    with open(args.file, "r", encoding="utf-8-sig") as json_file:
        payload = json.load(json_file)

    items = payload.get("items") if isinstance(payload, dict) else payload
    if not isinstance(items, list):
        print("JSON must be an array or an object with an 'items' array", file=sys.stderr)
        raise SystemExit(2)

    statements = ["begin;"]
    for index, raw_item in enumerate(items, start=1):
        if not isinstance(raw_item, dict):
            print(f"item {index} must be an object", file=sys.stderr)
            raise SystemExit(2)
        item = normalize_item(raw_item, index)
        statements.append(build_upsert_sql(item))
    statements.append("commit;")

    output = run_psql("\n".join(statements))
    imported = len([line for line in output.splitlines() if line.strip()]) if output else len(items)
    print(f"imported {imported} ai news items")


def cmd_list(args: argparse.Namespace) -> None:
    limit = positive_int(args.limit, maximum=100)
    sql = (
        "select id, coalesce(published_at, digest_run_at), priority, signal_type, "
        "source_name, title "
        "from ai_news_items "
        "where not is_archived "
        "order by digest_run_at desc, digest_rank nulls last, id desc "
        f"limit {limit};"
    )
    output = run_psql(sql)
    if not output:
        print("no rows")
        return
    for line in output.splitlines():
        item_id, timestamp, priority, signal_type, source, title = (line.split("\t", 5) + [""] * 6)[:6]
        print(f"{item_id} | {timestamp} | {priority} | {signal_type} | {source} | {title}")


def normalize_item(raw: dict[str, Any], index: int) -> dict[str, Any]:
    item = {
        "digest_window_start": raw.get("digest_window_start"),
        "digest_window_end": raw.get("digest_window_end"),
        "digest_run_at": raw.get("digest_run_at"),
        "digest_rank": raw.get("digest_rank", index),
        "priority": normalize_choice(raw.get("priority"), PRIORITIES, "medium"),
        "category": required(raw, "category", index),
        "signal_type": normalize_choice(raw.get("signal_type"), SIGNAL_TYPES, "community"),
        "verification_status": normalize_choice(raw.get("verification_status"), VERIFICATION_STATUSES, "unverified"),
        "title": required(raw, "title", index),
        "source_name": required(raw, "source_name", index),
        "source_platform": raw.get("source_platform"),
        "author_name": raw.get("author_name"),
        "published_at": raw.get("published_at"),
        "source_url": required(raw, "source_url", index),
        "summary": required(raw, "summary", index),
        "why_it_matters": raw.get("why_it_matters"),
        "entities": string_list(raw.get("entities")),
        "tags": string_list(raw.get("tags")),
        "related_urls": raw.get("related_urls") or [],
        "metadata": raw.get("metadata") or {},
    }
    item["content_hash"] = raw.get("content_hash") or content_hash(item)
    return item


def required(raw: dict[str, Any], key: str, index: int) -> str:
    value = raw.get(key)
    if not isinstance(value, str) or not value.strip():
        print(f"item {index} missing required string field: {key}", file=sys.stderr)
        raise SystemExit(2)
    return value.strip()


def normalize_choice(value: Any, allowed: set[str], default: str) -> str:
    if isinstance(value, str) and value in allowed:
        return value
    return default


def string_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()]


def content_hash(item: dict[str, Any]) -> str:
    stable = "\n".join(
        [
            str(item["source_url"]).strip().lower(),
            str(item["title"]).strip().lower(),
            str(item.get("published_at") or ""),
        ]
    )
    return hashlib.sha256(stable.encode("utf-8")).hexdigest()


def sql_nullable_text(value: Any) -> str:
    if value is None or value == "":
        return "null"
    return sql_literal(str(value))


def sql_nullable_timestamptz(value: Any) -> str:
    if value is None or value == "":
        return "null"
    return f"{sql_literal(str(value))}::timestamptz"


def sql_nullable_integer(value: Any) -> str:
    if value is None or value == "":
        return "null"
    try:
        return str(int(value))
    except (TypeError, ValueError):
        return "null"


def sql_jsonb(value: Any) -> str:
    return f"{sql_literal(json.dumps(value, ensure_ascii=False))}::jsonb"


def build_upsert_sql(item: dict[str, Any]) -> str:
    columns = [
        "digest_window_start",
        "digest_window_end",
        "digest_run_at",
        "digest_rank",
        "priority",
        "category",
        "signal_type",
        "verification_status",
        "title",
        "source_name",
        "source_platform",
        "author_name",
        "published_at",
        "source_url",
        "summary",
        "why_it_matters",
        "entities",
        "tags",
        "related_urls",
        "metadata",
        "content_hash",
    ]
    values = [
        sql_nullable_timestamptz(item["digest_window_start"]),
        sql_nullable_timestamptz(item["digest_window_end"]),
        sql_nullable_timestamptz(item["digest_run_at"]) if item["digest_run_at"] else "now()",
        sql_nullable_integer(item["digest_rank"]),
        sql_literal(item["priority"]),
        sql_literal(item["category"]),
        sql_literal(item["signal_type"]),
        sql_literal(item["verification_status"]),
        sql_literal(item["title"]),
        sql_literal(item["source_name"]),
        sql_nullable_text(item["source_platform"]),
        sql_nullable_text(item["author_name"]),
        sql_nullable_timestamptz(item["published_at"]),
        sql_literal(item["source_url"]),
        sql_literal(item["summary"]),
        sql_nullable_text(item["why_it_matters"]),
        sql_array(item["entities"]),
        sql_array(item["tags"]),
        sql_jsonb(item["related_urls"]),
        sql_jsonb(item["metadata"]),
        sql_literal(item["content_hash"]),
    ]
    update_columns = [column for column in columns if column != "content_hash"]
    assignments = ", ".join(f"{column} = excluded.{column}" for column in update_columns)
    return (
        f"insert into ai_news_items ({', '.join(columns)}) values "
        f"({', '.join(values)}) "
        "on conflict (content_hash) where content_hash is not null do update set "
        f"{assignments}, updated_at = now() "
        "returning id;"
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="ainews",
        description="Import and inspect AI news digest items in local PostgreSQL.",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    import_items = subparsers.add_parser("import", help="Import a JSON array of AI news items.")
    import_items.add_argument("file")
    import_items.set_defaults(func=cmd_import)

    list_items = subparsers.add_parser("list", help="List recent AI news items.")
    list_items.add_argument("--limit", type=int, default=20)
    list_items.set_defaults(func=cmd_list)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
