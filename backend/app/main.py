from __future__ import annotations

import json
import os
import re
from contextlib import contextmanager
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlsplit
from urllib.request import Request, urlopen

import psycopg
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from psycopg import sql as pg_sql
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb
from pydantic import BaseModel, Field


DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://app:adsl%401234@localhost:5432/localdb",
)

MAX_LIMIT = 500
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


class ManualRepositoryRequest(BaseModel):
    repo_url: str = Field(min_length=1, max_length=500)


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
        select 'ai_coding_oss_top5_items' as name, count(*)::int as count
        from (
          select lower(regexp_replace(repo_url, '/+$', '')) as normalized_repo_url
          from ai_coding_oss_top5_items
          union
          select normalized_repo_url
          from ai_coding_oss_manual_projects
        ) as projects
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


def ai_coding_oss_projects(
    query: str | None = None,
    normalized_repo_url: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[dict[str, Any]]:
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
              or repo_url ilike %s
            )
            """
        )
        like = f"%{query}%"
        params.extend([like, like, like, like, like])
    if normalized_repo_url:
        filters.append("normalized_repo_url = %s")
        params.append(normalized_repo_url)

    where = "where " + " and ".join(filters) if filters else ""

    sql = f"""
        with daily_normalized as (
          select
            *,
            lower(regexp_replace(repo_url, '/+$', '')) as normalized_repo_url
          from ai_coding_oss_top5_items
        ),
        daily_ranked as (
          select
            *,
            row_number() over (
              partition by normalized_repo_url
              order by brief_date desc, digest_rank asc, id desc
            ) as latest_row,
            count(*) over (partition by normalized_repo_url) as daily_mention_count,
            min(brief_date) over (partition by normalized_repo_url) as first_daily_mentioned_at,
            max(brief_date) over (partition by normalized_repo_url) as last_daily_mentioned_at
          from daily_normalized
        ),
        daily_projects as (
          select *
          from daily_ranked
          where latest_row = 1
        ),
        projects as (
          select
            coalesce(manual.id, -daily.id) as id,
            coalesce(manual.normalized_repo_url, daily.normalized_repo_url) as normalized_repo_url,
            coalesce(manual.repo_owner, daily.repo_owner) as repo_owner,
            coalesce(manual.repo_name, daily.repo_name) as repo_name,
            coalesce(manual.project_name, daily.project_name) as project_name,
            coalesce(manual.repo_url, daily.repo_url) as repo_url,
            coalesce(manual.positioning, daily.positioning) as positioning,
            coalesce(manual.primary_language, daily.primary_language) as primary_language,
            coalesce(manual.momentum_text, daily.momentum_text) as momentum_text,
            daily.recent_update_text,
            daily.recent_update_date,
            coalesce(manual.labels, daily.labels) as labels,
            daily.brief_summary,
            coalesce(daily.source_links, '[]'::jsonb) as source_links,
            coalesce(manual.github_metadata, daily.metadata) as metadata,
            case
              when daily.first_daily_mentioned_at is null then manual.created_at::date
              when manual.created_at is null then daily.first_daily_mentioned_at
              else least(daily.first_daily_mentioned_at, manual.created_at::date)
            end as first_mentioned_at,
            case
              when daily.last_daily_mentioned_at is null then manual.analyzed_at::date
              when manual.analyzed_at is null then daily.last_daily_mentioned_at
              else greatest(daily.last_daily_mentioned_at, manual.analyzed_at::date)
            end as last_mentioned_at,
            coalesce(daily.daily_mention_count, 0) + coalesce(manual.manual_mention_count, 0) as mention_count,
            daily.digest_rank,
            coalesce(manual.analyzed_at, daily.digest_run_at) as updated_at,
            coalesce(manual.created_at, daily.created_at) as created_at
          from daily_projects as daily
          full outer join ai_coding_oss_manual_projects as manual
            on manual.normalized_repo_url = daily.normalized_repo_url
        )
        select
          id, normalized_repo_url, repo_owner, repo_name, project_name, repo_url,
          positioning, primary_language, momentum_text, recent_update_text,
          recent_update_date, labels, brief_summary, source_links, metadata,
          first_mentioned_at, last_mentioned_at, mention_count, digest_rank,
          created_at, updated_at
        from projects
        {where}
        order by last_mentioned_at desc nulls last, mention_count desc, project_name asc
        limit %s offset %s;
    """
    params.extend([clamp_limit(limit), offset])
    return rows(sql, tuple(params))


@app.get("/api/ai-coding-oss")
def ai_coding_oss(
    query: str | None = None,
    limit: int = Query(default=MAX_LIMIT, ge=1, le=MAX_LIMIT),
    offset: int = Query(default=0, ge=0),
) -> dict[str, Any]:
    return {"items": ai_coding_oss_projects(query=query, limit=limit, offset=offset)}


def parse_github_repository_url(repo_url: str) -> tuple[str, str, str]:
    parsed = urlsplit(repo_url.strip())
    if parsed.scheme not in {"http", "https"} or parsed.netloc.lower() not in {"github.com", "www.github.com"}:
        raise HTTPException(status_code=400, detail="仅支持公开 GitHub 仓库 URL，例如 https://github.com/owner/repository")

    path_parts = [part for part in parsed.path.split("/") if part]
    if len(path_parts) != 2:
        raise HTTPException(status_code=400, detail="请输入仓库根地址，例如 https://github.com/owner/repository")

    owner, repo_name = path_parts
    if repo_name.endswith(".git"):
        repo_name = repo_name[:-4]
    if not owner or not repo_name:
        raise HTTPException(status_code=400, detail="GitHub 仓库地址不完整")

    return owner, repo_name, f"https://github.com/{owner.lower()}/{repo_name.lower()}"


def github_json(url: str) -> dict[str, Any]:
    request = Request(url, headers={"Accept": "application/vnd.github+json", "User-Agent": "local-postgres-dashboard"})
    try:
        with urlopen(request, timeout=15) as response:  # noqa: S310 - URL is built from a validated GitHub repository.
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        if error.code == 404:
            raise HTTPException(status_code=404, detail="未找到该公开 GitHub 仓库") from error
        if error.code in {403, 429}:
            raise HTTPException(status_code=429, detail="GitHub API 当前不可用或已触发速率限制，请稍后重试") from error
        raise HTTPException(status_code=502, detail="读取 GitHub 仓库信息失败") from error
    except (URLError, TimeoutError, json.JSONDecodeError) as error:
        raise HTTPException(status_code=502, detail="无法连接 GitHub，请检查网络后重试") from error


def github_readme(owner: str, repo_name: str) -> str:
    url = f"https://api.github.com/repos/{quote(owner, safe='')}/{quote(repo_name, safe='')}/readme"
    request = Request(
        url,
        headers={"Accept": "application/vnd.github.raw+json", "User-Agent": "local-postgres-dashboard"},
    )
    try:
        with urlopen(request, timeout=15) as response:  # noqa: S310 - URL is built from a validated GitHub repository.
            return response.read().decode("utf-8", errors="replace")[:12000]
    except HTTPError as error:
        if error.code == 404:
            return ""
        if error.code in {403, 429}:
            raise HTTPException(status_code=429, detail="GitHub API 当前不可用或已触发速率限制，请稍后重试") from error
        raise HTTPException(status_code=502, detail="读取仓库 README 失败") from error
    except (URLError, TimeoutError) as error:
        raise HTTPException(status_code=502, detail="无法连接 GitHub，请检查网络后重试") from error


def response_output_text(response_payload: dict[str, Any]) -> str:
    direct_text = response_payload.get("output_text")
    if isinstance(direct_text, str) and direct_text.strip():
        return direct_text.strip()

    for output in response_payload.get("output", []):
        if not isinstance(output, dict):
            continue
        for content in output.get("content", []):
            if isinstance(content, dict) and content.get("type") == "output_text" and isinstance(content.get("text"), str):
                return content["text"].strip()
    raise ValueError("OpenAI 响应中没有可读取的分析结果")


def openai_settings() -> tuple[str, str]:
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    model = os.environ.get("OPENAI_MODEL", "").strip()
    if not api_key or not model:
        raise HTTPException(status_code=503, detail="尚未配置 OPENAI_API_KEY 或 OPENAI_MODEL，无法进行 AI 分析")
    return api_key, model


def analyze_repository_with_openai(repository: dict[str, Any], readme: str) -> tuple[dict[str, Any], str]:
    api_key, model = openai_settings()

    repository_facts = {
        "full_name": repository.get("full_name"),
        "html_url": repository.get("html_url"),
        "description": repository.get("description"),
        "language": repository.get("language"),
        "topics": repository.get("topics", []),
        "stargazers_count": repository.get("stargazers_count", 0),
        "forks_count": repository.get("forks_count", 0),
        "subscribers_count": repository.get("subscribers_count", 0),
        "open_issues_count": repository.get("open_issues_count", 0),
        "created_at": repository.get("created_at"),
        "pushed_at": repository.get("pushed_at"),
        "license": (repository.get("license") or {}).get("spdx_id"),
    }
    schema = {
        "type": "object",
        "additionalProperties": False,
        "required": ["positioning", "primary_language", "momentum_text", "labels"],
        "properties": {
            "positioning": {"type": "string", "description": "中文一句话定位，不超过 80 个汉字"},
            "primary_language": {"type": "string", "description": "主要编程语言；无法确定时写 未知"},
            "momentum_text": {"type": "string", "description": "中文热度指标，必须引用给定 Stars、Fork、关注者、Issue 和最近推送时间，不得编造"},
            "labels": {
                "type": "array",
                "minItems": 1,
                "maxItems": 6,
                "items": {"type": "string", "description": "简短中文或通用技术标签"},
            },
        },
    }
    prompt = (
        "你是开源项目研究助手。只能依据给出的 GitHub 元数据和 README 摘要，用中文输出分析。"
        "不要添加未经来源支持的功能、排名或热度数据。\n\n"
        f"GitHub 元数据：\n{json.dumps(repository_facts, ensure_ascii=False)}\n\n"
        f"README 摘要：\n{readme or '仓库未提供可读取的 README。'}"
    )
    payload = {
        "model": model,
        "input": [
            {
                "role": "user",
                "content": [{"type": "input_text", "text": prompt}],
            }
        ],
        "text": {
            "format": {
                "type": "json_schema",
                "name": "repository_analysis",
                "strict": True,
                "schema": schema,
            }
        },
    }
    request = Request(
        "https://api.openai.com/v1/responses",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=45) as response:  # noqa: S310 - OpenAI endpoint is a fixed URL.
            response_payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        raise HTTPException(status_code=502, detail="OpenAI 分析请求失败，请检查模型配置与 API 密钥") from error
    except (URLError, TimeoutError, json.JSONDecodeError) as error:
        raise HTTPException(status_code=502, detail="无法完成 OpenAI 分析，请稍后重试") from error

    try:
        analysis = json.loads(response_output_text(response_payload))
        positioning = analysis["positioning"].strip()
        primary_language = analysis["primary_language"].strip()
        momentum_text = analysis["momentum_text"].strip()
        labels = [label.strip() for label in analysis["labels"] if isinstance(label, str) and label.strip()]
    except (KeyError, TypeError, ValueError, json.JSONDecodeError, AttributeError) as error:
        raise HTTPException(status_code=502, detail="OpenAI 返回的分析格式无效，请重试") from error

    if not positioning or not primary_language or not momentum_text or not labels:
        raise HTTPException(status_code=502, detail="OpenAI 返回的分析内容不完整，请重试")
    return {
        "positioning": positioning,
        "primary_language": primary_language,
        "momentum_text": momentum_text,
        "labels": labels[:6],
    }, model


@app.post("/api/ai-coding-oss/manual")
def add_manual_ai_coding_oss(payload: ManualRepositoryRequest) -> dict[str, Any]:
    owner, repo_name, normalized_repo_url = parse_github_repository_url(payload.repo_url)
    openai_settings()
    repository = github_json(f"https://api.github.com/repos/{quote(owner, safe='')}/{quote(repo_name, safe='')}")
    readme = github_readme(owner, repo_name)
    analysis, model = analyze_repository_with_openai(repository, readme)

    repo_owner = repository.get("owner", {}).get("login") or owner
    canonical_repo_name = repository.get("name") or repo_name
    project_name = repository.get("full_name") or f"{repo_owner}/{canonical_repo_name}"
    repo_url = repository.get("html_url") or f"https://github.com/{repo_owner}/{canonical_repo_name}"
    github_metadata = {
        "repository": {
            "description": repository.get("description"),
            "language": repository.get("language"),
            "topics": repository.get("topics", []),
            "stargazers_count": repository.get("stargazers_count", 0),
            "forks_count": repository.get("forks_count", 0),
            "subscribers_count": repository.get("subscribers_count", 0),
            "open_issues_count": repository.get("open_issues_count", 0),
            "created_at": repository.get("created_at"),
            "pushed_at": repository.get("pushed_at"),
            "default_branch": repository.get("default_branch"),
            "license": (repository.get("license") or {}).get("spdx_id"),
        },
        "readme_excerpt": readme,
        "analysis_model": model,
    }

    with db() as cur:
        cur.execute(
            """
            insert into ai_coding_oss_manual_projects (
              normalized_repo_url, repo_owner, repo_name, project_name, repo_url,
              positioning, primary_language, momentum_text, labels, github_metadata
            )
            values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            on conflict (normalized_repo_url) do update
            set
              repo_owner = excluded.repo_owner,
              repo_name = excluded.repo_name,
              project_name = excluded.project_name,
              repo_url = excluded.repo_url,
              positioning = excluded.positioning,
              primary_language = excluded.primary_language,
              momentum_text = excluded.momentum_text,
              labels = excluded.labels,
              github_metadata = excluded.github_metadata,
              manual_mention_count = ai_coding_oss_manual_projects.manual_mention_count + 1,
              analyzed_at = now(),
              updated_at = now()
            returning id, manual_mention_count;
            """,
            (
                normalized_repo_url,
                repo_owner,
                canonical_repo_name,
                project_name,
                repo_url,
                analysis["positioning"],
                analysis["primary_language"],
                analysis["momentum_text"],
                analysis["labels"],
                Jsonb(github_metadata),
            ),
        )
        manual_project = cur.fetchone()

    project_rows = ai_coding_oss_projects(normalized_repo_url=normalized_repo_url, limit=1)
    if not project_rows:
        raise HTTPException(status_code=500, detail="仓库分析已保存，但无法读取聚合项目")
    return {"item": project_rows[0], "manual_mention_count": manual_project["manual_mention_count"]}


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
