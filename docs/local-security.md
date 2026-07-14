# 本地优先安全模型

本项目的默认配置只服务于运行 Docker 的那台电脑：PostgreSQL 与 Dashboard 都绑定 `127.0.0.1`，不会主动监听局域网或公网接口。每位使用者用自己的 `.env` 创建独立的本地密码与 Docker volume；这些文件和数据不会提交到 Git。

## 首次启动

1. 复制 `.env.example` 为 `.env`。
2. 为 `LOCAL_DB_ADMIN_PASSWORD`、`LOCAL_DB_DASHBOARD_PASSWORD` 填入不同的高强度随机密码。
3. 运行 `docker compose up -d --build`。

`app` 是仅供初始化与 `db-tools` 使用的管理员角色。Dashboard 使用独立的 `dashboard_user`：它只拥有 public schema 的数据读写权限，不能创建角色、创建数据库或读取 PostgreSQL 服务器文件。

## 数据边界

| 位置 | 是否提交 | 用途 |
| --- | --- | --- |
| `migrations/` | 是 | 可复现的表结构、索引和受限 Dashboard 角色 |
| `local-data/` | 否 | 个人笔记导入、日报、修复与私有 seed 脚本 |
| `.env` | 否 | 本机密码、可选 OpenAI 密钥、端口与访问令牌 |
| Docker volume `pg_data` | 否 | 实际 PostgreSQL 数据 |

`local-data/` 被 Git 忽略。若要保存个人导入脚本，请放在该目录，使用 `docker compose run --rm -T db-tools -f /local-data/<file>.sql` 执行；它们不会影响其他 clone 的初始化。

## 可选局域网模式

默认不开放局域网访问。只有在确实需要时才复制 `.env.lan.example` 为 `.env.lan`，填写不可预测的 `DASHBOARD_ACCESS_TOKEN` 和本机 LAN IP，然后运行：

```bash
docker compose --env-file .env --env-file .env.lan up -d --build
```

局域网浏览器打开 Dashboard 后，在顶部“局域网令牌”输入框填写同一令牌，再刷新页面。令牌只保存在该浏览器标签页会话中。

局域网模式不等于公网生产部署：不要配置路由器端口转发；若需要让不受信任的人访问，应在反向代理前添加成熟的身份认证与 HTTPS。
