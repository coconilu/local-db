import { DatabaseIcon, RefreshCwIcon, SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { DashboardView } from "@/types";

const titles: Record<DashboardView, string> = {
  overview: "知识工作台",
  notes: "笔记库",
  "ai-news": "AI 信号流",
  "ai-coding-oss": "开源项目雷达",
  tables: "数据表",
  query: "只读 SQL"
};

const searchPlaceholders: Record<DashboardView, string> = {
  overview: "搜索笔记、AI 信号和开源项目",
  notes: "搜索笔记内容、标签或来源",
  "ai-news": "搜索 AI 资讯、来源或摘要",
  "ai-coding-oss": "搜索项目名、定位、热度或标签",
  tables: "搜索知识内容",
  query: "搜索知识内容"
};

export function SiteHeader({
  activeView,
  accessToken,
  databaseName,
  isLoading,
  onAccessTokenChange,
  onQueryChange,
  onRefresh,
  onSearch,
  query,
  status
}: {
  activeView: DashboardView;
  accessToken: string;
  databaseName: string;
  isLoading: boolean;
  onAccessTokenChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onSearch: () => void;
  query: string;
  status: string;
}) {
  const title = titles[activeView];

  return (
    <header className="sticky top-0 z-20 flex h-(--header-height) shrink-0 items-center border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1480px] items-center gap-3 px-4 md:px-6 lg:px-8">
        <SidebarTrigger aria-label="切换侧栏" className="-ml-1" />
        <Separator className="mx-1 data-[orientation=vertical]:h-5" orientation="vertical" />
        <div className="flex min-w-0 items-center gap-3">
          {activeView === "overview" ? (
            <span className="truncate text-sm font-semibold md:text-base">{title}</span>
          ) : (
            <h1 className="truncate text-sm font-semibold md:text-base">{title}</h1>
          )}
          <Badge className="hidden gap-1.5 lg:inline-flex" variant="secondary">
            <span className="size-1.5 rounded-full bg-chart-1" />
            {status} · {databaseName}
          </Badge>
        </div>

        <div className="ml-auto hidden w-full max-w-md items-center gap-2 md:flex">
          <Input
            aria-label="局域网访问令牌"
            className="hidden h-10 w-36 rounded-xl bg-card shadow-xs lg:block"
            onChange={(event) => onAccessTokenChange(event.currentTarget.value)}
            placeholder="局域网令牌"
            type="password"
            value={accessToken}
          />
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-10 rounded-xl bg-card pl-9 shadow-xs"
              onChange={(event) => onQueryChange(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") onSearch();
              }}
              placeholder={searchPlaceholders[activeView]}
              value={query}
            />
          </div>
          <Button aria-label="刷新工作台数据" disabled={isLoading} onClick={onRefresh} size="icon" variant="outline">
            <RefreshCwIcon className={isLoading ? "animate-spin" : undefined} />
          </Button>
        </div>

        <Badge className="ml-auto gap-1.5 md:hidden" variant="outline">
          <DatabaseIcon />
          {databaseName}
        </Badge>
      </div>
    </header>
  );
}
