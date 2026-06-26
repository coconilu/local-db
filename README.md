# Local PostgreSQL Dashboard

一个本地优先的 PostgreSQL 工作台。项目用 Docker Compose 同时启动 PostgreSQL、FastAPI 只读 API 和 React Dashboard，适合在个人电脑或家庭局域网里给 agent、CLI、小工具共享一个本地数据库。

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
- React/Vite Dashboard，包含 Overview、Notes、AI News、Tables、Read-only Query。
- FastAPI 后端，只读访问数据库，默认不直接暴露到宿主机。
- Python CLI 工具，用于 notes CRUD、执行 SQL、应用 migrations、导入 AI news JSON。
- 默认面向本机和可信家庭局域网，不是生产环境配置。

## 前提条件

必须：

- Docker Desktop 或 Docker Engine 已安装并正在运行。
- Docker Compose v2 可用，可以执行：

```powershell
docker compose version
```

- 默认端口没有冲突：
  - `15173`: Dashboard 对外端口。
  - `5432`: PostgreSQL 对外端口。

可选：

- Python 3.10+：只有使用 `local-postgres-tools` 里的 CLI 工具时需要。
- Git：用于 clone 或管理这个项目。

Windows 用户建议：

- Docker Desktop 使用 WSL2 backend。
- 如果要让 MacBook 或其他设备访问 Dashboard，需要允许 Windows 防火墙入站访问 `15173`。

## 快速开始

clone 后进入项目目录：

```powershell
git clone <your-repo-url> local-db
cd local-db
```

首次启动或代码更新后启动：

```powershell
docker compose up -d --build
```

平时只启动已有镜像：

```powershell
docker compose up -d
```

查看服务状态：

```powershell
docker compose ps
```

正常情况下会看到三个服务：

- `local-postgres`
- `local-postgres-dashboard-api`
- `local-postgres-dashboard-web`

打开 Dashboard：

```text
http://localhost:15173
```

## 首次初始化数据库

如果你使用的是全新的数据库 volume，需要先创建表结构。当前项目没有把 migrations 自动挂进 PostgreSQL 初始化目录，所以第一次需要手动执行：

```powershell
python .\local-postgres-tools\dbnote.py init
python .\local-postgres-tools\dbadmin.py apply .\migrations\001_create_agent_test_items.sql
python .\local-postgres-tools\dbadmin.py apply .\migrations\002_create_ai_news_items.sql
```

如果你已经有旧的 `pg_data` volume，并且表已经存在，可以跳过这一步。

验证数据库和 API：

```powershell
curl.exe --noproxy "*" http://127.0.0.1:15173/api/health
```

## 服务说明

| 服务 | 容器名 | 说明 | 对外端口 |
| --- | --- | --- | --- |
| `postgres` | `local-postgres` | PostgreSQL 17 | `5432` |
| `dashboard-api` | `local-postgres-dashboard-api` | FastAPI，只读 API | 不暴露 |
| `dashboard-web` | `local-postgres-dashboard-web` | Vite React Dashboard | `15173` |

Compose 内部连接方式：

- API 连接数据库：`postgres:5432`
- Web 代理 API：`http://dashboard-api:8000`
- 浏览器访问 Web：`http://localhost:15173`

`15173` 是宿主机端口。容器内部 Vite 仍然运行在 `5173`。如果想改成其他宿主机端口，修改 `compose.yaml`：

```yaml
ports:
  - "0.0.0.0:15173:5173"
```

例如改为 `18080`：

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

写入、修改、删除 notes 请使用 CLI：

```powershell
python .\local-postgres-tools\dbnote.py add "一条本地笔记" --tag test --tag local
python .\local-postgres-tools\dbnote.py list --limit 10
python .\local-postgres-tools\dbnote.py search local
```

### AI News

只读展示 `ai_news_items` 表内容。用于存放 AI coding、工具、论文、开源项目等信号条目。

导入 JSON：

```powershell
python .\local-postgres-tools\ainews.py import .\path\to\ai-news.json
python .\local-postgres-tools\ainews.py list --limit 10
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

## API 使用手册

API 默认不直接暴露到宿主机，但可以通过 Dashboard Web 的 Vite proxy 访问 `/api`。

健康检查：

```powershell
curl.exe --noproxy "*" http://127.0.0.1:15173/api/health
```

读取 notes：

```powershell
curl.exe --noproxy "*" "http://127.0.0.1:15173/api/notes?limit=20"
```

读取 AI news：

```powershell
curl.exe --noproxy "*" "http://127.0.0.1:15173/api/ai-news?limit=20"
```

读取表列表：

```powershell
curl.exe --noproxy "*" http://127.0.0.1:15173/api/tables
```

读取单表结构：

```powershell
curl.exe --noproxy "*" http://127.0.0.1:15173/api/tables/notes
```

执行只读查询：

```powershell
'{"sql":"select count(*) as notes_count from notes"}' |
  curl.exe --noproxy "*" -sS `
    -H "Content-Type: application/json" `
    --data-binary "@-" `
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

## CLI 使用手册

CLI 脚本位于 `local-postgres-tools`。这些脚本通过 `docker exec` 调用容器里的 `psql`，所以不需要在本机安装 PostgreSQL client。

连接 psql：

```powershell
docker compose exec postgres psql -U app -d localdb
```

Notes CRUD：

```powershell
python .\local-postgres-tools\dbnote.py init
python .\local-postgres-tools\dbnote.py add "first local note" --tag test --tag local
python .\local-postgres-tools\dbnote.py get 1
python .\local-postgres-tools\dbnote.py update 1 --content "updated note" --tag edited
python .\local-postgres-tools\dbnote.py update 1 --clear-tags
python .\local-postgres-tools\dbnote.py delete 1
python .\local-postgres-tools\dbnote.py list --limit 10
python .\local-postgres-tools\dbnote.py search local
```

数据库管理：

```powershell
python .\local-postgres-tools\dbadmin.py tables
python .\local-postgres-tools\dbadmin.py describe notes
python .\local-postgres-tools\dbadmin.py query "select count(*) from notes"
python .\local-postgres-tools\dbadmin.py apply .\migrations\001_create_agent_test_items.sql
python .\local-postgres-tools\dbadmin.py sample-migration 003_create_example_items.sql
```

AI news：

```powershell
python .\local-postgres-tools\ainews.py import .\ai-news.json
python .\local-postgres-tools\ainews.py list --limit 20
```

CLI 默认连接：

- Container: `local-postgres`
- User: `app`
- Database: `localdb`

可以用环境变量覆盖：

```powershell
$env:DBNOTE_CONTAINER = "local-postgres"
$env:DBNOTE_USER = "app"
$env:DBNOTE_DB = "localdb"
```

## Agent Skill 注册

clone 项目后，skill 不会自动变成用户全局可用。项目内置了一份 skill 模板：

```text
.agents/skills/local-postgres-notes/SKILL.md
```

在项目根目录执行安装脚本：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-skill.ps1
```

