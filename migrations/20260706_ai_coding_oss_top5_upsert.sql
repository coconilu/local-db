delete from ai_coding_oss_top5_items
where brief_date = date '2026-07-06';

insert into ai_coding_oss_top5_items (
  brief_date,
  digest_run_at,
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
) values
(
  date '2026-07-06',
  timestamptz '2026-07-06T17:00:00+08:00',
  1,
  'alibaba',
  'page-agent',
  'alibaba/page-agent',
  'https://github.com/alibaba/page-agent',
  '页内 GUI 编码代理，可用自然语言直接操控网页界面并把浏览器动作接入 AI 开发流。',
  'TypeScript',
  'Trending 805 stars today；总星 24,314；Fork 2,085',
  '推送 2026-07-06；发布 v1.11.0（2026-07-03）',
  date '2026-07-06',
  array['编码代理','浏览器自动化','MCP']::text[],
  '过去 24 小时，AI 编程热度继续往“代理执行层”下沉：页内 GUI 代理、终端多代理、编辑器 MCP 桥接和跨代理技能包一起升温，说明开发者正把 AI 从建议工具推进到可操作工程系统。',
  '[
    {"url":"https://github.com/trending/typescript","label":"GitHub Trending TypeScript"},
    {"url":"https://github.com/alibaba/page-agent","label":"Repository"},
    {"url":"https://github.com/alibaba/page-agent/releases/tag/v1.11.0","label":"Latest release"}
  ]'::jsonb,
  '{
    "pushed_at":"2026-07-06T08:53:49Z",
    "updated_at":"2026-07-06T09:02:14Z",
    "forks_count":2085,
    "stargazers_count":24314,
    "trending_stars_today":805,
    "release_tag":"v1.11.0",
    "release_date":"2026-07-03T16:08:37Z",
    "ranking_basis":"trending_then_relevance_then_recent_activity"
  }'::jsonb
),
(
  date '2026-07-06',
  timestamptz '2026-07-06T17:00:00+08:00',
  2,
  'ogulcancelik',
  'herdr',
  'ogulcancelik/herdr',
  'https://github.com/ogulcancelik/herdr',
  '终端里的代理多路复用器，统一编排 Claude Code、Codex 等编码代理的会话与工作区。',
  'Rust',
  'Trending 651 stars today；总星 12,388；Fork 721',
  '推送 2026-07-06；发布 v0.7.1（2026-06-24）',
  date '2026-07-06',
  array['编码代理','终端编排','多代理']::text[],
  '过去 24 小时，AI 编程热度继续往“代理执行层”下沉：页内 GUI 代理、终端多代理、编辑器 MCP 桥接和跨代理技能包一起升温，说明开发者正把 AI 从建议工具推进到可操作工程系统。',
  '[
    {"url":"https://github.com/trending","label":"GitHub Trending"},
    {"url":"https://github.com/ogulcancelik/herdr","label":"Repository"},
    {"url":"https://github.com/ogulcancelik/herdr/releases/tag/v0.7.1","label":"Latest release"}
  ]'::jsonb,
  '{
    "pushed_at":"2026-07-06T01:57:50Z",
    "updated_at":"2026-07-06T08:58:28Z",
    "forks_count":721,
    "stargazers_count":12388,
    "trending_stars_today":651,
    "release_tag":"v0.7.1",
    "release_date":"2026-06-24T13:47:11Z",
    "ranking_basis":"trending_then_relevance_then_recent_activity"
  }'::jsonb
),
(
  date '2026-07-06',
  timestamptz '2026-07-06T17:00:00+08:00',
  3,
  'CoplayDev',
  'unity-mcp',
  'CoplayDev/unity-mcp',
  'https://github.com/CoplayDev/unity-mcp',
  '把 Unity Editor 暴露给 AI 助手的 MCP 桥接层，可让模型直接管理脚本、场景与资源。',
  'C#',
  'Trending 414 stars today；总星 12,099；Fork 1,288',
  '推送 2026-07-06；发布 v10.0.0（2026-06-30）',
  date '2026-07-06',
  array['MCP','编辑器桥接','游戏开发']::text[],
  '过去 24 小时，AI 编程热度继续往“代理执行层”下沉：页内 GUI 代理、终端多代理、编辑器 MCP 桥接和跨代理技能包一起升温，说明开发者正把 AI 从建议工具推进到可操作工程系统。',
  '[
    {"url":"https://github.com/trending","label":"GitHub Trending"},
    {"url":"https://github.com/CoplayDev/unity-mcp","label":"Repository"},
    {"url":"https://github.com/CoplayDev/unity-mcp/releases/tag/v10.0.0","label":"Latest release"}
  ]'::jsonb,
  '{
    "pushed_at":"2026-07-06T05:24:31Z",
    "updated_at":"2026-07-06T08:59:32Z",
    "forks_count":1288,
    "stargazers_count":12099,
    "trending_stars_today":414,
    "release_tag":"v10.0.0",
    "release_date":"2026-06-30T20:03:19Z",
    "ranking_basis":"trending_then_relevance_then_recent_activity"
  }'::jsonb
),
(
  date '2026-07-06',
  timestamptz '2026-07-06T17:00:00+08:00',
  4,
  'alirezarezvani',
  'claude-skills',
  'alirezarezvani/claude-skills',
  'https://github.com/alirezarezvani/claude-skills',
  '面向 Claude Code、Codex、Cursor 与 Gemini CLI 的大规模技能与插件集合。',
  'Python',
  'Trending 392 stars today；总星 20,834；Fork 2,808',
  '推送 2026-07-06；发布 v2.9.0（2026-05-28）',
  date '2026-07-06',
  array['Claude Code','Codex','技能库']::text[],
  '过去 24 小时，AI 编程热度继续往“代理执行层”下沉：页内 GUI 代理、终端多代理、编辑器 MCP 桥接和跨代理技能包一起升温，说明开发者正把 AI 从建议工具推进到可操作工程系统。',
  '[
    {"url":"https://github.com/trending","label":"GitHub Trending"},
    {"url":"https://github.com/alirezarezvani/claude-skills","label":"Repository"},
    {"url":"https://github.com/alirezarezvani/claude-skills/releases/tag/v2.9.0","label":"Latest release"}
  ]'::jsonb,
  '{
    "pushed_at":"2026-07-06T07:10:24Z",
    "updated_at":"2026-07-06T09:02:08Z",
    "forks_count":2808,
    "stargazers_count":20834,
    "trending_stars_today":392,
    "release_tag":"v2.9.0",
    "release_date":"2026-05-28T21:22:23Z",
    "ranking_basis":"trending_then_relevance_then_recent_activity"
  }'::jsonb
),
(
  date '2026-07-06',
  timestamptz '2026-07-06T17:00:00+08:00',
  5,
  'dotnet',
  'skills',
  'dotnet/skills',
  'https://github.com/dotnet/skills',
  '微软 .NET 官方技能仓库，把 C# 与 .NET 任务沉淀为可供 AI 编码代理调用的技能集。',
  'C#',
  'Trending 246 stars today；总星 4,134；Fork 310',
  '推送 2026-07-06；发布 v1.0.0（2026-04-21）',
  date '2026-07-06',
  array['Agent 模板','CSharp','工程规范']::text[],
  '过去 24 小时，AI 编程热度继续往“代理执行层”下沉：页内 GUI 代理、终端多代理、编辑器 MCP 桥接和跨代理技能包一起升温，说明开发者正把 AI 从建议工具推进到可操作工程系统。',
  '[
    {"url":"https://github.com/trending","label":"GitHub Trending"},
    {"url":"https://github.com/dotnet/skills","label":"Repository"},
    {"url":"https://github.com/dotnet/skills/releases/tag/v1.0.0","label":"Latest release"}
  ]'::jsonb,
  '{
    "pushed_at":"2026-07-06T06:47:57Z",
    "updated_at":"2026-07-06T08:39:26Z",
    "forks_count":310,
    "stargazers_count":4134,
    "trending_stars_today":246,
    "release_tag":"v1.0.0",
    "release_date":"2026-04-21T09:21:15Z",
    "ranking_basis":"trending_then_relevance_then_recent_activity"
  }'::jsonb
);
