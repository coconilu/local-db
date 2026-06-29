export type HealthCount = {
  name: string;
  count: number;
};

export type HealthResponse = {
  status: string;
  database: {
    server_time: string;
    database: string;
    user: string;
  };
  counts: HealthCount[];
};

export type Note = {
  id: number;
  content: string;
  source?: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type AiNewsItem = {
  id: number;
  priority: string;
  category: string;
  signal_type: string;
  verification_status: string;
  title: string;
  source_name: string;
  source_platform?: string | null;
  author_name?: string | null;
  published_at?: string | null;
  source_url: string;
  summary: string;
  why_it_matters?: string | null;
  entities: string[];
  tags: string[];
  digest_run_at: string;
  created_at: string;
  updated_at: string;
};

export type AiCodingOssItem = {
  id: number;
  brief_date: string;
  digest_run_at: string;
  digest_rank: number;
  repo_owner: string;
  repo_name: string;
  project_name: string;
  repo_url: string;
  positioning: string;
  primary_language?: string | null;
  momentum_text: string;
  recent_update_text?: string | null;
  recent_update_date?: string | null;
  labels: string[];
  brief_summary?: string | null;
  source_links: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type TableSummary = {
  table_name: string;
  estimated_rows: number;
};

export type TableColumn = {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string;
};

export type TableIndex = {
  indexname: string;
  indexdef: string;
};

export type TableDetail = {
  table: string;
  columns: TableColumn[];
  indexes: TableIndex[];
};

export type QueryResult = {
  columns: string[];
  rows: Record<string, unknown>[];
};

export type TableRowsResponse = QueryResult;

export type DeleteRowResponse = {
  deleted: boolean;
  table: string;
  id: number;
};

export type DashboardView = "overview" | "notes" | "ai-news" | "ai-coding-oss" | "tables" | "query";
