import { ExternalLinkIcon, EyeIcon, Loader2Icon, PlusIcon, Table2Icon } from "lucide-react";
import type { CSSProperties, MouseEvent as ReactMouseEvent, PointerEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, formatDate, formatDateOnly } from "@/lib/api";
import type { AiCodingOssItem, AiNewsItem, DashboardView, Note, QueryResult, TableDetail, TableSummary } from "@/types";

type DataTab = "notes" | "ai-news" | "ai-coding-oss" | "tables";

const AI_CODING_PAGE_SIZE = 10;

type DetailMetadata = {
  label: string;
  value: string;
};

type MarkdownDetail = {
  title: string;
  description: string;
  body: string;
  source?: string | null;
  metadata?: DetailMetadata[];
};

type TablePreview = {
  name: string;
  detail: TableDetail;
  data: QueryResult;
};

function toDataTab(view: DashboardView): DataTab {
  if (view === "ai-news" || view === "ai-coding-oss" || view === "tables") return view;
  return "notes";
}

function toDashboardView(value: string): DashboardView {
  if (value === "ai-news" || value === "ai-coding-oss" || value === "tables") return value;
  return "notes";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function DataTable({
  codingItems,
  isLoading,
  news,
  notes,
  onCodingOssChanged,
  onViewChange,
  tables,
  view
}: {
  codingItems: AiCodingOssItem[];
  isLoading: boolean;
  news: AiNewsItem[];
  notes: Note[];
  onCodingOssChanged: () => void;
  onViewChange: (view: DashboardView) => void;
  tables: TableSummary[];
  view: DashboardView;
}) {
  const [detail, setDetail] = useState<MarkdownDetail | null>(null);
  const [tablePreview, setTablePreview] = useState<TablePreview | null>(null);
  const [loadingTable, setLoadingTable] = useState("");
  const [isResizingTableSheet, setIsResizingTableSheet] = useState(false);
  const [tableSheetWidth, setTableSheetWidth] = useState<number | null>(null);
  const activeTab = toDataTab(view);
  const tableSheetStyle = useMemo(
    () =>
      ({
        maxWidth: "92vw",
        minWidth: "min(360px, calc(100vw - 1rem))",
        width: tableSheetWidth ? `${tableSheetWidth}px` : "50vw"
      }) as CSSProperties,
    [tableSheetWidth]
  );

  async function loadTablePreview(tableName: string): Promise<TablePreview> {
    const [detailResponse, rowsResponse] = await Promise.all([api.table(tableName), api.tableRows(tableName)]);
    return { name: tableName, detail: detailResponse, data: rowsResponse };
  }

  async function openTable(tableName: string) {
    setLoadingTable(tableName);
    try {
      setTablePreview(await loadTablePreview(tableName));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to open ${tableName}`);
    } finally {
      setLoadingTable("");
    }
  }

  function openNote(note: Note) {
    setDetail({
      title: `笔记 #${note.id}`,
      description: `创建于 ${formatDate(note.created_at)}`,
      body: note.content,
      source: note.source,
      metadata: [
        { label: "标签", value: note.tags.length ? note.tags.join(", ") : "无" },
        { label: "更新于", value: formatDate(note.updated_at) }
      ]
    });
  }

  function openNewsItem(item: AiNewsItem) {
    const body = [
      "## 摘要",
      item.summary,
      item.why_it_matters ? `## 为什么重要\n\n${item.why_it_matters}` : "",
      item.entities.length ? `## 相关实体\n\n${item.entities.map((entity) => `- ${entity}`).join("\n")}` : "",
      item.tags.length ? `## 标签\n\n${item.tags.map((tag) => `- ${tag}`).join("\n")}` : ""
    ]
      .filter(Boolean)
      .join("\n\n");

    setDetail({
      title: item.title,
      description: `${item.source_name} · ${item.priority} · ${formatDate(item.updated_at)}`,
      body,
      source: item.source_url,
      metadata: [
        { label: "分类", value: item.category },
        { label: "信号", value: item.signal_type },
        { label: "核验", value: item.verification_status }
      ]
    });
  }

  function openCodingItem(item: AiCodingOssItem) {
    const body = [
      item.brief_summary ? `## 简要摘要\n\n${item.brief_summary}` : "",
      "## 一句话定位",
      item.positioning,
      "## 热度指标",
      item.momentum_text,
      item.recent_update_text ? `## 最近更新\n\n${item.recent_update_text}` : "",
      item.labels.length ? `## 标签\n\n${item.labels.map((label) => `- ${label}`).join("\n")}` : ""
    ]
      .filter(Boolean)
      .join("\n\n");

    setDetail({
      title: item.project_name,
      description: `提及 ${item.mention_count} 次 · 最近提及 ${formatDateOnly(item.last_mentioned_at)}`,
      body,
      source: item.repo_url,
      metadata: [
        { label: "语言", value: item.primary_language ?? "未知" },
        { label: "首次提及", value: formatDateOnly(item.first_mentioned_at) },
        { label: "最近提及", value: formatDateOnly(item.last_mentioned_at) },
        { label: "提及次数", value: `${item.mention_count} 次` }
      ]
    });
  }

  const resizeTableSheet = useCallback((clientX: number) => {
    const viewportWidth = window.innerWidth;
    const minWidth = Math.min(360, viewportWidth - 16);
    const maxWidth = Math.max(minWidth, Math.floor(viewportWidth * 0.92));
    setTableSheetWidth(Math.round(clamp(viewportWidth - clientX, minWidth, maxWidth)));
  }, []);

  useEffect(() => {
    if (!isResizingTableSheet) return;

    function handlePointerMove(event: globalThis.PointerEvent) {
      resizeTableSheet(event.clientX);
    }

    function handleMouseMove(event: globalThis.MouseEvent) {
      resizeTableSheet(event.clientX);
    }

    function stopResize() {
      setIsResizingTableSheet(false);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResize);
    window.addEventListener("pointercancel", stopResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResize);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResize);
      window.removeEventListener("pointercancel", stopResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResize);
    };
  }, [isResizingTableSheet, resizeTableSheet]);

  function startTableSheetResize(event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsResizingTableSheet(true);
    resizeTableSheet(event.clientX);
  }

  function startTableSheetMouseResize(event: ReactMouseEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    event.preventDefault();
    setIsResizingTableSheet(true);
    resizeTableSheet(event.clientX);
  }

  function moveTableSheetResize(event: PointerEvent<HTMLButtonElement>) {
    if (!isResizingTableSheet) return;
    resizeTableSheet(event.clientX);
  }

  function endTableSheetResize(event: PointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsResizingTableSheet(false);
  }

  return (
    <>
      <Tabs
        className="w-full flex-col justify-start gap-5"
        onValueChange={(value) => onViewChange(toDashboardView(value))}
        value={activeTab}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <TabsList className="h-auto w-fit max-w-full flex-wrap justify-start rounded-xl bg-muted/70 p-1 **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1">
            <TabsTrigger value="notes">
              笔记库 <Badge variant="secondary">{notes.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="ai-news">
              AI 信号 <Badge variant="secondary">{news.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="ai-coding-oss">
              开源雷达 <Badge variant="secondary">{codingItems.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="tables">
              数据表 <Badge variant="secondary">{tables.length}</Badge>
            </TabsTrigger>
          </TabsList>
          <Badge className="w-fit" variant="outline">
            项目可受控添加
          </Badge>
        </div>

        <TabsContent className="relative flex flex-col gap-4 overflow-auto" value="notes">
          <DataCard description="按内容、标签和来源回看可复用知识" title="笔记库">
            <NotesTable isLoading={isLoading} notes={notes} onOpenDetail={openNote} />
          </DataCard>
        </TabsContent>

        <TabsContent className="relative flex flex-col gap-4 overflow-auto" value="ai-news">
          <DataCard description="先看优先级和可信度，再打开原始来源" title="AI 信号流">
            <NewsTable isLoading={isLoading} news={news} onOpenDetail={openNewsItem} />
          </DataCard>
        </TabsContent>

        <TabsContent className="relative flex flex-col gap-4 overflow-auto" value="ai-coding-oss">
          <DataCard description="按仓库合并日报与手动添加记录，默认展示全部项目" title="开源项目雷达">
            <AiCodingOssTable
              codingItems={codingItems}
              isLoading={isLoading}
              onAdded={onCodingOssChanged}
              onOpenDetail={openCodingItem}
            />
          </DataCard>
        </TabsContent>

        <TabsContent className="relative flex flex-col gap-4 overflow-auto" value="tables">
          <DataCard description="系统工具：检查表结构、近期行和索引" title="数据表">
            <TablesTable
              isLoading={isLoading}
              loadingTable={loadingTable}
              onOpenTable={(name) => void openTable(name)}
              tables={tables}
            />
          </DataCard>
        </TabsContent>
      </Tabs>

      <Sheet onOpenChange={(open) => !open && setTablePreview(null)} open={tablePreview !== null}>
        <SheetContent
          className={`overflow-hidden ${isResizingTableSheet ? "transition-none select-none" : ""}`}
          style={tableSheetStyle}
        >
          <button
            aria-label="Resize table drawer"
            className="absolute inset-y-0 left-0 w-3 cursor-ew-resize border-l border-transparent outline-none hover:border-primary/60 focus-visible:border-primary"
            onMouseDown={startTableSheetMouseResize}
            onPointerCancel={endTableSheetResize}
            onPointerDown={startTableSheetResize}
            onPointerMove={moveTableSheetResize}
            onPointerUp={endTableSheetResize}
            type="button"
          />
          <SheetHeader>
            <SheetTitle>{tablePreview?.name ?? "表数据"}</SheetTitle>
            <SheetDescription>只读预览近期行和 public schema 元数据。</SheetDescription>
          </SheetHeader>
          {tablePreview ? (
            <TablePreviewPanel onOpenDetail={setDetail} preview={tablePreview} />
          ) : null}
        </SheetContent>
      </Sheet>

      <MarkdownDetailDialog detail={detail} onOpenChange={(open) => !open && setDetail(null)} />
    </>
  );
}

function DataCard({
  children,
  description,
  title
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 rounded-xl border bg-card px-5 py-4 shadow-xs md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function LoadingRows({ columns }: { columns: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, row) => (
        <TableRow key={row}>
          {Array.from({ length: columns }).map((__, column) => (
            <TableCell key={column}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function LoadingListRows({ rows = 4 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, row) => (
        <div className="grid gap-3 border-b p-4 last:border-b-0 md:grid-cols-[1fr_auto]" key={row}>
          <div className="flex min-w-0 flex-col gap-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-full max-w-2xl" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="size-6" />
            <Skeleton className="size-6" />
          </div>
        </div>
      ))}
    </>
  );
}

function EmptyBlock({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function NotesTable({
  isLoading,
  notes,
  onOpenDetail
}: {
  isLoading: boolean;
  notes: Note[];
  onOpenDetail: (note: Note) => void;
}) {
  const [activeTag, setActiveTag] = useState("all");
  const tagOptions = useMemo(() => {
    const counts = new Map<string, number>();

    for (const note of notes) {
      for (const tag of note.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, 8);
  }, [notes]);
  const visibleNotes = useMemo(
    () => (activeTag === "all" ? notes : notes.filter((note) => note.tags.includes(activeTag))),
    [activeTag, notes]
  );

  useEffect(() => {
    if (activeTag !== "all" && !tagOptions.some(([tag]) => tag === activeTag)) {
      setActiveTag("all");
    }
  }, [activeTag, tagOptions]);

  return (
    <div className="flex flex-col gap-3">
      {tagOptions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/20 p-2">
          <span className="px-1 text-xs font-medium text-muted-foreground">标签筛选</span>
          <Button onClick={() => setActiveTag("all")} size="xs" type="button" variant={activeTag === "all" ? "default" : "outline"}>
            全部
          </Button>
          {tagOptions.map(([tag, count]) => (
            <Button
              key={tag}
              onClick={() => setActiveTag(tag)}
              size="xs"
              type="button"
              variant={activeTag === tag ? "default" : "outline"}
            >
              {tag} <span className="text-xs opacity-70">{count}</span>
            </Button>
          ))}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border bg-card">
        {isLoading ? <LoadingListRows /> : null}
        {!isLoading && notes.length === 0 ? <EmptyBlock label="没有匹配当前搜索的笔记。" /> : null}
        {!isLoading && notes.length > 0 && visibleNotes.length === 0 ? <EmptyBlock label="这个标签下没有匹配的笔记。" /> : null}
        {!isLoading
          ? visibleNotes.map((note) => (
              <div className="grid gap-3 border-b p-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_auto]" key={note.id}>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">#{note.id}</Badge>
                    <span>更新于 {formatDate(note.updated_at)}</span>
                    <SourceLink source={note.source} />
                  </div>
                  <button
                    aria-label={`打开笔记 #${note.id}`}
                    className="mt-2 line-clamp-3 w-full text-left text-sm leading-6 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => onOpenDetail(note)}
                    type="button"
                  >
                    {note.content}
                  </button>
                  <div className="mt-3">
                    <TagList tags={note.tags} />
                  </div>
                </div>
                <ActionButtons
                  detailLabel={`打开笔记 #${note.id}`}
                  onOpenDetail={() => onOpenDetail(note)}
                />
              </div>
            ))
          : null}
      </div>
    </div>
  );
}

function NewsTable({
  isLoading,
  news,
  onOpenDetail
}: {
  isLoading: boolean;
  news: AiNewsItem[];
  onOpenDetail: (item: AiNewsItem) => void;
}) {
  const [priorityFilter, setPriorityFilter] = useState("all");
  const priorityOptions = useMemo(
    () => Array.from(new Set(news.map((item) => item.priority).filter(Boolean))).slice(0, 8),
    [news]
  );
  const visibleNews = useMemo(
    () => (priorityFilter === "all" ? news : news.filter((item) => item.priority === priorityFilter)),
    [news, priorityFilter]
  );

  useEffect(() => {
    if (priorityFilter !== "all" && !priorityOptions.includes(priorityFilter)) {
      setPriorityFilter("all");
    }
  }, [priorityFilter, priorityOptions]);

  return (
    <div className="flex flex-col gap-3">
      {priorityOptions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/20 p-2">
          <span className="px-1 text-xs font-medium text-muted-foreground">优先级</span>
          <Button
            onClick={() => setPriorityFilter("all")}
            size="xs"
            type="button"
            variant={priorityFilter === "all" ? "default" : "outline"}
          >
            全部
          </Button>
          {priorityOptions.map((priority) => (
            <Button
              key={priority}
              onClick={() => setPriorityFilter(priority)}
              size="xs"
              type="button"
              variant={priorityFilter === priority ? "default" : "outline"}
            >
              {priority}
            </Button>
          ))}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border bg-card">
        {isLoading ? <LoadingListRows /> : null}
        {!isLoading && news.length === 0 ? <EmptyBlock label="没有匹配当前搜索的 AI 信号。" /> : null}
        {!isLoading && news.length > 0 && visibleNews.length === 0 ? <EmptyBlock label="这个优先级下没有匹配的信号。" /> : null}
        {!isLoading
          ? visibleNews.map((item) => (
              <div className="grid gap-4 border-b p-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_auto]" key={item.id}>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{item.priority}</Badge>
                    <Badge variant="secondary">{item.category}</Badge>
                    <Badge variant="secondary">{item.signal_type}</Badge>
                    <Badge variant="outline">{item.verification_status}</Badge>
                  </div>
                  <button
                    aria-label={`打开 AI 信号 #${item.id}`}
                    className="mt-3 block w-full text-left underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => onOpenDetail(item)}
                    type="button"
                  >
                    <span className="line-clamp-2 text-base font-semibold">{item.title}</span>
                    <span className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.summary}</span>
                  </button>
                  {item.why_it_matters ? (
                    <div className="mt-3 rounded-md bg-muted/40 px-3 py-2 text-sm leading-6">
                      <span className="font-medium">为什么重要：</span>
                      <span className="text-muted-foreground">{item.why_it_matters}</span>
                    </div>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.source_name}</span>
                    <span>更新于 {formatDate(item.updated_at)}</span>
                    <TagList tags={item.tags} />
                  </div>
                </div>
                <div className="flex items-start gap-1">
                  <Button asChild aria-label={`打开来源：${item.title}`} size="sm" variant="outline">
                    <a href={item.source_url} rel="noreferrer" target="_blank">
                      来源
                      <ExternalLinkIcon data-icon="inline-end" />
                    </a>
                  </Button>
                  <ActionButtons
                    detailLabel={`打开 AI 信号 #${item.id}`}
                    onOpenDetail={() => onOpenDetail(item)}
                  />
                </div>
              </div>
            ))
          : null}
      </div>
    </div>
  );
}

function AiCodingOssTable({
  codingItems,
  isLoading,
  onAdded,
  onOpenDetail
}: {
  codingItems: AiCodingOssItem[];
  isLoading: boolean;
  onAdded: () => void;
  onOpenDetail: (item: AiCodingOssItem) => void;
}) {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const visibleItems = codingItems;
  const languageCount = new Set(visibleItems.map((item) => item.primary_language).filter(Boolean)).size;
  const pageCount = Math.max(1, Math.ceil(visibleItems.length / AI_CODING_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * AI_CODING_PAGE_SIZE;
  const pageItems = useMemo(
    () => visibleItems.slice(startIndex, startIndex + AI_CODING_PAGE_SIZE),
    [startIndex, visibleItems]
  );
  const visibleStart = visibleItems.length === 0 ? 0 : startIndex + 1;
  const visibleEnd = Math.min(visibleItems.length, startIndex + pageItems.length);

  useEffect(() => {
    setPage(1);
  }, [codingItems]);

  async function submitManualRepository(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!repoUrl.trim()) {
      toast.error("请输入 GitHub 仓库地址。");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await api.addManualAiCodingOss(repoUrl.trim());
      toast.success(`已分析 ${result.item.project_name}，当前提及 ${result.item.mention_count} 次。`);
      setRepoUrl("");
      setDialogOpen(false);
      onAdded();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "仓库分析失败，请稍后重试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex flex-col gap-3 border-b bg-muted/20 p-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="text-sm font-medium">全部开源项目</div>
          <div className="text-sm text-muted-foreground">
            已合并重复日报：当前 {visibleItems.length} 项 · {languageCount || 0} 种主要语言
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm" type="button">
          <PlusIcon data-icon="inline-start" />
          手动添加仓库
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table className="w-full min-w-[1080px] table-fixed">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-[20%]">项目</TableHead>
              <TableHead className="w-[28%]">一句话定位</TableHead>
              <TableHead className="w-[10%]">主要语言</TableHead>
              <TableHead className="w-[18%]">热度指标</TableHead>
              <TableHead className="w-[9%]">提及次数</TableHead>
              <TableHead className="w-[15%]">标签</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <LoadingRows columns={6} /> : null}
            {!isLoading && codingItems.length === 0 ? (
              <EmptyRow columns={6} label="没有匹配当前搜索的开源项目。" />
            ) : null}
            {!isLoading
              ? pageItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-normal break-words align-top">
                      <div className="flex min-w-0 flex-col gap-1">
                        <button
                          aria-label={`打开 ${item.project_name}`}
                          className="line-clamp-2 text-left text-base font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={() => onOpenDetail(item)}
                          type="button"
                        >
                          {item.project_name}
                        </button>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>最近 {formatDateOnly(item.last_mentioned_at)}</span>
                          <Button asChild aria-label={`打开仓库 ${item.project_name}`} size="icon-xs" variant="ghost">
                            <a href={item.repo_url} rel="noreferrer" target="_blank">
                              <ExternalLinkIcon />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal break-words align-top">
                      <button
                        className="line-clamp-3 w-full whitespace-normal break-words text-left text-sm leading-6 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => onOpenDetail(item)}
                        type="button"
                      >
                        {item.positioning}
                      </button>
                    </TableCell>
                    <TableCell className="whitespace-normal break-words align-top text-muted-foreground">
                      {item.primary_language ?? "未知"}
                    </TableCell>
                    <TableCell className="whitespace-normal break-words align-top">
                      <button
                        className="line-clamp-3 w-full whitespace-normal break-words text-left text-sm leading-6 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => onOpenDetail(item)}
                        type="button"
                      >
                        {item.momentum_text}
                      </button>
                    </TableCell>
                    <TableCell className="align-top">
                      <button
                        className="text-left text-sm font-medium tabular-nums underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => onOpenDetail(item)}
                        type="button"
                      >
                        {item.mention_count} 次
                      </button>
                    </TableCell>
                    <TableCell className="whitespace-normal break-words align-top">
                      <TagList tags={item.labels} />
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-3 border-t bg-muted/20 px-3 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>
          显示 {visibleStart}-{visibleEnd} / {visibleItems.length}
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={isLoading || currentPage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            size="sm"
            type="button"
            variant="outline"
          >
            上一页
          </Button>
          <span className="min-w-20 text-center tabular-nums">
            第 {currentPage} / {pageCount} 页
          </span>
          <Button
            disabled={isLoading || currentPage >= pageCount}
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            size="sm"
            type="button"
            variant="outline"
          >
            下一页
          </Button>
        </div>
      </div>
      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>手动添加 GitHub 仓库</DialogTitle>
            <DialogDescription>
              系统会读取公开仓库信息与 README，并通过 AI 生成定位、语言、热度指标和标签。
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={submitManualRepository}>
            <div className="grid gap-2">
              <Label htmlFor="manual-repository-url">仓库地址</Label>
              <Input
                autoComplete="url"
                disabled={isSubmitting}
                id="manual-repository-url"
                onChange={(event) => setRepoUrl(event.target.value)}
                placeholder="https://github.com/owner/repository"
                required
                type="url"
                value={repoUrl}
              />
            </div>
            <DialogFooter>
              <Button disabled={isSubmitting} onClick={() => setDialogOpen(false)} type="button" variant="outline">
                取消
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? <Loader2Icon className="animate-spin" data-icon="inline-start" /> : null}
                {isSubmitting ? "正在分析" : "分析并添加"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TablesTable({
  isLoading,
  loadingTable,
  onOpenTable,
  tables
}: {
  isLoading: boolean;
  loadingTable: string;
  onOpenTable: (tableName: string) => void;
  tables: TableSummary[];
}) {
  const sortedTables = useMemo(() => [...tables].sort((left, right) => left.table_name.localeCompare(right.table_name)), [tables]);

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
          <TableHeader className="bg-muted">
            <TableRow>
            <TableHead>表</TableHead>
            <TableHead className="w-40">估算行数</TableHead>
            <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <LoadingRows columns={3} /> : null}
          {!isLoading && sortedTables.length === 0 ? <EmptyRow columns={3} label="没有返回 public 表。" /> : null}
          {!isLoading
            ? sortedTables.map((table) => (
                <TableRow className="cursor-pointer" key={table.table_name} onClick={() => onOpenTable(table.table_name)}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <Table2Icon />
                      {table.table_name}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{table.estimated_rows}</TableCell>
                  <TableCell>
                    <Button
                      disabled={loadingTable === table.table_name}
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenTable(table.table_name);
                      }}
                      size="sm"
                      variant="outline"
                    >
                      {loadingTable === table.table_name ? <Loader2Icon className="animate-spin" data-icon="inline-start" /> : null}
                      打开
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            : null}
        </TableBody>
      </Table>
    </div>
  );
}

function TablePreviewPanel({
  onOpenDetail,
  preview
}: {
  onOpenDetail: (detail: MarkdownDetail) => void;
  preview: TablePreview;
}) {
  return (
    <Tabs className="min-h-0 flex-1 px-4 pb-6" defaultValue="rows">
      <TabsList>
        <TabsTrigger value="rows">近期行</TabsTrigger>
        <TabsTrigger value="schema">结构</TabsTrigger>
      </TabsList>
      <TabsContent className="mt-4 min-h-0" value="rows">
        <TableRowsPreview onOpenDetail={onOpenDetail} preview={preview} />
      </TabsContent>
      <TabsContent className="mt-4" value="schema">
        <TableSchema detail={preview.detail} />
      </TabsContent>
    </Tabs>
  );
}

function TableRowsPreview({
  onOpenDetail,
  preview
}: {
  onOpenDetail: (detail: MarkdownDetail) => void;
  preview: TablePreview;
}) {
  if (preview.data.rows.length === 0) {
    return <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">这张表没有返回行。</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="table-rows-scroll max-h-[calc(100vh-15rem)] overflow-auto">
        <table className="w-max min-w-full caption-bottom text-sm">
          <TableHeader className="sticky top-0 z-10 bg-muted">
            <TableRow>
              <TableHead className="sticky left-0 w-20 bg-muted">详情</TableHead>
              {preview.data.columns.map((column) => (
                <TableHead className="whitespace-nowrap" key={column}>
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.data.rows.map((row, rowIndex) => {
              return (
                <TableRow key={rowIndex}>
                  <TableCell className="sticky left-0 bg-popover align-top">
                    <ActionButtons
                      detailLabel={`打开 ${preview.name} 第 ${rowIndex + 1} 行`}
                      onOpenDetail={() =>
                        onOpenDetail({
                          title: `${preview.name} 第 ${rowIndex + 1} 行`,
                          description: `${preview.name} 的完整行数据`,
                          body: rowToMarkdown(row, preview.data.columns),
                          source: sourceFromRow(row, preview.data.columns),
                          metadata: [{ label: "字段数", value: String(preview.data.columns.length) }]
                        })
                      }
                    />
                  </TableCell>
                  {preview.data.columns.map((column) => (
                    <TableCell className="max-w-[360px] align-top" key={column}>
                      <DetailButton
                        description={`${preview.name}, row ${rowIndex + 1}, column ${column}`}
                        maxWidthClassName="max-w-[340px]"
                        onOpenDetail={() =>
                          onOpenDetail({
                            title: `${preview.name}.${column}`,
                            description: `第 ${rowIndex + 1} 行`,
                            body: valueToMarkdown(row[column]),
                            source: sourceFromValue(row[column])
                          })
                        }
                        title={`${preview.name}.${column}`}
                        value={row[column]}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </table>
      </div>
    </div>
  );
}

function TableSchema({ detail }: { detail: TableDetail }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Columns</h3>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>字段名</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>可空</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.columns.map((column) => (
                <TableRow key={column.column_name}>
                  <TableCell className="font-mono text-xs">{column.column_name}</TableCell>
                  <TableCell>{column.data_type}</TableCell>
                  <TableCell>{column.is_nullable}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">索引</h3>
        {detail.indexes.length > 0 ? (
          <div className="flex flex-col gap-2">
            {detail.indexes.map((index) => (
              <div className="rounded-lg border bg-muted/30 p-3" key={index.indexname}>
                <div className="font-mono text-xs font-medium">{index.indexname}</div>
                <div className="mt-2 break-words font-mono text-xs text-muted-foreground">{index.indexdef}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">没有返回索引。</div>
        )}
      </div>
    </div>
  );
}

function ActionButtons({
  detailLabel,
  onOpenDetail
}: {
  detailLabel: string;
  onOpenDetail: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        aria-label={detailLabel}
        onClick={(event) => {
          event.stopPropagation();
          onOpenDetail();
        }}
        size="icon-xs"
        title={detailLabel}
        type="button"
        variant="ghost"
      >
        <EyeIcon />
      </Button>
    </div>
  );
}

function DetailButton({
  description,
  maxWidthClassName,
  onOpenDetail,
  title,
  value
}: {
  description: string;
  maxWidthClassName: string;
  onOpenDetail: () => void;
  title: string;
  value: unknown;
}) {
  const preview = valueToPreview(value);
  if (!preview) return <span className="text-muted-foreground">null</span>;

  return (
    <button
      aria-label={`打开 ${title}: ${description}`}
      className={`block truncate text-left text-sm text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${maxWidthClassName}`}
      onClick={onOpenDetail}
      title={preview}
      type="button"
    >
      {preview}
    </button>
  );
}

function SourceLink({ source }: { source?: string | null }) {
  if (!source) return <span className="text-muted-foreground">无来源</span>;

  if (!isHttpUrl(source)) {
    return <span className="block max-w-[200px] truncate text-muted-foreground">{source}</span>;
  }

  return (
    <Button asChild size="xs" variant="ghost">
      <a className="max-w-[200px] justify-start" href={source} rel="noreferrer" target="_blank">
        <span className="truncate">来源</span>
        <ExternalLinkIcon data-icon="inline-end" />
      </a>
    </Button>
  );
}

function MarkdownDetailDialog({
  detail,
  onOpenChange
}: {
  detail: MarkdownDetail | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={detail !== null}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{detail?.title ?? "详情"}</DialogTitle>
          <DialogDescription>{detail?.description ?? "只读详情"}</DialogDescription>
        </DialogHeader>
        {detail?.metadata?.length ? (
          <div className="flex flex-wrap gap-2">
            {detail.metadata.map((item) => (
              <Badge key={`${item.label}-${item.value}`} variant="secondary">
                {item.label}: {item.value}
              </Badge>
            ))}
          </div>
        ) : null}
        {detail?.source && isHttpUrl(detail.source) ? (
          <Button asChild className="w-fit" size="sm" variant="outline">
            <a href={detail.source} rel="noreferrer" target="_blank">
              打开来源
              <ExternalLinkIcon data-icon="inline-end" />
            </a>
          </Button>
        ) : null}
        <div className="markdown-body rounded-lg border bg-muted/20 p-4">
          <ReactMarkdown
            components={{
              a: ({ children, href, ...props }) => (
                <a href={href} rel="noreferrer" target="_blank" {...props}>
                  {children}
                </a>
              )
            }}
            remarkPlugins={[remarkGfm]}
          >
            {detail?.body ?? ""}
          </ReactMarkdown>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return <span className="text-muted-foreground">无标签</span>;

  return (
    <div className="flex max-w-[260px] flex-wrap gap-1">
      {tags.slice(0, 4).map((tag) => (
        <Badge key={tag} variant="secondary">
          {tag}
        </Badge>
      ))}
      {tags.length > 4 ? <Badge variant="outline">+{tags.length - 4}</Badge> : null}
    </div>
  );
}

function EmptyRow({ columns, label }: { columns: number; label: string }) {
  return (
    <TableRow>
      <TableCell className="h-24 text-center text-muted-foreground" colSpan={columns}>
        {label}
      </TableCell>
    </TableRow>
  );
}

function valueToPreview(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function valueToMarkdown(value: unknown): string {
  if (value === null || value === undefined) return "_null_";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}

function rowToMarkdown(row: Record<string, unknown>, columns: string[]): string {
  return columns
    .map((column) => {
      const value = row[column];
      return `## ${column}\n\n${valueToMarkdown(value)}`;
    })
    .join("\n\n");
}

function sourceFromValue(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return isHttpUrl(value) ? value : null;
}

function sourceFromRow(row: Record<string, unknown>, columns: string[]): string | null {
  const preferredColumns = ["source_url", "source", "url", "link"];
  for (const column of preferredColumns) {
    const value = row[column];
    const source = sourceFromValue(value);
    if (source) return source;
  }
  for (const column of columns) {
    const source = sourceFromValue(row[column]);
    if (source) return source;
  }
  return null;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
