import { AlertCircleIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { QueryConsole } from "@/components/query-console";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { api } from "@/lib/api";
import type { AiCodingOssItem, AiNewsItem, DashboardView, HealthResponse, Note, TableSummary } from "@/types";

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
            "--sidebar-width": "18rem",
            "--header-height": "3.25rem"
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
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {error ? (
                  <div className="px-4 lg:px-6">
                    <Alert variant="destructive">
                      <AlertCircleIcon />
                      <AlertTitle>Dashboard data could not be loaded</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </div>
                ) : null}

                {view === "query" ? (
                  <div className="px-4 lg:px-6">
                    <QueryConsole />
                  </div>
                ) : view === "overview" ? (
                  <>
                    <SectionCards
                      counts={counts}
                      databaseName={databaseName}
                      isLoading={loading}
                      status={health?.status ?? "checking"}
                    />
                    <div className="px-4 lg:px-6">
                      <ChartAreaInteractive codingItems={codingItems} news={news} notes={notes} tables={tables} />
                    </div>
                    <DataTable
                      codingItems={codingItems}
                      isLoading={loading}
                      news={news}
                      notes={notes}
                      onDataChanged={() => fetchDashboard(query)}
                      onViewChange={setView}
                      tables={tables}
                      view={view}
                    />
                  </>
                ) : (
                  <DataTable
                    codingItems={codingItems}
                    isLoading={loading}
                    news={news}
                    notes={notes}
                    onDataChanged={() => fetchDashboard(query)}
                    onViewChange={setView}
                    tables={tables}
                    view={view}
                  />
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
