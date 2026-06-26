# Local PostgreSQL Dashboard

一个本地优先的 PostgreSQL 工作台。项目用 Docker Compose 启动 PostgreSQL、自动初始化数据库 schema、提供 FastAPI 只读 API，并用 React Dashboard 展示数据。

默认入口：

```text
http://localhost:15173
```

同一家庭网络里的其他设备访问：

```text
http://<Windows-LAN-IP>:15173
```

## 功能范围

- PostgreSQL 17 本地数据库，数据保存在 Docker volume 中。
- Docker 自动初始化 `notes`、`agent_test_items`、`ai_news_items` 表。
- Dockerized SQL 工具服务 `db-tools`，不要求用户安装本地 PostgreSQL client。
- React/Vite Dashboard，包含 Overview、Notes、AI News、Tables、Read-only Query。
- FastAPI 后端，只读访问数据库，默认不直接暴露到宿主机。
- 可选 agent skill 模板，让 Codex、Kimi、Claude Code、Gemini 等 agent 学会用 Docker CLI 操作数据库。

当前配置适合本机和可信家庭局域网，不是公网生产环境配置。

## 前提条件

基础使用只需要：

- Docker Desktop 或 Docker Engine。
- Docker Compose v2。
- 默认端口未被占用：
  - `15173`: Dashboard 对外端口。
  - `5432`: PostgreSQL 对外端口。

检查 Docker Compose：

```bash
docker compose version
```

不需要本机安装：

- Node.js
- Python
- PostgreSQL client

Python 脚本仍保留在 `local-postgres-tools/`，但它们只是可选辅助工具，不是 clone 后使用项目的必要条件。

## 快速开始

clone 后进入项目目录：

```bash
git clone <your-repo-url> local-db
cd local-db
```

首次启动：

```bash
docker compose up -d --build
```

打开 Dashboard：

```text
http://localhost:15173
```

验证数据库：

```bash
docker compose run --rm -T db-tools -c "select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name;"
```

预期能看到：

```text
agent_test_items
ai_news_items
notes
```

## `docker compose up -d --build` 是否幂等

是的，在这个项目里它可以反复执行：

- 容器不存在时会创建。
- 容器已存在时会让服务收敛到 compose 文件描述的状态。
- 镜像或源码变更时会重新构建相关镜像。
- 数据保存在 `pg_data` volume 中，不会因为 `up -d --build` 被清空。
- `db-init` 使用幂等 SQL，重复运行不会重复建表或破坏已有数据。

平时如果代码没有变化，可以用更轻的命令：

```bash
docker compose up -d
```

电脑重启后是否需要再次执行，取决于 Docker 是否自动启动：

- 如果 Docker Desktop 自动启动，并且容器是 `restart: unless-stopped`，通常不需要手动执行。
- 如果 Docker 没有自动启动，先打开 Docker Desktop，再执行 `docker compose up -d`。
- 如果你手动 `docker compose stop` 或 `docker compose down` 过，需要再次 `docker compose up -d`。

## 生命周期命令

查看状态：

```bash
docker compose ps
```

启动或恢复服务：

```bash
docker compose up -d
```

代码更新后重新构建并启动：

```bash
docker compose up -d --build
```

重启长期运行的服务：

```bash
docker compose restart postgres dashboard-api dashboard-web
```

停止服务但保留容器和数据：

```bash
docker compose stop
```

关闭并移除容器和网络，但保留数据库 volume：

```bash
docker compose down
```

关闭并删除数据库数据：

```bash
docker compose down -v
```

注意：`docker compose down -v` 会删除 `pg_data`，数据库数据会丢失。

## 数据库初始化

`docker compose up -d --build` 会启动一次性服务 `db-init`，它会执行：

- `local-postgres-tools/schema.sql`
- `migrations/001_create_agent_test_items.sql`
- `migrations/002_create_ai_news_items.sql`

这些 SQL 是幂等的，可以安全重复执行。

如果你从旧版本升级，已有 volume 但缺少表，可以手动重跑初始化：

```bash
docker compose run --rm -T db-init
```

如果新增了 migration，也可以通过 Docker 执行：

```bash
docker compose run --rm -T db-tools -f /migrations/001_create_agent_test_items.sql
```

## 服务说明

