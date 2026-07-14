from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

from bs4 import BeautifulSoup


REPORT_DIR = Path(r"C:\Users\admin\Documents\Codex\2026-06-16\new-chat")
OUTPUT_SQL = Path(r"C:\Users\admin\Documents\GitHub\local-db\migrations\007_seed_ai_coding_oss_top5_recent_week.sql")

LABEL_MAP = {
    "mattpocock/skills": ["Agent 技能", "开发工作流"],
    "DeusData/codebase-memory-mcp": ["长期记忆", "MCP", "代码库检索"],
    "bytedance/deer-flow": ["Agent 框架", "工作流编排"],
    "anomalyco/opencode": ["编码代理", "终端代理"],
    "openai/codex": ["编码代理", "终端代理"],
    "garrytan/gstack": ["Claude Code", "角色化代理", "开发工作流"],
    "esengine/DeepSeek-Reasonix": ["编码代理", "终端代理"],
    "stablyai/orca": ["ADE", "多代理"],
    "corsairdev/corsair": ["集成层", "开发平台"],
    "modem-dev/hunk": ["代码评审", "Diff 工具"],
    "NousResearch/hermes-agent": ["Agent 框架", "研究代理"],
    "JCodesMore/ai-website-cloner-template": ["网站克隆", "Agent 模板"],
    "affaan-m/ECC": ["上下文压缩", "提示优化"],
    "BuilderIO/agent-native": ["Agent 框架", "应用平台"],
    "google-labs-code/design.md": ["设计规范", "Agent 上下文"],
    "anthropics/claude-plugins-official": ["插件目录", "Claude Code"],
    "wshobson/agents": ["Agent 集合", "开发工作流"],
    "anthropics/skills": ["Agent 技能", "Claude Code"],
    "shanraisshan/claude-code-best-practice": ["最佳实践", "Claude Code"],
    "topoteretes/cognee": ["长期记忆", "知识图谱"],
}


def sql_text(value: str | None) -> str:
    if value is None:
        return "null"
    return "'" + value.replace("'", "''") + "'"


def sql_date(value: str | None) -> str:
    if not value:
        return "null"
    return f"date '{value}'"


def sql_json(value: object) -> str:
    return sql_text(json.dumps(value, ensure_ascii=False)) + "::jsonb"


def sql_text_array(values: list[str]) -> str:
    if not values:
        return "'{}'::text[]"
    return "array[" + ", ".join(sql_text(v) for v in values) + "]::text[]"


def normalize_url(url: str) -> str:
    if url.startswith("/"):
        return "https://github.com" + url
    return url


def parse_repo(url: str) -> tuple[str, str]:
    parsed = urlparse(url)
    parts = [p for p in parsed.path.split("/") if p]
    if len(parts) < 2:
        raise ValueError(f"Unexpected repo URL: {url}")
    return parts[0], parts[1]


def parse_recent_update_date(text: str) -> str | None:
    match = re.search(r"(20\d{2}-\d{2}-\d{2})", text)
    return match.group(1) if match else None


def dedupe_preserve(values: list[str]) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for value in values:
        if value not in seen:
            out.append(value)
            seen.add(value)
    return out


def build_rows() -> list[str]:
    report_files = sorted(REPORT_DIR.glob("ai-coding-oss-top5-*.html"))[-7:]
    rows: list[str] = []

    for report_file in report_files:
        match = re.search(r"(\d{4}-\d{2}-\d{2})$", report_file.stem)
        if match is None:
            raise ValueError(f"Could not parse report date from {report_file.name}")
        brief_date = match.group(1)
        digest_run_at = datetime.fromtimestamp(report_file.stat().st_mtime).astimezone().isoformat()
        soup = BeautifulSoup(report_file.read_text(encoding="utf-8"), "html.parser")
        summary_node = soup.select_one("p.summary")
        brief_summary = summary_node.get_text(" ", strip=True) if summary_node else None

        for rank, tr in enumerate(soup.select("tbody tr"), start=1):
            cells = tr.find_all("td")
            if len(cells) < 5:
                continue

            repo_anchor = cells[0].select_one("a[href]")
            if repo_anchor is None:
                continue

            repo_url = normalize_url(repo_anchor["href"].strip())
            repo_owner, repo_name = parse_repo(repo_url)
            project_name = f"{repo_owner}/{repo_name}"
            positioning = cells[1].get_text(" ", strip=True)
            primary_language = cells[2].get_text(" ", strip=True) or None
            momentum_text = " ".join(cells[3].stripped_strings)
            recent_update_text = cells[4].get_text(" ", strip=True) or None
            recent_update_date = parse_recent_update_date(recent_update_text or "")

            source_links = dedupe_preserve(
                [normalize_url(a["href"].strip()) for a in tr.select("a[href]") if a.get("href")]
            )
            labels = LABEL_MAP.get(project_name, ["AI 编程"])

            metadata = {
                "source_file": report_file.name,
                "imported_from": "daily_html_backfill",
                "label_version": 1,
            }

            rows.append(
                "("
                + ", ".join(
                    [
                        sql_date(brief_date),
                        sql_text(digest_run_at) + "::timestamptz",
                        str(rank),
                        sql_text(repo_owner),
                        sql_text(repo_name),
                        sql_text(project_name),
                        sql_text(repo_url),
                        sql_text(positioning),
                        sql_text(primary_language),
                        sql_text(momentum_text),
                        sql_text(recent_update_text),
                        sql_date(recent_update_date),
                        sql_text_array(labels),
                        sql_text(brief_summary),
                        sql_json(source_links),
                        sql_json(metadata),
                    ]
                )
                + ")"
            )

    return rows


def main() -> None:
    rows = build_rows()
    sql = """-- Generated from the 7 most recent ai-coding-oss-top5 HTML reports.\ninsert into ai_coding_oss_top5_items (\n  brief_date,\n  digest_run_at,\n  digest_rank,\n  repo_owner,\n  repo_name,\n  project_name,\n  repo_url,\n  positioning,\n  primary_language,\n  momentum_text,\n  recent_update_text,\n  recent_update_date,\n  labels,\n  brief_summary,\n  source_links,\n  metadata\n)\nvalues\n"""
    sql += ",\n".join(rows)
    sql += """\non conflict (brief_date, repo_url) do update\nset\n  digest_run_at = excluded.digest_run_at,\n  digest_rank = excluded.digest_rank,\n  repo_owner = excluded.repo_owner,\n  repo_name = excluded.repo_name,\n  project_name = excluded.project_name,\n  positioning = excluded.positioning,\n  primary_language = excluded.primary_language,\n  momentum_text = excluded.momentum_text,\n  recent_update_text = excluded.recent_update_text,\n  recent_update_date = excluded.recent_update_date,\n  labels = excluded.labels,\n  brief_summary = excluded.brief_summary,\n  source_links = excluded.source_links,\n  metadata = excluded.metadata,\n  updated_at = now();\n"""
    OUTPUT_SQL.write_text(sql, encoding="utf-8")
    print(f"Wrote {OUTPUT_SQL}")


if __name__ == "__main__":
    main()
