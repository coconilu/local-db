# Development Notes

This project currently prioritizes simple Dockerized usage over hot-reload development.

## Current Runtime Model

Both dashboard services are built as Docker images:

- `dashboard-api` builds from `backend/Dockerfile`.
- `dashboard-web` builds from `frontend/Dockerfile`.

The frontend container runs Vite dev server, but the source code is copied into the image during `docker build`. It is not mounted from the host.

The backend container runs Uvicorn without `--reload`. Its source code is also copied into the image during `docker build`.

Because there are no bind-mounted source volumes, local code changes are not automatically synchronized into running containers.

## Current Development Workflow

After changing backend code:

```bash
docker compose up -d --build dashboard-api
```

After changing frontend code:

```bash
docker compose up -d --build dashboard-web
```

After changing both:

```bash
docker compose up -d --build dashboard-api dashboard-web
```

View logs:

```bash
docker compose logs -f dashboard-api
docker compose logs -f dashboard-web
```

Check frontend build:

```bash
docker compose exec -T dashboard-web npm run build
```

## Future Hot-Reload Setup

If frequent frontend or backend development becomes necessary, add a `compose.dev.yaml` override. The goal would be:

- Bind-mount backend source into the API container.
- Run Uvicorn with `--reload`.
- Bind-mount frontend source into the web container.
- Keep `node_modules` inside a Docker volume so host and container environments do not fight.
- Keep the normal dashboard URL as `http://localhost:15173`.
- Optionally expose FastAPI docs on a local-only debug port.

Example shape:

```yaml
services:
  dashboard-api:
    volumes:
      - ./backend/app:/app/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    environment:
      WATCHFILES_FORCE_POLLING: "true"
    ports:
      - "127.0.0.1:18000:8000"

  dashboard-web:
    volumes:
      - ./frontend:/app
      - frontend_node_modules:/app/node_modules
    environment:
      CHOKIDAR_USEPOLLING: "true"
    command: npm run dev -- --host 0.0.0.0

volumes:
  frontend_node_modules:
```

Run the future dev stack with:

```bash
docker compose -f compose.yaml -f compose.dev.yaml up -d --build
```

Expected behavior:

- Changes under `frontend/src/` trigger Vite hot reload.
- Changes under `backend/app/` trigger Uvicorn reload.
- Dashboard remains available at `http://localhost:15173`.
- FastAPI docs, if the debug port is exposed, are available at `http://localhost:18000/docs`.

This setup is not implemented yet because the current project does not need hot-reload development.
