BEGIN;

DELETE FROM ai_coding_oss_top5_items
WHERE brief_date = DATE '2026-07-04'
  AND repo_url NOT IN (
    'https://github.com/JuliusBrussee/caveman',
    'https://github.com/obra/superpowers',
    'https://github.com/stablyai/orca',
    'https://github.com/openai/codex-plugin-cc',
    'https://github.com/ChromeDevTools/chrome-devtools-mcp'
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
  DATE '2026-07-04',
  1,
  'JuliusBrussee',
  'caveman',
  'JuliusBrussee/caveman',
  'https://github.com/JuliusBrussee/caveman',
  $$面向 Claude Code 的高热度技能包，核心卖点是用更短输出压缩编码代理的 token 消耗。$$,
  'JavaScript',
  $$Trending +2,863 today；83,297 stars / 4,650 forks$$,
  $$最新 release：v1.9.1（2026-07-03）；最近 push：2026-07-03$$,
  DATE '2026-07-03',
  ARRAY['Claude Code', '提示技能', '省 Token']::text[],
  $$过去 24 小时，AI 编码热度继续从“直接写代码”扩展到“省 token、组织代理、跨助手协作和浏览器调试”。caveman 爆发最强，orca 与 chrome-devtools-mcp 则显示 IDE 化与调试链路持续升温。$$,
  $$[
    {"label":"GitHub Trending","url":"https://github.com/trending?since=daily"},
    {"label":"GitHub Search","url":"https://github.com/search?q=Claude+Code+skill&type=repositories"},
    {"label":"Repository","url":"https://github.com/JuliusBrussee/caveman"},
    {"label":"Latest release","url":"https://github.com/JuliusBrussee/caveman/releases/tag/v1.9.1"}
  ]$$::jsonb,
  $${
    "ranking_basis":"trending_then_relevance_then_recent_activity",
    "trending_stars_today":2863,
    "stargazers_count":83297,
    "forks_count":4650,
    "updated_at":"2026-07-04T09:02:53Z",
    "pushed_at":"2026-07-03T11:10:42Z",
    "release_tag":"v1.9.1",
    "release_date":"2026-07-03T11:10:43Z"
  }$$::jsonb
),
(
  DATE '2026-07-04',
  2,
  'obra',
  'superpowers',
  'obra/superpowers',
  'https://github.com/obra/superpowers',
  $$把 agent skills、子代理协作和软件开发方法论打包到一起的 AI 编码工作流框架。$$,
  'Shell',
  $$Trending +1,209 today；245,780 stars / 21,792 forks$$,
  $$最新 release：v6.1.1（2026-07-02）；最近 push：2026-07-02$$,
  DATE '2026-07-02',
  ARRAY['编码代理', '技能框架', '开发流程']::text[],
  $$过去 24 小时，AI 编码热度继续从“直接写代码”扩展到“省 token、组织代理、跨助手协作和浏览器调试”。caveman 爆发最强，orca 与 chrome-devtools-mcp 则显示 IDE 化与调试链路持续升温。$$,
  $$[
    {"label":"GitHub Trending","url":"https://github.com/trending?since=daily"},
    {"label":"GitHub Search","url":"https://github.com/search?q=agentic+coding+skills&type=repositories"},
    {"label":"Repository","url":"https://github.com/obra/superpowers"},
    {"label":"Latest release","url":"https://github.com/obra/superpowers/releases/tag/v6.1.1"}
  ]$$::jsonb,
  $${
    "ranking_basis":"trending_then_relevance_then_recent_activity",
    "trending_stars_today":1209,
    "stargazers_count":245780,
    "forks_count":21792,
    "updated_at":"2026-07-04T09:04:07Z",
    "pushed_at":"2026-07-02T21:58:21Z",
    "release_tag":"v6.1.1",
    "release_date":"2026-07-02T21:58:30Z"
  }$$::jsonb
),
(
  DATE '2026-07-04',
  3,
  'stablyai',
  'orca',
  'stablyai/orca',
  'https://github.com/stablyai/orca',
  $$定位为 ADE 的 AI IDE，强调并行代理编排和用现有订阅运行多种编码 agent。$$,
  'TypeScript',
  $$Trending +703 today；11,820 stars / 780 forks$$,
  $$最新 release：v1.4.121（2026-07-04）；最近 push：2026-07-04$$,
  DATE '2026-07-04',
  ARRAY['AI IDE', '并行代理', '编码工作台']::text[],
  $$过去 24 小时，AI 编码热度继续从“直接写代码”扩展到“省 token、组织代理、跨助手协作和浏览器调试”。caveman 爆发最强，orca 与 chrome-devtools-mcp 则显示 IDE 化与调试链路持续升温。$$,
  $$[
    {"label":"GitHub Trending TypeScript","url":"https://github.com/trending/typescript?since=daily"},
    {"label":"GitHub Search","url":"https://github.com/search?q=ADE+coding+agent&type=repositories"},
    {"label":"Repository","url":"https://github.com/stablyai/orca"},
    {"label":"Latest release","url":"https://github.com/stablyai/orca/releases/tag/v1.4.121"}
  ]$$::jsonb,
  $${
    "ranking_basis":"trending_then_relevance_then_recent_activity",
    "trending_stars_today":703,
    "stargazers_count":11820,
    "forks_count":780,
    "updated_at":"2026-07-04T08:56:39Z",
    "pushed_at":"2026-07-04T09:01:07Z",
    "release_tag":"v1.4.121",
    "release_date":"2026-07-04T02:24:38Z"
  }$$::jsonb
),
(
  DATE '2026-07-04',
  4,
  'openai',
  'codex-plugin-cc',
  'openai/codex-plugin-cc',
  'https://github.com/openai/codex-plugin-cc',
  $$把 Codex 接进 Claude Code 的插件层，主打代码评审、任务委派和跨助手协同编码。$$,
  'JavaScript',
  $$Trending +634 today；23,466 stars / 1,436 forks$$,
  $$最新 release：v1.0.5（2026-06-23）；仓库本周仍在活跃讨论$$,
  DATE '2026-06-23',
  ARRAY['Claude Code', '代码评审', '任务委派']::text[],
  $$过去 24 小时，AI 编码热度继续从“直接写代码”扩展到“省 token、组织代理、跨助手协作和浏览器调试”。caveman 爆发最强，orca 与 chrome-devtools-mcp 则显示 IDE 化与调试链路持续升温。$$,
  $$[
    {"label":"GitHub Trending","url":"https://github.com/trending?since=daily"},
    {"label":"GitHub Search","url":"https://github.com/search?q=Codex+Claude+Code+plugin&type=repositories"},
    {"label":"Repository","url":"https://github.com/openai/codex-plugin-cc"},
    {"label":"Latest release","url":"https://github.com/openai/codex-plugin-cc/releases/tag/v1.0.5"}
  ]$$::jsonb,
  $${
    "ranking_basis":"trending_then_relevance_then_recent_activity",
    "trending_stars_today":634,
    "stargazers_count":23466,
    "forks_count":1436,
    "updated_at":"2026-07-04T09:03:15Z",
    "pushed_at":"2026-06-23T17:36:38Z",
    "release_tag":"v1.0.5",
    "release_date":"2026-06-23T17:36:38Z"
  }$$::jsonb
),
(
  DATE '2026-07-04',
  5,
  'ChromeDevTools',
  'chrome-devtools-mcp',
  'ChromeDevTools/chrome-devtools-mcp',
  'https://github.com/ChromeDevTools/chrome-devtools-mcp',
  $$把 Chrome DevTools 暴露给编码代理，补上前端排障、页面检查和浏览器调试链路。$$,
  'TypeScript',
  $$Trending +405 today；45,585 stars / 2,967 forks$$,
  $$最新 release：chrome-devtools-mcp-v1.5.0（2026-07-03）；最近 push：2026-07-03$$,
  DATE '2026-07-03',
  ARRAY['MCP', '浏览器调试', '编码代理']::text[],
  $$过去 24 小时，AI 编码热度继续从“直接写代码”扩展到“省 token、组织代理、跨助手协作和浏览器调试”。caveman 爆发最强，orca 与 chrome-devtools-mcp 则显示 IDE 化与调试链路持续升温。$$,
  $$[
    {"label":"GitHub Trending TypeScript","url":"https://github.com/trending/typescript?since=daily"},
    {"label":"GitHub Search","url":"https://github.com/search?q=chrome-devtools-mcp&type=repositories"},
    {"label":"Repository","url":"https://github.com/ChromeDevTools/chrome-devtools-mcp"},
    {"label":"Latest release","url":"https://github.com/ChromeDevTools/chrome-devtools-mcp/releases/tag/chrome-devtools-mcp-v1.5.0"}
  ]$$::jsonb,
  $${
    "ranking_basis":"trending_then_relevance_then_recent_activity",
    "trending_stars_today":405,
    "stargazers_count":45585,
    "forks_count":2967,
    "updated_at":"2026-07-04T09:01:56Z",
    "pushed_at":"2026-07-03T11:18:49Z",
    "release_tag":"chrome-devtools-mcp-v1.5.0",
    "release_date":"2026-07-03T11:18:49Z"
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
