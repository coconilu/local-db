from __future__ import annotations

import os
import re
from contextlib import contextmanager
from typing import Any

import psycopg
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
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
    allow_methods=["GET", "POST", "OPTIONS"],
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


@app.get("/api/health")
def health() -> dict[str, Any]:
    current = one("select now() as server_time, current_database() as database, current_user as user;")
    counts = rows(
        """
        select 'notes' as name, count(*)::int as count from notes
        union all
        select 'ai_news_items' as name, count(*)::int as count from ai_news_items
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
        filters.append("content ilike %s")
        params.append(f"%{query}%")
    if tag:
        filters.append("%s = any(tags)")
        params.append(tag)
    where = "where " + " and ".join(filters) if filters else ""
    sql = f"""
        select id, content, tags, created_at, updated_at
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