| 服务 | 容器名 | 说明 | 对外端口 |
| --- | --- | --- | --- |
| `postgres` | `local-postgres` | PostgreSQL 17 | `5432` |
| `db-init` | Compose 自动命名 | 一次性 schema 初始化服务 | 不暴露 |
| `db-tools` | 临时容器 | Dockerized `psql` 工具 | 不暴露 |
| `dashboard-api` | `local-postgres-dashboard-api` | FastAPI 只读 API | 不暴露 |
| `dashboard-web` | `local-postgres-dashboard-web` | Vite React Dashboard | `15173` |

Compose 内部连接方式：

- API 连接数据库：`postgres:5432`
- Web 代理 API：`http://dashboard-api:8000`
- `db-tools` 连接数据库：`postgres:5432`
- 浏览器访问 Web：`http://localhost:15173`

`15173` 是宿主机端口。容器内部 Vite 仍然运行在 `5173`。如果想改端口，修改 `compose.yaml`：

```yaml
ports:
  - "0.0.0.0:18080:5173"
```

## Dashboard 使用手册

### Overview

展示当前数据库概况：

- public tables 数量。
- notes 数量。
- AI news 数量。
- 当前模式：read-only。

### Notes

只读展示 `notes` 表内容。可以用顶部搜索框搜索 notes 内容。

新增一条 note：

```bash
docker compose run --rm -T db-tools -c "insert into notes (content, tags) values ('first local note', array['test','local']::text[]) returning id, content, tags, created_at;"
```

查询最近 notes：

```bash
docker compose run --rm -T db-tools -c "select id, left(content, 120) as content, tags, created_at from notes order by created_at desc limit 10;"
```

### AI News

只读展示 `ai_news_items` 表内容。适合存放 AI coding、工具、论文、开源项目等信号条目。

插入示例：

```bash
docker compose run --rm -T db-tools -c "insert into ai_news_items (priority, category, signal_type, verification_status, title, source_name, source_url, summary, tags) values ('medium', 'tooling', 'blog', 'unverified', 'Example signal', 'Example', 'https://example.com', 'Example summary', array['ai','tooling']::text[]) returning id, title, created_at;"
```

### Tables

展示 public schema 下的表、字段和索引。适合快速确认 schema 是否创建成功。

### Read-only Query

执行只读 SQL。当前只允许：

- `SELECT`
- `WITH`

示例：

```sql
select count(*) as notes_count from notes
```

写入或 schema 变更语句会被拒绝，例如 `insert`、`update`、`delete`、`drop`、`alter`、`create`。

## Docker SQL CLI 使用手册

项目内置 `db-tools` 服务，本质是 Dockerized `psql`：

```bash
docker compose run --rm -T db-tools -c "select now();"
```

列出 public tables：

```bash
docker compose run --rm -T db-tools -c "select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name;"
```

描述 `notes` 表：

```bash
docker compose run --rm -T db-tools -c "select column_name, data_type, is_nullable, coalesce(column_default, '') as column_default from information_schema.columns where table_schema = 'public' and table_name = 'notes' order by ordinal_position;"
```

新增 note，并返回新增行：

```bash
docker compose run --rm -T db-tools -c "insert into notes (content, tags) values ('note text', array['idea','local']::text[]) returning id, content, tags, created_at;"
```

修改 note，并返回修改行：

```bash
docker compose run --rm -T db-tools -c "update notes set content = 'updated note', tags = array['edited']::text[] where id = 1 returning id, content, tags, updated_at;"
```

删除 note，并返回删除 id：

```bash
docker compose run --rm -T db-tools -c "delete from notes where id = 1 returning id;"
```

写操作建议总是带 `returning`，然后再执行一次 `select` 验证最终状态。

连接交互式 psql：

```bash
docker compose run --rm db-tools
```

## API 使用手册

API 默认不直接暴露到宿主机，但可以通过 Dashboard Web 的 Vite proxy 访问 `/api`。

健康检查：

```bash
curl http://127.0.0.1:15173/api/health
```

读取 notes：

```bash
curl "http://127.0.0.1:15173/api/notes?limit=20"
```

读取 AI news：

```bash
curl "http://127.0.0.1:15173/api/ai-news?limit=20"
```

读取表列表：

```bash
curl http://127.0.0.1:15173/api/tables
```

执行只读查询：

