import { AlertCircleIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { api } from "@/lib/api";
import type { AiCodingOssItem, AiNewsItem, DashboardView, HealthResponse, Note, TableSummary } from "@/types";

const ChartAreaInteractive = lazy(() =>
  import("@/components/chart-area-interactive").then((module) => ({ default: module.ChartAreaInteractive }))
);
const DataTable = lazy(() => import("@/components/data-table").then((module) => ({ default: module.DataTable })));
const QueryConsole = lazy(() =>
  import("@/components/query-console").then((module) => ({ default: module.QueryConsole }))
);

type Counts = {
  coding: number;
  notes: number;
  news: number;
  tables: number;
};

const initialCounts: Counts = {
  coding: 0,
  notes: 0,
  news: 0,
  tables: 0
};

function DashboardPanelFallback() {
  return (
    <div className="flex min-h-64 flex-col gap-4 rounded-xl border bg-card p-5 shadow-xs" aria-label="正在加载内容">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-64 max-w-full" />
      <Skeleton className="min-h-40 w-full flex-1" />
    </div>
  );
}

export function App() {
  const [view, setView] = useState<DashboardView>("overview");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [codingItems, setCodingItems] = useState<AiCodingOssItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [news, setNews] = useState<AiNewsItem[]>([]);
  const [tables, setTables] = useState<TableSummary[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async (search: string) => {
    setLoading(true);
    setError("");

    try {
      const [healthResult, noteResult, newsResult, codingResult, tableResult] = await Promise.all([
        api.health(),
        api.notes(search),
        api.aiNews(search),
        api.aiCodingOss(search),
        api.tables()
      ]);

      setHealth(healthResult);
      setCodingItems(codingResult.items);
      setNotes(noteResult.items);
      setNews(newsResult.items);
      setTables(tableResult.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard("");
  }, [fetchDashboard]);

  const counts = useMemo<Counts>(() => {
    const healthCounts = new Map((health?.counts ?? []).map((item) => [item.name, item.count]));

    return {
      coding: healthCounts.get("ai_coding_oss_top5_items") ?? codingItems.length,
      notes: healthCounts.get("notes") ?? notes.length,
      news: healthCounts.get("ai_news_items") ?? news.length,
      tables: healthCounts.get("tables") ?? tables.length
    };
  }, [codingItems.length, health, news.length, notes.length, tables.length]);

  const databaseName = health?.database.database ?? "localdb";

  return (
    <>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "17.5rem",
            "--header-height": "4.25rem"
          } as CSSProperties
        }
      >
        <AppSidebar activeView={view} counts={counts} onViewChange={setView} />
        <SidebarInset>
          <SiteHeader
            activeView={view}
            databaseName={databaseName}
            isLoading={loading}
            onQueryChange={setQuery}
            onRefresh={() => void fetchDashboard(query)}
            onSearch={() => void fetchDashboard(query)}
            query={query}
            status={health?.status ?? "checking"}
          />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col">
              <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 px-4 py-5 md:gap-7 md:px-6 md:py-7 lg:px-8">
                {error ? (
                  <div>
                    <Alert variant="destructive">
                      <AlertCircleIcon />
                      <AlertTitle>Dashboard data could not be loaded</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </div>
                ) : null}

                {view === "query" ? (
                  <div>
                    <Suspense fallback={<DashboardPanelFallback />}>
                      <QueryConsole />
                    </Suspense>
                  </div>
                ) : view === "overview" ? (
                  <>
                    <SectionCards
                      codingItems={codingItems}
                      counts={counts}
                      databaseName={databaseName}
                      isLoading={loading}
                      news={news}
                      notes={notes}
                      onViewChange={setView}
                      status={health?.status ?? "checking"}
                    />
                    <div>
                      <Suspense fallback={<DashboardPanelFallback />}>
                        <ChartAreaInteractive codingItems={codingItems} news={news} notes={notes} tables={tables} />
                      </Suspense>
                    </div>
                    <Suspense fallback={<DashboardPanelFallback />}>
                      <DataTable
                        codingItems={codingItems}
                        isLoading={loading}
                        news={news}
                        notes={notes}
                        onViewChange={setView}
                        tables={tables}
                        view={view}
                      />
                    </Suspense>
                  </>
                ) : (
                  <Suspense fallback={<DashboardPanelFallback />}>
                    <DataTable
                      codingItems={codingItems}
                      isLoading={loading}
                      news={news}
                      notes={notes}
                      onViewChange={setView}
                      tables={tables}
                      view={view}
                    />
                  </Suspense>
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster richColors />
    </>
  );
}
