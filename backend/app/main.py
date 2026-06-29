from __future__ import annotations

import os
import re
from contextlib import contextmanager
from typing import Any

import psycopg
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from psycopg import sql as pg_sql
from psycopg.rows import dict_row
from pydantic import BaseModel


DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://app:adsl%401234@localhost:5432/localdb",
)

MAX_LIMIT = 100
WRITE_KEYWORDS = re.compile(
    r"\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|copy|call|merge|vacuum|analyze|refresh|listen|notify)\b",
    re.IGNORECASE,
)


app = FastAPI(title="Local Postgres Dashboard API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


class ReadOnlyQuery(BaseModel):
    sql: str
    limit: int = 100


@contextmanager
def db() -> Any:
    with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            yield cur


def clamp_limit(limit: int) -> int:
    return max(1, min(limit, MAX_LIMIT))


def rows(sql: str, params: tuple[Any, ...] = ()) -> list[dict[str, Any]]:
    with db() as cur:
        cur.execute(sql, params)
        result = cur.fetchall()
    return [dict(row) for row in result]


def one(sql: str, params: tuple[Any, ...] = ()) -> dict[str, Any] | None:
    result = rows(sql, params)
    return result[0] if result else None


def ensure_public_table(table_name: str) -> None:
    exists = one(
        """
        select table_name
        from information_schema.tables
        where table_schema = 'public'
          and table_type = 'BASE TABLE'
          and table_name = %s;
        """,
        (table_name,),
    )
    if not exists:
        raise HTTPException(status_code=404, detail="table not found")


def ensure_id_column(table_name: str) -> None:
    column = one(
        """
        select column_name
        from information_schema.columns
        where table_schema = 'public'
          and table_name = %s
          and column_name = 'id';
        """,
        (table_name,),
    )
    if not column:
        raise HTTPException(status_code=400, detail="table does not expose an id column")


@app.get("/api/health")
def health() -> dict[str, Any]:
    current = one("select now() as server_time, current_database() as database, current_user as user;")
    counts = rows(
        """
        select 'notes' as name, count(*)::int as count from notes
        union all
        select 'ai_news_items' as name, count(*)::int as count from ai_news_items
        union all
        select 'ai_coding_oss_top5_items' as name, count(*)::int as count from ai_coding_oss_top5_items
        union all
        select 'tables' as name, count(*)::int as count
        from information_schema.tables
        where table_schema = 'public' and table_type = 'BASE TABLE';
        """
    )
    return {"status": "connected", "database": current, "counts": counts}


@app.get("/api/notes")
def notes(
    query: str | None = None,
    tag: str | None = None,
    limit: int = Query(default=50, ge=1, le=MAX_LIMIT),
    offset: int = Query(default=0, ge=0),
) -> dict[str, Any]:
    filters: list[str] = []
    params: list[Any] = []
    if query:
        filters.append("(content ilike %s or source ilike %s)")
        like = f"%{query}%"
        params.extend([like, like])
    if tag:
        filters.append("%s = any(tags)")
        params.append(tag)
    where = "where " + " and ".join(filters) if filters else ""
    sql = f"""
        select id, content, source, tags, created_at, updated_at
        from notes
        {where}
        order by created_at desc
        limit %s offset %s;
    """
    params.extend([clamp_limit(limit), offset])
    return {"items": rows(sql, tuple(params))}


@app.get("/api/ai-news")
def ai_news(
    query: str | None = None,
    priority: str | None = None,
    category: str | None = None,
    signal_type: str | None = None,
    limit: int = Query(default=50, ge=1, le=MAX_LIMIT),
    offset: int = Query(default=0, ge=0),
) -> dict[str, Any]:
    filters = ["not is_archived"]
    params: list[Any] = []
    if query:
        filters.append("(title ilike %s or summary ilike %s or source_name ilike %s)")
        like = f"%{query}%"
        params.extend([like, like, like])
    if priority:
        filters.append("priority = %s")
        params.append(priority)
    if category:
        filters.append("category = %s")
        params.append(category)
    if signal_type:
        filters.append("signal_type = %s")
        params.append(signal_type)

    sql = f"""
        select
          id, priority, category, signal_type, verification_status,
          title, source_name, source_platform, author_name, published_at,
          source_url, summary, why_it_matters, entities, tags, digest_run_at,
          created_at, updated_at
        from ai_news_items
        where {" and ".join(filters)}
        order by digest_run_at desc, digest_rank nulls last, published_at desc nulls last, id desc
        limit %s offset %s;
    """
    params.extend([clamp_limit(limit), offset])
    return {"items": rows(sql, tuple(params))}


@app.get("/api/ai-coding-oss")
def ai_coding_oss(
    query: str | None = None,
    limit: int = Query(default=50, ge=1, le=MAX_LIMIT),
    offset: int = Query(default=0, ge=0),
) -> dict[str, Any]:
    filters: list[str] = []
    params: list[Any] = []
    if query:
        filters.append(
            """
            (
              project_name ilike %s
              or positioning ilike %s
              or momentum_text ilike %s
              or array_to_string(labels, ' ') ilike %s
            )
            """
        )
        like = f"%{query}%"
        params.extend([like, like, like, like])
    else:
        filters.append("brief_date = (select max(brief_date) from ai_coding_oss_top5_items)")

    sql = f"""
        select
          id, brief_date, digest_run_at, digest_rank,
          repo_owner, repo_name, project_name, repo_url,
          positioning, primary_language, momentum_text,
          recent_update_text, recent_update_date, labels,
          brief_summary, source_links, metadata, created_at, updated_at
        from ai_coding_oss_top5_items
        where {" and ".join(filters)}
        order by brief_date desc, digest_rank asc, id desc
        limit %s offset %s;
    """
    params.extend([clamp_limit(limit), offset])
    return {"items": rows(sql, tuple(params))}


@app.get("/api/tables")
def tables() -> dict[str, Any]:
    items = rows(
        """
        select
          t.table_name,
          coalesce(s.n_live_tup, 0)::int as estimated_rows
        from information_schema.tables t
        left join pg_stat_user_tables s on s.relname = t.table_name
        where t.table_schema = 'public'
          and t.table_type = 'BASE TABLE'
        order by t.table_name;
        """
    )
    return {"items": items}


@app.get("/api/tables/{table_name}")
def table_detail(table_name: str) -> dict[str, Any]:
    ensure_public_table(table_name)

    columns = rows(
        """
        select column_name, data_type, is_nullable, coalesce(column_default, '') as column_default
        from information_schema.columns
        where table_schema = 'public'
          and table_name = %s
        order by ordinal_position;
        """,
        (table_name,),
    )
    indexes = rows(
        """
        select indexname, indexdef
        from pg_indexes
        where schemaname = 'public'
          and tablename = %s
        order by indexname;
        """,
        (table_name,),
    )
    return {"table": table_name, "columns": columns, "indexes": indexes}


@app.get("/api/tables/{table_name}/rows")
def table_rows(
    table_name: str,
    limit: int = Query(default=50, ge=1, le=MAX_LIMIT),
    offset: int = Query(default=0, ge=0),
) -> dict[str, Any]:
    ensure_public_table(table_name)
    column_rows = rows(
        """
        select column_name
        from information_schema.columns
        where table_schema = 'public'
          and table_name = %s
        order by ordinal_position;
        """,
        (table_name,),
    )
    column_names = [column["column_name"] for column in column_rows]
    order_column = next(
        (
            candidate
            for candidate in ("created_at", "updated_at", "digest_run_at", "published_at", "id")
            if candidate in column_names
        ),
        None,
    )

    query_parts = [pg_sql.SQL("select * from {}").format(pg_sql.Identifier(table_name))]
    if order_column:
        query_parts.append(pg_sql.SQL(" order by {} desc").format(pg_sql.Identifier(order_column)))
    query_parts.append(pg_sql.SQL(" limit %s offset %s"))

    with db() as cur:
        cur.execute(pg_sql.SQL("").join(query_parts), (clamp_limit(limit), offset))
        columns = [column.name for column in cur.description or []]
        result = [dict(row) for row in cur.fetchall()]
    return {"columns": columns, "rows": result}


@app.delete("/api/tables/{table_name}/rows/{row_id}")
def delete_table_row(table_name: str, row_id: int) -> dict[str, Any]:
    ensure_public_table(table_name)
    ensure_id_column(table_name)

    with db() as cur:
        cur.execute(
            pg_sql.SQL("delete from {} where id = %s returning id").format(pg_sql.Identifier(table_name)),
            (row_id,),
        )
        deleted = cur.fetchone()

    if not deleted:
        raise HTTPException(status_code=404, detail="row not found")

    return {"deleted": True, "table": table_name, "id": deleted["id"]}


@app.post("/api/query/read-only")
def read_only_query(payload: ReadOnlyQuery) -> dict[str, Any]:
    sql = payload.sql.strip().rstrip(";")
    if not sql:
        raise HTTPException(status_code=400, detail="SQL is required")
    if not re.match(r"^(select|with)\b", sql, re.IGNORECASE):
        raise HTTPException(status_code=400, detail="Only SELECT or WITH queries are allowed")
    if WRITE_KEYWORDS.search(sql):
        raise HTTPException(status_code=400, detail="Write or schema-changing SQL is not allowed")

    limited_sql = f"select * from ({sql}) as dashboard_query limit %s"
    with db() as cur:
        cur.execute(limited_sql, (clamp_limit(payload.limit),))
        columns = [column.name for column in cur.description or []]
        result = [dict(row) for row in cur.fetchall()]
    return {"columns": columns, "rows": result}
