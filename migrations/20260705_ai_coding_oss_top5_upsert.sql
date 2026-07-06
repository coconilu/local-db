delete from ai_coding_oss_top5_items
where brief_date = date '2026-07-05';

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
  date '2026-07-05',
  timestamptz '2026-07-05T09:00:00+08:00',
  1,
  'mattpocock',
  'skills',
  'mattpocock/skills',
  'https://github.com/mattpocock/skills',
  '面向 Claude 类工作流的工程技能仓库，把可复用开发流程沉淀成可直接调用的技能单元。',
  'Shell',
  'Trending +973 stars today；总星 156,937',
  '发布 v1.0.1（2026-06-17）',
  date '2026-06-17',
  array['Claude Code','技能库','工程规范']::text[],
  '过去 24 小时，AI 编程开源热度继续向“技能层 + 终端工作流 + 编辑器桥接”集中：Claude/Codex 技能包仍有强吸星效应，终端多代理与 Unity MCP 类项目更新频繁，说明开发者正把 AI 从聊天入口推进到真实工程链路。',
  '[
    {"url":"https://github.com/trending?since=daily","label":"GitHub Trending"},
    {"url":"https://github.com/mattpocock/skills","label":"Repository"},
    {"url":"https://github.com/mattpocock/skills/releases/tag/v1.0.1","label":"Latest release"}
  ]'::jsonb,
  '{
    "pushed_at":"2026-07-03T10:37:26Z",
    "updated_at":"2026-07-05T09:03:06Z",
    "forks_count":13504,
    "stargazers_count":156937,
    "trending_stars_today":973,
    "release_tag":"v1.0.1",
    "release_date":"2026-06-17T22:07:52Z",
    "ranking_basis":"trending_then_relevance_then_recent_activity"
  }'::jsonb
),
(
  date '2026-07-05',
  timestamptz '2026-07-05T09:00:00+08:00',
  2,
  'ogulcancelik',
  'herdr',
  'ogulcancelik/herdr',
  'https://github.com/ogulcancelik/herdr',
  '运行在终端里的代理多路复用器，用统一界面管理多种 AI 编码代理与其会话生命周期。',
  'Rust',
  'Trending +707 stars today；总星 11,654',
  '发布 v0.7.1（2026-06-24）',
  date '2026-06-24',
  array['编码代理','终端编排','多代理']::text[],
  '过去 24 小时，AI 编程开源热度继续向“技能层 + 终端工作流 + 编辑器桥接”集中：Claude/Codex 技能包仍有强吸星效应，终端多代理与 Unity MCP 类项目更新频繁，说明开发者正把 AI 从聊天入口推进到真实工程链路。',
  '[
    {"url":"https://github.com/trending?since=daily","label":"GitHub Trending"},
    {"url":"https://github.com/ogulcancelik/herdr","label":"Repository"},
    {"url":"https://github.com/ogulcancelik/herdr/releases/tag/v0.7.1","label":"Latest release"}
  ]'::jsonb,
  '{
    "pushed_at":"2026-07-05T07:17:06Z",
    "updated_at":"2026-07-05T09:03:21Z",
    "forks_count":684,
    "stargazers_count":11654,
    "trending_stars_today":707,
    "release_tag":"v0.7.1",
    "release_date":"2026-06-24T13:47:11Z",
    "ranking_basis":"trending_then_relevance_then_recent_activity"
  }'::jsonb
),
(
  date '2026-07-05',
  timestamptz '2026-07-05T09:00:00+08:00',
  3,
  'agentskills',
  'agentskills',
  'agentskills/agentskills',
  'https://github.com/agentskills/agentskills',
  'Agent Skills 的开放规范与文档仓库，推动技能打包、共享与跨代理分发形成统一接口。',
  'Python',
  'Trending +351 stars today；总星 22,427',
  '仓库更新（2026-07-05）',
  date '2026-07-05',
  array['技能规范','Agent 模板','生态标准']::text[],
  '过去 24 小时，AI 编程开源热度继续向“技能层 + 终端工作流 + 编辑器桥接”集中：Claude/Codex 技能包仍有强吸星效应，终端多代理与 Unity MCP 类项目更新频繁，说明开发者正把 AI 从聊天入口推进到真实工程链路。',
  '[
    {"url":"https://github.com/trending?since=daily","label":"GitHub Trending"},
    {"url":"https://github.com/agentskills/agentskills","label":"Repository"}
  ]'::jsonb,
  '{
    "pushed_at":"2026-07-01T21:37:32Z",
    "updated_at":"2026-07-05T09:02:01Z",
    "forks_count":1418,
    "stargazers_count":22427,
    "trending_stars_today":351,
    "release_tag":null,
    "release_date":null,
    "ranking_basis":"trending_then_relevance_then_recent_activity"
  }'::jsonb
),
(
  date '2026-07-05',
  timestamptz '2026-07-05T09:00:00+08:00',
  4,
  'alirezarezvani',
  'claude-skills',
  'alirezarezvani/claude-skills',
  'https://github.com/alirezarezvani/claude-skills',
  '面向 Claude Code、Codex、Cursor、Gemini CLI 的大规模技能与插件集合，覆盖编码、评审与工作流扩展。',
  'Python',
  'Trending +136 stars today；总星 20,266',
  '发布 v2.9.0（2026-05-28）',
  date '2026-05-28',
  array['Claude Code','Codex','代码评审']::text[],
  '过去 24 小时，AI 编程开源热度继续向“技能层 + 终端工作流 + 编辑器桥接”集中：Claude/Codex 技能包仍有强吸星效应，终端多代理与 Unity MCP 类项目更新频繁，说明开发者正把 AI 从聊天入口推进到真实工程链路。',
  '[
    {"url":"https://github.com/trending?since=daily","label":"GitHub Trending"},
    {"url":"https://github.com/alirezarezvani/claude-skills","label":"Repository"},
    {"url":"https://github.com/alirezarezvani/claude-skills/releases/tag/v2.9.0","label":"Latest release"}
  ]'::jsonb,
  '{
    "pushed_at":"2026-07-03T13:41:51Z",
    "updated_at":"2026-07-05T09:02:29Z",
    "forks_count":2772,
    "stargazers_count":20266,
    "trending_stars_today":136,
    "release_tag":"v2.9.0",
    "release_date":"2026-05-28T21:22:23Z",
    "ranking_basis":"trending_then_relevance_then_recent_activity"
  }'::jsonb
),
(
  date '2026-07-05',
  timestamptz '2026-07-05T09:00:00+08:00',
  5,
  'CoplayDev',
  'unity-mcp',
  'CoplayDev/unity-mcp',
  'https://github.com/CoplayDev/unity-mcp',
  '把 Unity Editor 暴露给 AI 助手的 MCP 桥接层，可让模型直接处理脚本、场景、资源与自动化任务。',
  'C#',
  'Trending +69 stars today；总星 11,735',
  '发布 v10.0.0（2026-06-30）',
  date '2026-06-30',
  array['MCP','游戏开发','编辑器桥接']::text[],
  '过去 24 小时，AI 编程开源热度继续向“技能层 + 终端工作流 + 编辑器桥接”集中：Claude/Codex 技能包仍有强吸星效应，终端多代理与 Unity MCP 类项目更新频繁，说明开发者正把 AI 从聊天入口推进到真实工程链路。',
  '[
    {"url":"https://github.com/trending?since=daily","label":"GitHub Trending"},
    {"url":"https://github.com/CoplayDev/unity-mcp","label":"Repository"},
    {"url":"https://github.com/CoplayDev/unity-mcp/releases/tag/v10.0.0","label":"Latest release"}
  ]'::jsonb,
  '{
    "pushed_at":"2026-07-05T07:05:33Z",
    "updated_at":"2026-07-05T08:52:31Z",
    "forks_count":1269,
    "stargazers_count":11735,
    "trending_stars_today":69,
    "release_tag":"v10.0.0",
    "release_date":"2026-06-30T20:03:19Z",
    "ranking_basis":"trending_then_relevance_then_recent_activity"
  }'::jsonb
);
