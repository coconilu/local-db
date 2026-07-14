BEGIN;

DELETE FROM ai_coding_oss_top5_items
WHERE brief_date = DATE '2026-07-01'
  AND repo_url NOT IN (
    'https://github.com/msitarzewski/agency-agents',
    'https://github.com/obra/superpowers',
    'https://github.com/ogulcancelik/herdr',
    'https://github.com/google/agents-cli',
    'https://github.com/diegosouzapw/OmniRoute'
  );

INSERT INTO ai_coding_oss_top5_items (
  brief_date,
  digest_rank,
  repo_owner,
  repo_name,
  project_name,
  repo_url,
  positioning,
  primary_language,
  momentum_text,
  recent_update_text,
  recent_update_date,
  labels,
  brief_summary,
  source_links,
  metadata
)
VALUES
(
  DATE '2026-07-01',
  1,
  'msitarzewski',
  'agency-agents',
  'msitarzewski/agency-agents',
  'https://github.com/msitarzewski/agency-agents',
  $$把前端、产品、增长等角色封装成可协作 agent 团队，适合用在 AI 驱动的软件交付流。$$,
  'Shell',
  $$GitHub Trending 第 3 位；今日 +1,791 stars；总 Stars 121,604 / Forks 19,866$$,
  $$最近 push：2026-07-01$$,
  DATE '2026-07-01',
  ARRAY['编码代理', 'Agent 模板', '协作编排']::text[],
  $$过去 24 小时，AI 编码热度集中在“代理编排 + 技能分发 + 终端工作台”三层：多角色开发代理继续吸星，Claude Code/Codex 周边网关与终端协作工具同步走强，竞争正从单点补全转向完整开发流水线。$$,
  $$[
    {"label":"GitHub Trending","url":"https://github.com/trending"},
    {"label":"Repository","url":"https://github.com/msitarzewski/agency-agents"}
  ]$$::jsonb,
  $${
    "repair_source":"C:/Users/admin/Documents/Codex/2026-06-16/new-chat/ai-coding-oss-top5-2026-07-01.html",
    "ranking_basis":"daily_html_brief",
    "trending_rank":3,
    "trending_stars_today":1791,
    "stargazers_count":121604,
    "forks_count":19866,
    "recent_signal_type":"push"
  }$$::jsonb
),
(
  DATE '2026-07-01',
  2,
  'obra',
  'superpowers',
  'obra/superpowers',
  'https://github.com/obra/superpowers',
  $$围绕 agentic 开发沉淀技能框架与方法论，强调把软件研发流程标准化给编码代理使用。$$,
  'Shell',
  $$GitHub Trending 第 14 位；今日 +890 stars；总 Stars 242,985 / Forks 21,552$$,
  $$最新 Release：2026-07-01$$,
  DATE '2026-07-01',
  ARRAY['设计规范', '技能框架', 'Agent 模板']::text[],
  $$过去 24 小时，AI 编码热度集中在“代理编排 + 技能分发 + 终端工作台”三层：多角色开发代理继续吸星，Claude Code/Codex 周边网关与终端协作工具同步走强，竞争正从单点补全转向完整开发流水线。$$,
  $$[
    {"label":"GitHub Trending","url":"https://github.com/trending"},
    {"label":"Repository","url":"https://github.com/obra/superpowers"}
  ]$$::jsonb,
  $${
    "repair_source":"C:/Users/admin/Documents/Codex/2026-06-16/new-chat/ai-coding-oss-top5-2026-07-01.html",
    "ranking_basis":"daily_html_brief",
    "trending_rank":14,
    "trending_stars_today":890,
    "stargazers_count":242985,
    "forks_count":21552,
    "recent_signal_type":"release"
  }$$::jsonb
),
(
  DATE '2026-07-01',
  3,
  'ogulcancelik',
  'herdr',
  'ogulcancelik/herdr',
  'https://github.com/ogulcancelik/herdr',
  $$一个住在终端里的 agent multiplexer，适合把多个 coding agent 会话并排组织和切换。$$,
  'Rust',
  $$GitHub Trending 第 12 位；今日 +486 stars；总 Stars 9,227 / Forks 550$$,
  $$最近 push：2026-07-01$$,
  DATE '2026-07-01',
  ARRAY['终端工作台', '编码代理', '多 Agent']::text[],
  $$过去 24 小时，AI 编码热度集中在“代理编排 + 技能分发 + 终端工作台”三层：多角色开发代理继续吸星，Claude Code/Codex 周边网关与终端协作工具同步走强，竞争正从单点补全转向完整开发流水线。$$,
  $$[
    {"label":"GitHub Trending","url":"https://github.com/trending"},
    {"label":"Repository","url":"https://github.com/ogulcancelik/herdr"}
  ]$$::jsonb,
  $${
    "repair_source":"C:/Users/admin/Documents/Codex/2026-06-16/new-chat/ai-coding-oss-top5-2026-07-01.html",
    "ranking_basis":"daily_html_brief",
    "trending_rank":12,
    "trending_stars_today":486,
    "stargazers_count":9227,
    "forks_count":550,
    "recent_signal_type":"push"
  }$$::jsonb
),
(
  DATE '2026-07-01',
  4,
  'google',
  'agents-cli',
  'google/agents-cli',
  'https://github.com/google/agents-cli',
  $$把现有 coding assistant 训练成能创建、评测、部署 AI agents 的 CLI 与 skills 工具链。$$,
  'Python',
  $$GitHub Trending 第 9 位；今日 +445 stars；总 Stars 4,437 / Forks 469$$,
  $$最新 Release：2026-06-29$$,
  DATE '2026-06-29',
  ARRAY['CLI', '技能分发', '编码代理']::text[],
  $$过去 24 小时，AI 编码热度集中在“代理编排 + 技能分发 + 终端工作台”三层：多角色开发代理继续吸星，Claude Code/Codex 周边网关与终端协作工具同步走强，竞争正从单点补全转向完整开发流水线。$$,
  $$[
    {"label":"GitHub Trending","url":"https://github.com/trending"},
    {"label":"Repository","url":"https://github.com/google/agents-cli"}
  ]$$::jsonb,
  $${
    "repair_source":"C:/Users/admin/Documents/Codex/2026-06-16/new-chat/ai-coding-oss-top5-2026-07-01.html",
    "ranking_basis":"daily_html_brief",
    "trending_rank":9,
    "trending_stars_today":445,
    "stargazers_count":4437,
    "forks_count":469,
    "recent_signal_type":"release"
  }$$::jsonb
),
(
  DATE '2026-07-01',
  5,
  'diegosouzapw',
  'OmniRoute',
  'diegosouzapw/OmniRoute',
  'https://github.com/diegosouzapw/OmniRoute',
  $$给 Claude Code、Codex、Cursor、Cline 等提供统一 AI 网关、压缩与回退策略的开发基础设施。$$,
  'TypeScript',
  $$GitHub Trending 第 5 位；今日 +387 stars；总 Stars 8,948 / Forks 1,422$$,
  $$最新 Release：2026-06-30$$,
  DATE '2026-06-30',
  ARRAY['Claude Code', 'Codex', 'MCP']::text[],
  $$过去 24 小时，AI 编码热度集中在“代理编排 + 技能分发 + 终端工作台”三层：多角色开发代理继续吸星，Claude Code/Codex 周边网关与终端协作工具同步走强，竞争正从单点补全转向完整开发流水线。$$,
  $$[
    {"label":"GitHub Trending","url":"https://github.com/trending"},
    {"label":"Repository","url":"https://github.com/diegosouzapw/OmniRoute"}
  ]$$::jsonb,
  $${
    "repair_source":"C:/Users/admin/Documents/Codex/2026-06-16/new-chat/ai-coding-oss-top5-2026-07-01.html",
    "ranking_basis":"daily_html_brief",
    "trending_rank":5,
    "trending_stars_today":387,
    "stargazers_count":8948,
    "forks_count":1422,
    "recent_signal_type":"release"
  }$$::jsonb
)
ON CONFLICT (brief_date, repo_url) DO UPDATE
SET
  digest_rank = EXCLUDED.digest_rank,
  repo_owner = EXCLUDED.repo_owner,
  repo_name = EXCLUDED.repo_name,
  project_name = EXCLUDED.project_name,
  positioning = EXCLUDED.positioning,
  primary_language = EXCLUDED.primary_language,
  momentum_text = EXCLUDED.momentum_text,
  recent_update_text = EXCLUDED.recent_update_text,
  recent_update_date = EXCLUDED.recent_update_date,
  labels = EXCLUDED.labels,
  brief_summary = EXCLUDED.brief_summary,
  source_links = EXCLUDED.source_links,
  metadata = EXCLUDED.metadata,
  updated_at = now();

COMMIT;
