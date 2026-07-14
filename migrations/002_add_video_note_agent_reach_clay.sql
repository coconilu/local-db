-- 视频笔记：Agent-Reach + Clay 让 AI Agent 获得真正的互联网视野
INSERT INTO notes (content, tags) VALUES (
'## Agent-Reach + Clay：给 AI Agent 真正的互联网视野

> 来源：Bilibili 视频 BV1suj86iEGF（GoldenSpiderAI 频道，Jack 主讲）
> 核心主题：如何让 AI Agent（如 Hermes）突破基础搜索限制，获得深度互联网信息访问能力

---

## 一、核心问题：AI Agent 是"被锁在图书馆外的天才"

目前大多数 AI Agent（Claude、Hermes 等）的互联网能力非常有限：
- 只能做最基础的**公开网页搜索**
- 无法访问 **LinkedIn**（登录墙）
- 无法访问 **Reddit**（内容屏蔽）
- 无法访问 **X/Twitter**（需登录）
- 无法获取 **YouTube** 深层内容（字幕、评论）
- 无法深入 **GitHub** 仓库详情

> 比喻：Agent 能推理一切，但拿不到真正的信息——就像天才被锁在图书馆门外。

---

## 二、解决方案：两级升级架构

### Level 1 — Agent-Reach（给 Agent "眼睛"）

| 属性 | 详情 |
|------|------|
| 项目 | **Agent-Reach**（GitHub 开源） |
| 仓库 | `Panniantong/Agent-Reach` |
| Stars | 32k+，GitHub Trending #1 |
| 接入方式 | 一条命令接入 Hermes Agent |
| 费用 | 零 API 费用 |

**支持的信息源：**
- X（Twitter）
- Reddit
- LinkedIn
- YouTube（含字幕提取）
- GitHub
- RSS Feeds
- V2EX
- 小红书
- Bilibili
- 通用网页搜索

**核心优势：**
1. **返回结构化干净文本**，而非原始 HTML
2. **Token 消耗降低 30-40%**（原始 HTML 约 86,000 tokens → 清洁文本约 34,000 tokens）
3. **幻觉更少**（结构化输入减少模型编造）
4. **多搜索源备份**，自动 fallback，更稳健
5. **后台自动更新**，持续维护

**安装方式：**
```bash
# 在 Hermes Agent 中通过 GitHub 仓库一键安装
# 仓库地址：https://github.com/Panniantong/Agent-Reach
```

---

### Level 2 — Clay（给 Agent "验证深度 + 行动能力"）

| 属性 | 详情 |
|------|------|
| 产品 | **Clay**（GTM 数据平台） |
| 用户 | OpenAI、Anthropic、Canva、Vanta、Stripe 等 |
| 连接方式 | **MCP（Model Context Protocol）** |
| 费用 | 按查询付费（约 $0.5/次） |

**Clay 核心能力：**
- **Verified Emails & Phones**：覆盖 150+ 数据提供商，只按命中付费
- **Find the Committee**：按角色查找公司决策者（不只是名字）
- **Claygent AI Research**：AI 研究员，自动跑数千行数据
- **Score & Sync**：按 ICP 评分，直写 Salesforce/HubSpot
- **Personalised Outreach**：AI 根据富化数据写消息并发送序列
- **Signals 24/7**：监控职位变动、融资、网站行为等信号

**与 Hermes 的连接方式：**
1. 在 Hermes 的 Connectors 中找到 Clay
2. 通过 **OAuth** 完成身份验证（无需 API Key）
3. 授权工作空间访问
4. Hermes 即可调用 Clay 的全部工具

---

## 三、实际演示场景

### 场景 1：语音命令安装 Agent-Reach
- 在 Claude Code OS 中通过自然语言完成安装
- Hermes 自动拉取仓库、配置、启动

### 场景 2：YouTube 视频深度分析
- Agent 直接提取视频字幕
- 总结内容、判断价值、给出建议

### 场景 3：GitHub 仓库侦察
- 输入仓库链接
- Agent 自动分析：stars、趋势、技术栈、社区活跃度
- 给出"是否值得做视频"的专业判断

### 场景 4：连接 Clay 做商业拓展
- 找到 OpenAI & Anthropic 的 **6 位关键联系人**
- 自动生成：
  - 个性化合作方案
  - 每位联系人的背景分析
  - 最佳切入角度
  - 草稿邮件（含发件顺序建议）
- 自动从 Clay 数据库补全联系人邮箱

---

## 四、Token 效率对比

| 指标 | 原始 HTML | 清洁结构化文本 |
|------|-----------|---------------|
| 10 页内容 Token 数 | ~86,000 | ~34,000 |
| 相对消耗 | **2.5x** | **1x**（基准） |
| 节省比例 | — | **30-40%** |
| 幻觉率 | 较高 | 较低 |

> 关键：Agent-Reach 不是返回原始 HTML，而是提取并结构化后的干净文本。

---

## 五、最终愿景：研究智能系统

```
┌─────────────────────────────────────────────┐
│         Research Intelligence System         │
├─────────────────────────────────────────────┤
│  Agent-Reach  →  广度（互联网视野）         │
│  Clay         →  深度（验证 + 行动）        │
│  Hermes       →  本地大脑（协调 + 决策）    │
└─────────────────────────────────────────────┘
```

**目标**：构建一个成熟的 AI 操作系统，让 Agent：
- 不只是**回答问题**
- 而是真正**知道**（获取验证信息）
- 并能**做到**（自动执行 outreach、研究、分析）

---

## 六、相关链接

- **Agent-Reach GitHub**：https://github.com/Panniantong/Agent-Reach
- **Clay 官网**：https://clay.com
- **Hermes Agent**：基于 Claude Code OS 的本地 AI 操作系统
- **MCP（Model Context Protocol）**：Anthropic 推出的 AI 工具连接标准

---

## 七、个人思考

这套组合的核心价值在于：
1. **打破信息茧房**——Agent 不再受限于公开搜索的表层信息
2. **降低使用成本**——结构化输出显著减少 Token 消耗
3. **提升商业效率**——从"信息获取"到"自动执行"的闭环
4. **开源 + 商业结合**——Agent-Reach 开源免费，Clay 提供专业深度

对于内容创作者、销售团队、研究人员来说，这是一个极具实用价值的 Agent 增强方案。',
array['AI', 'Agent', 'Agent-Reach', 'Clay', 'MCP', 'Hermes', '视频笔记', '工具']
::text[]
) RETURNING id, content, tags, created_at;