```bash
curl -sS -H "Content-Type: application/json" \
  --data '{"sql":"select count(*) as notes_count from notes"}' \
  http://127.0.0.1:15173/api/query/read-only
```

主要接口：

| Method | Path | 说明 |
| --- | --- | --- |
| `GET` | `/api/health` | API 和数据库健康检查 |
| `GET` | `/api/notes` | 读取 notes |
| `GET` | `/api/ai-news` | 读取 AI news |
| `GET` | `/api/tables` | 读取 public tables |
| `GET` | `/api/tables/{table}` | 读取表字段和索引 |
| `POST` | `/api/query/read-only` | 执行只读 SQL |

## Agent Skill 注册

clone 项目后，skill 不会自动全局生效。项目内置了一份通用 skill 模板：

```text
.agents/skills/local-postgres-notes/SKILL.md
```

跨 agent 的安装指导在：

[docs/agent-skill-install.md](docs/agent-skill-install.md)

核心逻辑：

- 把 skill 模板复制或注册到当前 agent 的 skill、workflow、rules、memory 或 project instructions 位置。
- 把模板中的 `__LOCAL_DB_REPO_PATH__` 替换为当前 clone 目录的绝对路径。
- 重启或 reload agent。
- 让 agent 通过 `docker compose run --rm -T db-tools ...` 验证数据库表。

Windows 用户可以使用可选 helper：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-skill.ps1
```

但这个脚本只是便利工具。通用方案是阅读并执行 `docs/agent-skill-install.md`。

## 局域网访问

查看本机局域网 IP：

Windows:

```powershell
ipconfig
```

macOS/Linux:

```bash
ifconfig
```

同一 Wi-Fi 或局域网里的设备访问：

```text
http://<Windows-LAN-IP>:15173
```

如果打不开，优先检查：

- 防火墙是否允许入站访问 `15173`。
- 两台设备是否在同一个局域网。
- Dashboard 容器是否运行：`docker compose ps`。
- URL 端口是否写成了 `15173`。

## 项目结构

```text
.
|-- compose.yaml
|-- backend/
|   |-- Dockerfile
|   |-- requirements.txt
|   `-- app/main.py
|-- frontend/
|   |-- Dockerfile
|   |-- package.json
|   |-- vite.config.ts
|   `-- src/
|-- local-postgres-tools/
|   |-- schema.sql
|   |-- dbnote.py
|   |-- dbadmin.py
|   `-- ainews.py
|-- migrations/
|   |-- 001_create_agent_test_items.sql
|   `-- 002_create_ai_news_items.sql
|-- .agents/skills/local-postgres-notes/
|   `-- SKILL.md
|-- docs/
|   `-- agent-skill-install.md
`-- scripts/
    `-- install-skill.ps1
```

## 开发说明

前端开发服务运行在容器内：

```bash
docker compose up -d --build dashboard-web
```

后端运行在容器内：

```bash
docker compose up -d --build dashboard-api
```

检查前端构建：

```bash
docker compose exec -T dashboard-web npm run build
```

检查 Compose 配置：

```bash
docker compose config
```

## 安全边界

当前配置适合本机和可信局域网开发，不建议直接暴露到公网：

- PostgreSQL 端口 `5432` 暴露在 `0.0.0.0`，方便局域网访问。
- Dashboard 没有登录系统。
- API 是只读设计，但数据库本身仍接受有效凭据连接。
- `compose.yaml` 里包含本地开发用数据库配置。公开仓库或多人使用时，建议改为 `.env` 管理。

## 常见问题

### Dashboard 能打开，但数据接口报错

先重跑初始化：

```bash
docker compose run --rm -T db-init
```

再检查 API：

```bash
curl http://127.0.0.1:15173/api/health
```

### `15173` 端口被占用

修改 `compose.yaml`：

```yaml
ports:
  - "0.0.0.0:18080:5173"
```

然后重新启动：

```bash
docker compose up -d --build dashboard-web
```

### MacBook 或其他设备无法访问

检查：

- Windows IP 是否正确。
- 使用的是 `http://<Windows-LAN-IP>:15173`。
- Windows 防火墙是否放行。
- `dashboard-web` 端口是否为 `0.0.0.0:15173->5173/tcp`：

```bash
docker compose ps
```

### 想完全重来

```bash
docker compose down -v
docker compose up -d --build
```

这会删除旧数据库 volume 并重新初始化 schema。
