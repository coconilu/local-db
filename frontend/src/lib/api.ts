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

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init
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
      `/api/ai-coding-oss?limit=100${query ? `&query=${encodeURIComponent(query)}` : ""}`
    ),
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
