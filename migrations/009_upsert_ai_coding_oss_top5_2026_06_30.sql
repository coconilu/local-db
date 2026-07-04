DELETE FROM ai_coding_oss_top5_items
WHERE brief_date = DATE '2026-06-30';

INSERT INTO ai_coding_oss_top5_items (
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
)
VALUES
(
  DATE '2026-06-30',
  TIMESTAMPTZ '2026-06-30T17:05:04.5018491+08:00',
  1,
  'msitarzewski',
  'agency-agents',
  'msitarzewski/agency-agents',
  'https://github.com/msitarzewski/agency-agents',
  '把前端、产品、运营等角色封装成可协作代理团队，适合 AI 驱动的软件交付流水线。',
  'Shell',
  'Trending +1,425 stars today；总 Stars 119,659 / Forks 19,571',
  '最近 push 2026-06-29',
  DATE '2026-06-29',
  ARRAY['多代理', '编码代理', 'Agent 模板']::text[],
  '近 24 小时热度更偏向 AI 编码基础设施：多角色开发代理、技能分发、终端编码助手、多工具控制台和长期记忆并行升温，说明竞争已从单点生成转向可持续开发栈。',
  $$[
    {"label":"GitHub Trending","url":"https://github.com/trending?since=daily"},
    {"label":"Repository","url":"https://github.com/msitarzewski/agency-agents"}
  ]$$::jsonb,
  $${
    "ranking_basis":"trending_plus_repo_metrics",
    "trending_stars_today":1425,
    "stargazers_count":119659,
    "forks_count":19571,
    "updated_at":"2026-06-30T09:02:06Z",
    "pushed_at":"2026-06-29T18:23:32Z"
  }$$::jsonb
),
(
  DATE '2026-06-30',
  TIMESTAMPTZ '2026-06-30T17:05:04.5018491+08:00',
  2,
  'sickn33',
  'antigravity-awesome-skills',
  'sickn33/antigravity-awesome-skills',
  'https://github.com/sickn33/antigravity-awesome-skills',
  '面向 Claude Code、Codex CLI、Cursor 等的可安装技能库，降低 agent 工作流复用成本。',
  'Python',
  '总 Stars 42,042 / Forks 6,719',
  '最近 push 2026-06-30',
  DATE '2026-06-30',
  ARRAY['技能库', 'Claude Code', 'MCP']::text[],
  '近 24 小时热度更偏向 AI 编码基础设施：多角色开发代理、技能分发、终端编码助手、多工具控制台和长期记忆并行升温，说明竞争已从单点生成转向可持续开发栈。',
  $$[
    {"label":"GitHub Search","url":"https://github.com/search?q=claude-code+skills&type=repositories"},
    {"label":"Repository","url":"https://github.com/sickn33/antigravity-awesome-skills"}
  ]$$::jsonb,
  $${
    "ranking_basis":"repo_metrics_and_search_relevance",
    "stargazers_count":42042,
    "forks_count":6719,
    "updated_at":"2026-06-30T08:50:04Z",
    "pushed_at":"2026-06-30T07:20:11Z"
  }$$::jsonb
),
(
  DATE '2026-06-30',
  TIMESTAMPTZ '2026-06-30T17:05:04.5018491+08:00',
  3,
  'can1357',
  'oh-my-pi',
  'can1357/oh-my-pi',
  'https://github.com/can1357/oh-my-pi',
  '终端内的 AI 编码代理，集成哈希锚定编辑、LSP、浏览器与子代理能力。',
  'TypeScript',
  '总 Stars 15,247 / Forks 1,350',
  '最近 push 2026-06-30',
  DATE '2026-06-30',
  ARRAY['编码代理', '终端 IDE', '子代理']::text[],
  '近 24 小时热度更偏向 AI 编码基础设施：多角色开发代理、技能分发、终端编码助手、多工具控制台和长期记忆并行升温，说明竞争已从单点生成转向可持续开发栈。',
  $$[
    {"label":"GitHub Search","url":"https://github.com/search?q=ai+coding+agent+terminal&type=repositories"},
    {"label":"Repository","url":"https://github.com/can1357/oh-my-pi"}
  ]$$::jsonb,
  $${
    "ranking_basis":"repo_metrics_and_search_relevance",
    "stargazers_count":15247,
    "forks_count":1350,
    "updated_at":"2026-06-30T08:55:21Z",
    "pushed_at":"2026-06-30T08:05:13Z"
  }$$::jsonb
),
(
  DATE '2026-06-30',
  TIMESTAMPTZ '2026-06-30T17:05:04.5018491+08:00',
  4,
  'farion1231',
  'cc-switch',
  'farion1231/cc-switch',
  'https://github.com/farion1231/cc-switch',
  '把 Claude Code、Codex、OpenCode 等集中到一个桌面控制台，统一管理模型与技能入口。',
  'Rust',
  '总 Stars 110,995 / Forks 7,342',
  '最近 push 2026-06-30',
  DATE '2026-06-30',
  ARRAY['控制台', '多模型', 'Claude Code']::text[],
  '近 24 小时热度更偏向 AI 编码基础设施：多角色开发代理、技能分发、终端编码助手、多工具控制台和长期记忆并行升温，说明竞争已从单点生成转向可持续开发栈。',
  $$[
    {"label":"GitHub Search","url":"https://github.com/search?q=Claude+Code+Codex+desktop+assistant&type=repositories"},
    {"label":"Repository","url":"https://github.com/farion1231/cc-switch"}
  ]$$::jsonb,
  $${
    "ranking_basis":"repo_metrics_and_search_relevance",
    "stargazers_count":110995,
    "forks_count":7342,
    "updated_at":"2026-06-30T09:02:10Z",
    "pushed_at":"2026-06-30T08:42:17Z"
  }$$::jsonb
),
(
  DATE '2026-06-30',
  TIMESTAMPTZ '2026-06-30T17:05:04.5018491+08:00',
  5,
  'spelunk-cloud',
  'spelunk',
  'spelunk-cloud/spelunk',
  'https://github.com/spelunk-cloud/spelunk',
  '为 AI 编码代理提供 Git 原生、代码感知的长期记忆层，补足跨会话上下文。',
  'Rust',
  '总 Stars 5 / Forks 0',
  '最近 push 2026-06-30',
  DATE '2026-06-30',
  ARRAY['长期记忆', '代码搜索', 'Agent 基础设施']::text[],
  '近 24 小时热度更偏向 AI 编码基础设施：多角色开发代理、技能分发、终端编码助手、多工具控制台和长期记忆并行升温，说明竞争已从单点生成转向可持续开发栈。',
  $$[
    {"label":"GitHub Search","url":"https://github.com/search?q=ai+coding+agent+memory&type=repositories"},
    {"label":"Repository","url":"https://github.com/spelunk-cloud/spelunk"}
  ]$$::jsonb,
  $${
    "ranking_basis":"fresh_update_and_direct_relevance",
    "stargazers_count":5,
    "forks_count":0,
    "updated_at":"2026-06-30T09:02:58Z",
    "pushed_at":"2026-06-30T09:02:55Z"
  }$$::jsonb
);
