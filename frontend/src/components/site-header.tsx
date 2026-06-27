import { DatabaseIcon, RefreshCwIcon, SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { DashboardView } from "@/types";

const titles: Record<DashboardView, string> = {
  overview: "Overview",
  notes: "Notes",
  "ai-news": "AI News",
  tables: "Tables",
  query: "Read-only Query"
};

export function SiteHeader({
  activeView,
  databaseName,
  isLoading,
  onQueryChange,
  onRefresh,
  onSearch,
  query,
  status
}: {
  activeView: DashboardView;
  databaseName: string;
  isLoading: boolean;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onSearch: () => void;
  query: string;
  status: string;
}) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <h1 className="truncate text-base font-medium">{titles[activeView]}</h1>
          <Badge variant="outline" className="hidden gap-1.5 text-muted-foreground md:inline-flex">
            <DatabaseIcon />
            {status} · {databaseName}
          </Badge>
        </div>
        <div className="hidden w-full max-w-sm items-center gap-2 md:flex">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              onChange={(event) => onQueryChange(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onSearch();
                }
              }}
              placeholder="Search notes and AI news"
              value={query}
            />
          </div>
          <Button aria-label="Refresh dashboard data" disabled={isLoading} onClick={onRefresh} size="icon" variant="outline">
            <RefreshCwIcon className={isLoading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>
    </header>
  );
}