默认会安装到：

```text
%USERPROFILE%\.agents\skills\local-postgres-notes
```

脚本会把 skill 里的项目路径替换成当前 clone 目录，所以用户不需要手动改 `Set-Location`。

如果你的 agent 使用其他 skill 目录，可以指定 `-SkillRoot`：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-skill.ps1 -SkillRoot "C:\path\to\agent\skills"
```

安装后，如果 agent 没有自动发现新 skill，重启 Codex、Kimi Desktop 或对应 agent 应用。

注册完成后，可以让 agent 直接执行类似请求：

```text
帮我往本地 PostgreSQL notes 里添加一条笔记
列出最近 10 条 notes
查看 localdb 里有哪些表
执行只读 SQL：select count(*) from notes
```

## 局域网访问

在 Windows 上查看本机局域网 IP：

```powershell
ipconfig
```

找到当前网络适配器下的 IPv4 地址，例如：

```text
192.168.1.20
```

同一 Wi-Fi 或局域网里的 MacBook 访问：

```text
http://192.168.1.20:15173
```

如果打不开，优先检查：

- Windows 防火墙是否允许入站访问 `15173`。
- 两台设备是否在同一个局域网。
- Dashboard 容器是否运行：`docker compose ps`。
- URL 端口是否写成了 `15173`。

## 常用运维命令

查看日志：

```powershell
docker compose logs -f postgres
docker compose logs -f dashboard-api
docker compose logs -f dashboard-web
```

重启服务：

```powershell
docker compose restart
```

只重建 Dashboard：

```powershell
docker compose up -d --build dashboard-web
```

停止服务但保留数据库数据：

```powershell
docker compose down
```

删除服务并删除数据库数据：

```powershell
docker compose down -v
```

注意：`docker compose down -v` 会删除 PostgreSQL volume，数据库数据会丢失。

## 项目结构

```text
.
├─ compose.yaml
├─ backend/
│  ├─ Dockerfile
│  ├─ requirements.txt
│  └─ app/
│     └─ main.py
├─ frontend/
│  ├─ Dockerfile
│  ├─ package.json
│  ├─ vite.config.ts
│  └─ src/
├─ local-postgres-tools/
│  ├─ dbnote.py
│  ├─ dbadmin.py
│  ├─ ainews.py
│  ├─ pgcli.py
│  └─ schema.sql
├─ scripts/
│  └─ install-skill.ps1
└─ migrations/
   ├─ 001_create_agent_test_items.sql
   └─ 002_create_ai_news_items.sql
```

## 开发说明

前端是 Vite dev server，运行在容器内：

```powershell
docker compose up -d --build dashboard-web
```

后端是 FastAPI + Uvicorn：

```powershell
docker compose up -d --build dashboard-api
```

检查前端构建：

```powershell
docker compose exec -T dashboard-web npm run build
```

检查 Compose 配置：

```powershell
docker compose config
```

## 安全边界

当前配置适合本机和可信局域网开发，不建议直接暴露到公网：

- PostgreSQL 端口 `5432` 暴露在 `0.0.0.0`，方便局域网访问。
- Dashboard 没有登录系统。
- API 是只读设计，但数据库本身仍接受有效凭据连接。
- `compose.yaml` 里包含本地开发用数据库配置。公开仓库或多人使用时，建议改为 `.env` 管理。

## 常见问题

### 端口被占用

如果 `15173` 被占用，修改 `compose.yaml`：

```yaml
ports:
  - "0.0.0.0:18080:5173"
```

然后重新启动：

```powershell
docker compose up -d --build dashboard-web
```

### Dashboard 能打开，但数据接口报错

通常是新数据库还没初始化 schema。执行：

```powershell
python .\local-postgres-tools\dbnote.py init
python .\local-postgres-tools\dbadmin.py apply .\migrations\001_create_agent_test_items.sql
python .\local-postgres-tools\dbadmin.py apply .\migrations\002_create_ai_news_items.sql
```

### MacBook 无法访问

检查：

- Windows IP 是否正确。
- 使用的是 `http://<Windows-LAN-IP>:15173`。
- Windows 防火墙是否放行。
- `dashboard-web` 端口是否为 `0.0.0.0:15173->5173/tcp`：

```powershell
docker compose ps
```

### 不想保留旧数据，想完全重来

```powershell
docker compose down -v
docker compose up -d --build
```

然后重新执行首次初始化数据库步骤。
