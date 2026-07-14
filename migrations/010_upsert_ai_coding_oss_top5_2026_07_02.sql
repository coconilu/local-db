BEGIN;

DELETE FROM ai_coding_oss_top5_items
WHERE brief_date = DATE '2026-07-02'
  AND repo_url NOT IN (
    'https://github.com/msitarzewski/agency-agents',
    'https://github.com/diegosouzapw/OmniRoute',
    'https://github.com/ogulcancelik/herdr',
    'https://github.com/anomalyco/opencode',
    'https://github.com/QwenLM/qwen-code'
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
  DATE '2026-07-02',
  1,
  'msitarzewski',
  'agency-agents',
  'msitarzewski/agency-agents',
  'https://github.com/msitarzewski/agency-agents',
  $$把前端、产品、运营等角色封装成可协作代理团队，面向完整 AI 开发交付流程。$$,
  'Shell',
  $$Trending +2,114 today；总 Stars 124,615 / Forks 20,222$$,
  $$最近 push：2026-07-01；未见公开 latest release$$,
  DATE '2026-07-01',
  ARRAY['多代理协作', '开发工作流', '角色代理']::text[],
  $$近24小时热度集中在“多代理协作、终端编码代理、统一接入层”三条线：Trending 更偏好可复用工作流，而成熟终端代理则靠 7 月 1 日发布与 7 月 2 日持续提交维持动量。$$,
  $$[
    {"label":"GitHub Trending","url":"https://github.com/trending?since=daily"},
    {"label":"Repository","url":"https://github.com/msitarzewski/agency-agents"}
  ]$$::jsonb,
  $${
    "ranking_basis":"trending_then_relevance_then_recent_activity",
    "trending_stars_today":2114,
    "stargazers_count":124615,
    "forks_count":20222,
    "updated_at":"2026-07-02T09:03:05Z",
    "pushed_at":"2026-07-01T17:23:00Z",
    "release_tag":null,
    "release_date":null
  }$$::jsonb
),
(
  DATE '2026-07-02',
  2,
  'diegosouzapw',
  'OmniRoute',
  'diegosouzapw/OmniRoute',
  'https://github.com/diegosouzapw/OmniRoute',
  $$为 Claude Code、Codex、Cursor 等提供统一免费 AI 接入层，突出路由、压缩与容灾。$$,
  'TypeScript',
  $$Trending +1,010 today；总 Stars 9,934 / Forks 1,502$$,
  $$最近 release：v3.8.42（2026-06-30）；最近 push：2026-07-02$$,
  DATE '2026-07-02',
  ARRAY['AI 网关', '模型路由', 'MCP 接入']::text[],
  $$近24小时热度集中在“多代理协作、终端编码代理、统一接入层”三条线：Trending 更偏好可复用工作流，而成熟终端代理则靠 7 月 1 日发布与 7 月 2 日持续提交维持动量。$$,
  $$[
    {"label":"GitHub Trending","url":"https://github.com/trending?since=daily"},
    {"label":"Repository","url":"https://github.com/diegosouzapw/OmniRoute"},
    {"label":"Latest release","url":"https://github.com/diegosouzapw/OmniRoute/releases/tag/v3.8.42"}
  ]$$::jsonb,
  $${
    "ranking_basis":"trending_then_relevance_then_recent_activity",
    "trending_stars_today":1010,
    "stargazers_count":9934,
    "forks_count":1502,
    "updated_at":"2026-07-02T09:01:54Z",
    "pushed_at":"2026-07-02T08:50:15Z",
    "release_tag":"v3.8.42",
    "release_date":"2026-06-30T09:55:43Z"
  }$$::jsonb
),
(
  DATE '2026-07-02',
  3,
  'ogulcancelik',
  'herdr',
  'ogulcancelik/herdr',
  'https://github.com/ogulcancelik/herdr',
  $$把多个 Claude Code / Codex 会话收拢进一个终端多路复用器，适合并行管理多项目编码代理。$$,
  'Rust',
  $$Trending +609 today；总 Stars 9,856 / Forks 576$$,
  $$最近 release：v0.7.1（2026-06-24）；最近 push：2026-07-01$$,
  DATE '2026-07-01',
  ARRAY['编码代理', '终端编排', '多项目协作']::text[],
  $$近24小时热度集中在“多代理协作、终端编码代理、统一接入层”三条线：Trending 更偏好可复用工作流，而成熟终端代理则靠 7 月 1 日发布与 7 月 2 日持续提交维持动量。$$,
  $$[
    {"label":"GitHub Trending","url":"https://github.com/trending?since=daily"},
    {"label":"Repository","url":"https://github.com/ogulcancelik/herdr"},
    {"label":"Latest release","url":"https://github.com/ogulcancelik/herdr/releases/tag/v0.7.1"}
  ]$$::jsonb,
  $${
    "ranking_basis":"trending_then_relevance_then_recent_activity",
    "trending_stars_today":609,
    "stargazers_count":9856,
    "forks_count":576,
    "updated_at":"2026-07-02T09:01:04Z",
    "pushed_at":"2026-07-01T23:21:04Z",
    "release_tag":"v0.7.1",
    "release_date":"2026-06-24T13:47:11Z"
  }$$::jsonb
),
(
  DATE '2026-07-02',
  4,
  'anomalyco',
  'opencode',
  'anomalyco/opencode',
  'https://github.com/anomalyco/opencode',
  $$成熟的开源终端编码代理，强调在真实仓库里完成修改、执行与验证闭环。$$,
  'TypeScript',
  $$总 Stars 181,497 / Forks 22,397；7 月 1 日发布 v1.17.13$$,
  $$最近 release：v1.17.13（2026-07-01）；最近 push：2026-07-02$$,
  DATE '2026-07-02',
  ARRAY['编码代理', '终端 IDE', '自动修复']::text[],
  $$近24小时热度集中在“多代理协作、终端编码代理、统一接入层”三条线：Trending 更偏好可复用工作流，而成熟终端代理则靠 7 月 1 日发布与 7 月 2 日持续提交维持动量。$$,
  $$[
    {"label":"Repository","url":"https://github.com/anomalyco/opencode"},
    {"label":"Latest release","url":"https://github.com/anomalyco/opencode/releases/tag/v1.17.13"}
  ]$$::jsonb,
  $${
    "ranking_basis":"recent_release_plus_large_active_user_base",
    "trending_stars_today":null,
    "stargazers_count":181497,
    "forks_count":22397,
    "updated_at":"2026-07-02T09:02:57Z",
    "pushed_at":"2026-07-02T08:45:10Z",
    "release_tag":"v1.17.13",
    "release_date":"2026-07-01T15:19:06Z"
  }$$::jsonb
),
(
  DATE '2026-07-02',
  5,
  'QwenLM',
  'qwen-code',
  'QwenLM/qwen-code',
  'https://github.com/QwenLM/qwen-code',
  $$Qwen 生态的终端 AI 编码代理，主打本地命令行中的持续编码与工具调用。$$,
  'TypeScript',
  $$总 Stars 25,732 / Forks 2,591；7 月 1 日发布 v0.19.4$$,
  $$最近 release：v0.19.4（2026-07-01）；最近 push：2026-07-02$$,
  DATE '2026-07-02',
  ARRAY['编码代理', '终端助手', 'Qwen 生态']::text[],
  $$近24小时热度集中在“多代理协作、终端编码代理、统一接入层”三条线：Trending 更偏好可复用工作流，而成熟终端代理则靠 7 月 1 日发布与 7 月 2 日持续提交维持动量。$$,
  $$[
    {"label":"Repository","url":"https://github.com/QwenLM/qwen-code"},
    {"label":"Latest release","url":"https://github.com/QwenLM/qwen-code/releases/tag/v0.19.4"}
  ]$$::jsonb,
  $${
    "ranking_basis":"recent_release_plus_direct_ai_coding_relevance",
    "trending_stars_today":null,
    "stargazers_count":25732,
    "forks_count":2591,
    "updated_at":"2026-07-02T08:59:45Z",
    "pushed_at":"2026-07-02T09:00:47Z",
    "release_tag":"v0.19.4",
    "release_date":"2026-07-01T13:08:36Z"
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
