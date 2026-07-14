-- Note: eve framework by Vercel
INSERT INTO notes (content, tags) VALUES (
'# Vercel eve — Agent 领域的 Next.js

## 核心定位

**eve** 是 Vercel 开源的 Agent 框架（Apache-2.0），定位「Agent 领域的 Next.js」。它不是又一个套壳玩具，而是对 Agent 开发体验的**工程化重构**，面向生产环境。

---

## Agent 开发的真实痛点

> **不是 Agent 难写，是基建太重。**

- Demo 很快就能跑起来，难的是把它真正推向生产。
- 开发者花 **80% 时间**在基建工作（持久化、沙箱隔离、系统集成、审批控制、监控告警、日志审计）
- 只花 **20% 时间**在核心逻辑
- 真正耗时的往往不是业务逻辑，而是那些不得不做的「工程化脏活」

---

## 核心设计理念：Filesystem-First

eve 的核心理念是 **「目录即 Agent」** —— 像 Next.js 把目录变成路由一样，eve 把目录变成 Agent。

```
my-agent/
├── agent.ts          # 模型配置
├── instructions.md   # 系统提示词
├── tools/            # 工具自动发现
│   └── run_sql.ts
└── skills/           # 技能按需加载
    └── revenue-definitions.md
```

### 四大特性

| 特性 | 说明 |
|------|------|
| **目录 = Agent** | 一眼看懂职责边界 |
| **工具自动发现** | 文件名就是工具名，无需额外注册 |
| **技能按需加载** | 业务规则写进 Markdown，需要时自动加载 |
| **协作更轻** | 减少意大利面代码，新人上手更快 |

---

## 开箱即用的生产级基建

### 1. 持久化执行（Checkpointed Workflow）

- 底层集成 Workflow SDK
- Agent 每一步自动记录状态
- 崩溃/重启后从最近 Checkpoint 恢复，**不会从头重跑**
- 支持暂停等待（人工审批、外部消息）

### 2. 续跑 + 安全

| 能力 | 说明 |
|------|------|
| **幂等设计** | 外部调用可重试，不造成重复副作用 |
| **人工审批** | 高风险操作先确认再执行 |
| **工具权限** | 窄工具、最小权限、可审计 |
| **沙箱分层** | AI 生成的代码在独立 Sandbox 中运行 |

支持的后端：Vercel Sandbox / Docker / Microsandbox / Bash

### 3. 极简 Human-in-the-Loop 与多渠道分发

- 一行 `needsApproval` 即可让风险操作自动停下
- **Write Once, Run Anywhere** —— 同一份 Agent 代码接入 Slack、Discord、Teams、HTTP API、GitHub、定时任务等多种渠道

---

## 真实生产验证

Vercel 官方已用 eve 构建运行了 **数百个 Agents**，典型应用包括：

| Agent | 功能 |
|-------|------|
| **d0** 数据分析 Agent | 每天处理数百个分析问题 |
| 销售线索 Agent | 自动筛选与路由 |
| 客服支持 Agent | 支持流程自动化 |
| 内容 Agent | 生成草稿、内容整理 |
| v0 / 产品侧 Agent | 面向真实用户 |
| Vercel Agent | 评审、调查、建议动作 |

---

## 未来方向：系统化协作

未来 Agent 形态将是 **多 Agent 编排 + 约定优于配置 + 自带基建**。

eve 值得借鉴的 5 个约定：

| 约定 | 含义 |
|------|------|
| 文件系统 | 目录即能力 |
| Workflow | 持久化执行 |
| Sandbox | 隔离不可信代码 |
| Channel | 一次编写，多处接入 |
| Evals | 持续验证质量 |

---

## 最佳实践（5 步法）

1. **写好 Instructions** — 角色清晰、规则具体、不能答就直说
2. **工具单一职责** — 一个 Tool 做一件事，输入输出清晰，用 Zod 定义 schema
3. **用 Skills 教方法** — 把经验写成 Markdown，需要时自动加载
4. **关键操作要审批** — 提高安全性与用户信任
5. **监控与追踪** — 用 OpenTelemetry 看清行为，定期复盘

> **核心目标：不是让 Agent 更炫，而是让它更准、更稳、更可控。**

---

## 总结

**Agent 不是脚本，而是系统工程。**

eve 的底气不在于 Prompt 更花哨，而在于把大模型变成**可靠的工程组件**，用稳定、安全、可追溯的工程脚手架去对冲大模型本身的不确定性。

- 开源地址：`github.com/vercel/eve`
- 当前状态：Public Preview（API/文档/行为 GA 前可能变化）
',
    array['ai', 'agent', 'vercel', 'eve', 'framework', 'engineering']
) RETURNING id, content, tags, created_at;
