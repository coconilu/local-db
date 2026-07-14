BEGIN;

DELETE FROM ai_coding_oss_top5_items
WHERE brief_date = DATE '2026-07-03'
  AND repo_url NOT IN (
    'https://github.com/obra/superpowers',
    'https://github.com/NousResearch/hermes-agent',
    'https://github.com/affaan-m/ECC',
    'https://github.com/openai/codex-plugin-cc',
    'https://github.com/anthropics/claude-code'
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
  DATE '2026-07-03',
  1,
  'obra',
  'superpowers',
  'obra/superpowers',
  'https://github.com/obra/superpowers',
  $$面向 AI 编码代理的 skills 框架与软件开发方法论，强调可复用工作流与多代理协作。$$,
  'Shell',
  $$Trending +897 today；244,964 stars / 21,713 forks$$,
  $$最新 release：v6.1.1（2026-07-02）；最近 push：2026-07-02$$,
  DATE '2026-07-02',
  ARRAY['编码代理', '技能框架', '开发流程']::text[],
  $$过去 24 小时热度集中在编码代理基础设施、跨助手协作插件与终端型 agent。superpowers 与 hermes-agent 领跑，claude-code 和 codex-plugin-cc 则继续强化“跨代理协同 + 实际落地编码”的主线。$$,
  $$[
    {"label":"GitHub Trending","url":"https://github.com/trending?since=daily"},
    {"label":"GitHub Search","url":"https://github.com/search?q=agentic+coding+stars%3A%3E1000&type=repositories"},
    {"label":"Repository","url":"https://github.com/obra/superpowers"},
    {"label":"Latest release","url":"https://github.com/obra/superpowers/releases/tag/v6.1.1"}
  ]$$::jsonb,
  $${
    "ranking_basis":"trending_then_relevance_then_recent_activity",
    "trending_stars_today":897,
    "stargazers_count":244964,
    "forks_count":21713,
    "updated_at":"2026-07-03T09:02:26Z",
    "pushed_at":"2026-07-02T21:58:21Z",
    "release_tag":"v6.1.1",
    "release_date":"2026-07-02T21:58:30Z"
  }$$::jsonb
),
(
  DATE '2026-07-03',
  2,
  'NousResearch',
  'hermes-agent',
  'NousResearch/hermes-agent',
  'https://github.com/NousResearch/hermes-agent',
  $$高热度 agent 运行框架，承接长期任务、记忆与工具调用，适合作为 AI 编码代理底座。$$,
  'Python',
  $$Trending +829 today；208,327 stars / 37,910 forks$$,
  $$最新 release：v2026.7.1（2026-07-01）；最近 push：2026-07-03$$,
  DATE '2026-07-03',
  ARRAY['编码代理', '长期记忆', 'Agent 框架']::text[],
  $$过去 24 小时热度集中在编码代理基础设施、跨助手协作插件与终端型 agent。superpowers 与 hermes-agent 领跑，claude-code 和 codex-plugin-cc 则继续强化“跨代理协同 + 实际落地编码”的主线。$$,
  $$[
    {"label":"GitHub Trending Python","url":"https://github.com/trending/python?since=daily"},
    {"label":"Repository","url":"https://github.com/NousResearch/hermes-agent"},
    {"label":"Latest release","url":"https://github.com/NousResearch/hermes-agent/releases/tag/v2026.7.1"}
  ]$$::jsonb,
  $${
    "ranking_basis":"trending_then_relevance_then_recent_activity",
    "trending_stars_today":829,
    "stargazers_count":208327,
    "forks_count":37910,
    "updated_at":"2026-07-03T09:02:21Z",
    "pushed_at":"2026-07-03T08:56:41Z",
    "release_tag":"v2026.7.1",
    "release_date":"2026-07-01T20:08:06Z"
  }$$::jsonb
),
(
  DATE '2026-07-03',
  3,
  'affaan-m',
  'ECC',
  'affaan-m/ECC',
  'https://github.com/affaan-m/ECC',
  $$围绕 Claude Code、Codex、Cursor 等的 agent harness 优化系统，主打记忆、研究优先与安全约束。$$,
  'JavaScript',
  $$Trending +486 today；225,421 stars / 34,483 forks$$,
  $$最新 release：v2.0.0（2026-06-10）；最近 push：2026-07-03$$,
  DATE '2026-07-03',
  ARRAY['Agent Harness', '长期记忆', '研究优先']::text[],
  $$过去 24 小时热度集中在编码代理基础设施、跨助手协作插件与终端型 agent。superpowers 与 hermes-agent 领跑，claude-code 和 codex-plugin-cc 则继续强化“跨代理协同 + 实际落地编码”的主线。$$,
  $$[
    {"label":"GitHub Trending","url":"https://github.com/trending?since=daily"},
    {"label":"Repository","url":"https://github.com/affaan-m/ECC"},
    {"label":"Latest release","url":"https://github.com/affaan-m/ECC/releases/tag/v2.0.0"}
  ]$$::jsonb,
  $${
    "ranking_basis":"trending_then_relevance_then_recent_activity",
    "trending_stars_today":486,
    "stargazers_count":225421,
    "forks_count":34483,
    "updated_at":"2026-07-03T09:02:29Z",
    "pushed_at":"2026-07-03T01:27:41Z",
    "release_tag":"v2.0.0",
    "release_date":"2026-06-10T01:49:20Z"
  }$$::jsonb
),
(
  DATE '2026-07-03',
  4,
  'openai',
  'codex-plugin-cc',
  'openai/codex-plugin-cc',
  'https://github.com/openai/codex-plugin-cc',
  $$把 Codex 接到 Claude Code 的插件层，适合代码评审、任务委派与跨助手协同编码。$$,
  'JavaScript',
  $$Trending +352 today；22,852 stars / 1,390 forks$$,
  $$最新 release：v1.0.5（2026-06-23）；仓库页 2026-07-03 仍有更新$$,
  DATE '2026-07-03',
  ARRAY['Claude Code', '代码评审', '跨代理协作']::text[],
  $$过去 24 小时热度集中在编码代理基础设施、跨助手协作插件与终端型 agent。superpowers 与 hermes-agent 领跑，claude-code 和 codex-plugin-cc 则继续强化“跨代理协同 + 实际落地编码”的主线。$$,
  $$[
    {"label":"GitHub Trending","url":"https://github.com/trending?since=daily"},
    {"label":"Repository","url":"https://github.com/openai/codex-plugin-cc"},
    {"label":"Latest release","url":"https://github.com/openai/codex-plugin-cc/releases/tag/v1.0.5"}
  ]$$::jsonb,
  $${
    "ranking_basis":"trending_then_relevance_then_recent_activity",
    "trending_stars_today":352,
    "stargazers_count":22852,
    "forks_count":1390,
    "updated_at":"2026-07-03T08:58:43Z",
    "pushed_at":"2026-06-23T17:36:38Z",
    "release_tag":"v1.0.5",
    "release_date":"2026-06-23T17:36:38Z"
  }$$::jsonb
),
(
  DATE '2026-07-03',
  5,
  'anthropics',
  'claude-code',
  'anthropics/claude-code',
  'https://github.com/anthropics/claude-code',
  $$终端内的 agentic coding 工具，直接在真实仓库里执行修改、解释代码并处理 Git 工作流。$$,
  'Python',
  $$Trending +202 today；135,592 stars / 21,839 forks$$,
  $$最新 release：v2.1.199（2026-07-02）；最近 push：2026-07-02$$,
  DATE '2026-07-02',
  ARRAY['编码代理', '终端助手', 'Git 工作流']::text[],
  $$过去 24 小时热度集中在编码代理基础设施、跨助手协作插件与终端型 agent。superpowers 与 hermes-agent 领跑，claude-code 和 codex-plugin-cc 则继续强化“跨代理协同 + 实际落地编码”的主线。$$,
  $$[
    {"label":"GitHub Trending Python","url":"https://github.com/trending/python?since=daily"},
    {"label":"Repository","url":"https://github.com/anthropics/claude-code"},
    {"label":"Latest release","url":"https://github.com/anthropics/claude-code/releases/tag/v2.1.199"}
  ]$$::jsonb,
  $${
    "ranking_basis":"trending_then_relevance_then_recent_activity",
    "trending_stars_today":202,
    "stargazers_count":135592,
    "forks_count":21839,
    "updated_at":"2026-07-03T09:00:00Z",
    "pushed_at":"2026-07-02T23:35:18Z",
    "release_tag":"v2.1.199",
    "release_date":"2026-07-02T23:35:18Z"
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
