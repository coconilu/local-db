import type {
  AiCodingOssItem,
  AiNewsItem,
  HealthResponse,
  Note,
  QueryResult,
  TableDetail,
  TableRowsResponse,
  TableSummary
} from "../types";

const accessTokenStorageKey = "local-db-dashboard-access-token";

function accessToken(): string {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(accessTokenStorageKey)?.trim() ?? "";
}

export function loadDashboardAccessToken(): string {
  return accessToken();
}

export function saveDashboardAccessToken(value: string): void {
  if (typeof window === "undefined") return;
  const normalized = value.trim();
  if (normalized) {
    window.sessionStorage.setItem(accessTokenStorageKey, normalized);
  } else {
    window.sessionStorage.removeItem(accessTokenStorageKey);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  const token = accessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(url, {
    ...init,
    headers
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.detail || `${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  health: () => request<HealthResponse>("/api/health"),
  notes: (query = "") =>
    request<{ items: Note[] }>(`/api/notes?limit=50${query ? `&query=${encodeURIComponent(query)}` : ""}`),
  aiNews: (query = "") =>
    request<{ items: AiNewsItem[] }>(`/api/ai-news?limit=50${query ? `&query=${encodeURIComponent(query)}` : ""}`),
  aiCodingOss: (query = "") =>
    request<{ items: AiCodingOssItem[] }>(
      `/api/ai-coding-oss?limit=500${query ? `&query=${encodeURIComponent(query)}` : ""}`
    ),
  addManualAiCodingOss: (repoUrl: string) =>
    request<{ item: AiCodingOssItem; manual_mention_count: number }>("/api/ai-coding-oss/manual", {
      method: "POST",
      body: JSON.stringify({ repo_url: repoUrl })
    }),
  tables: () => request<{ items: TableSummary[] }>("/api/tables"),
  table: (name: string) => request<TableDetail>(`/api/tables/${encodeURIComponent(name)}`),
  tableRows: (name: string, limit = 50) =>
    request<TableRowsResponse>(`/api/tables/${encodeURIComponent(name)}/rows?limit=${limit}`),
  readOnlyQuery: (sql: string) =>
    request<QueryResult>("/api/query/read-only", {
      method: "POST",
      body: JSON.stringify({ sql, limit: 100 })
    })
};

export function formatDate(value?: string | null): string {
  if (!value) return "No timestamp";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatDateOnly(value?: string | null): string {
  if (!value) return "No date";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}
