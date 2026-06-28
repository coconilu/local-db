import { ExternalLinkIcon, EyeIcon, Loader2Icon, Table2Icon, Trash2Icon } from "lucide-react";
import type { CSSProperties, MouseEvent as ReactMouseEvent, PointerEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
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
import { api, formatDate } from "@/lib/api";
import type { AiNewsItem, DashboardView, Note, QueryResult, TableDetail, TableSummary } from "@/types";

type DataTab = "notes" | "ai-news" | "tables";

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
  if (view === "ai-news" || view === "tables") return view;
  return "notes";
}

function toDashboardView(value: string): DashboardView {
  if (value === "ai-news" || value === "tables") return value;
  return "notes";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function showReadOnlyDeleteToast(label: string) {
  toast("Delete is disabled in read-only viewer", {
    description: `${label} was not deleted.`
  });
}

export function DataTable({
  isLoading,
  news,
  notes,
  onViewChange,
  tables,
  view
}: {
  isLoading: boolean;
  news: AiNewsItem[];
  notes: Note[];
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

  async function openTable(tableName: string) {
    setLoadingTable(tableName);
    try {
      const [detailResponse, rowsResponse] = await Promise.all([api.table(tableName), api.tableRows(tableName)]);
      setTablePreview({ name: tableName, detail: detailResponse, data: rowsResponse });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to open ${tableName}`);
    } finally {
      setLoadingTable("");
    }
  }

  function openNote(note: Note) {
    setDetail({
      title: `Note #${note.id}`,
      description: `Created ${formatDate(note.created_at)}`,
      body: note.content,
      source: note.source,
      metadata: [
        { label: "Tags", value: note.tags.length ? note.tags.join(", ") : "none" },
        { label: "Updated", value: formatDate(note.updated_at) }
      ]
    });
  }

  function openNewsItem(item: AiNewsItem) {
    const body = [
      "## Summary",
      item.summary,
      item.why_it_matters ? `## Why it matters\n\n${item.why_it_matters}` : "",
      item.entities.length ? `## Entities\n\n${item.entities.map((entity) => `- ${entity}`).join("\n")}` : "",
      item.tags.length ? `## Tags\n\n${item.tags.map((tag) => `- ${tag}`).join("\n")}` : ""
    ]
      .filter(Boolean)
      .join("\n\n");

    setDetail({
      title: item.title,
      description: `${item.source_name} · ${item.priority} · ${formatDate(item.updated_at)}`,
      body,
      source: item.source_url,
      metadata: [
        { label: "Category", value: item.category },
        { label: "Signal", value: item.signal_type },
        { label: "Verification", value: item.verification_status }
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
        className="w-full flex-col justify-start gap-6"
        onValueChange={(value) => onViewChange(toDashboardView(value))}
        value={activeTab}
      >
        <div className="flex items-center justify-between px-4 lg:px-6">
          <TabsList className="**:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1">
            <TabsTrigger value="notes">
              Notes <Badge variant="secondary">{notes.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="ai-news">
              AI News <Badge variant="secondary">{news.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="tables">
              Tables <Badge variant="secondary">{tables.length}</Badge>
            </TabsTrigger>
          </TabsList>
          <Badge className="hidden md:inline-flex" variant="outline">
            Read-only viewer
          </Badge>
        </div>

        <TabsContent className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6" value="notes">
          <DataCard description="Recent rows from the notes table" title="Notes">
            <NotesTable isLoading={isLoading} notes={notes} onOpenDetail={openNote} />
          </DataCard>
        </TabsContent>

        <TabsContent className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6" value="ai-news">
          <DataCard description="AI signal rows with source and verification context" title="AI News">
            <NewsTable isLoading={isLoading} news={news} onOpenDetail={openNewsItem} />
          </DataCard>
        </TabsContent>

        <TabsContent className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6" value="tables">
          <DataCard description="Click a table to inspect recent rows and schema" title="Tables">
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
            <SheetTitle>{tablePreview?.name ?? "Table data"}</SheetTitle>
            <SheetDescription>Read-only preview of recent rows and public schema metadata.</SheetDescription>
          </SheetHeader>
          {tablePreview ? <TablePreviewPanel onOpenDetail={setDetail} preview={tablePreview} /> : null}
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
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

function NotesTable({
  isLoading,
  notes,
  onOpenDetail
}: {
  isLoading: boolean;
  notes: Note[];
  onOpenDetail: (note: Note) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <Table className="min-w-[1040px]">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="sticky left-0 z-20 w-24 bg-muted">Action</TableHead>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Content</TableHead>
              <TableHead className="w-52">Source</TableHead>
              <TableHead className="w-72">Tags</TableHead>
              <TableHead className="w-40">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <LoadingRows columns={6} /> : null}
            {!isLoading && notes.length === 0 ? <EmptyRow columns={6} label="No notes match the current filter." /> : null}
            {!isLoading
              ? notes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="sticky left-0 z-10 bg-card">
                      <ActionButtons
                        deleteLabel={`Delete Note #${note.id}`}
                        detailLabel={`Open Note #${note.id}`}
                        onDelete={() => showReadOnlyDeleteToast(`Note #${note.id}`)}
                        onOpenDetail={() => onOpenDetail(note)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        aria-label={`Open Note #${note.id}`}
                        className="font-mono"
                        onClick={() => onOpenDetail(note)}
                        size="xs"
                        variant="ghost"
                      >
                        #{note.id}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <DetailButton
                        description={`Created ${formatDate(note.created_at)}`}
                        maxWidthClassName="max-w-[640px]"
                        onOpenDetail={() => onOpenDetail(note)}
                        title={`Note #${note.id}`}
                        value={note.content}
                      />
                    </TableCell>
                    <TableCell>
                      <SourceLink source={note.source} />
                    </TableCell>
                    <TableCell>
                      <TagList tags={note.tags} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(note.created_at)}</TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
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
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <Table className="min-w-[1120px]">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="sticky left-0 z-20 w-24 bg-muted">Action</TableHead>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-32">Priority</TableHead>
              <TableHead className="w-40">Source</TableHead>
              <TableHead className="w-36">Updated</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <LoadingRows columns={7} /> : null}
            {!isLoading && news.length === 0 ? <EmptyRow columns={7} label="No AI news rows match the current filter." /> : null}
            {!isLoading
              ? news.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="sticky left-0 z-10 bg-card">
                      <ActionButtons
                        deleteLabel={`Delete AI news item #${item.id}`}
                        detailLabel={`Open AI news item #${item.id}`}
                        onDelete={() => showReadOnlyDeleteToast(`AI news item #${item.id}`)}
                        onOpenDetail={() => onOpenDetail(item)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        aria-label={`Open AI news item #${item.id}`}
                        className="font-mono"
                        onClick={() => onOpenDetail(item)}
                        size="xs"
                        variant="ghost"
                      >
                        #{item.id}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <button
                        className="flex max-w-[640px] flex-col gap-1 text-left underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => onOpenDetail(item)}
                        type="button"
                      >
                        <span className="truncate font-medium">{item.title}</span>
                        <span className="line-clamp-2 text-xs text-muted-foreground">{item.summary}</span>
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.priority}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.source_name}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(item.updated_at)}</TableCell>
                    <TableCell>
                      <Button asChild aria-label={`Open source for ${item.title}`} size="icon-sm" variant="ghost">
                        <a href={item.source_url} rel="noreferrer" target="_blank">
                          <ExternalLinkIcon />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>
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
            <TableHead>Table</TableHead>
            <TableHead className="w-40">Estimated rows</TableHead>
            <TableHead className="w-28" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? <LoadingRows columns={3} /> : null}
          {!isLoading && sortedTables.length === 0 ? <EmptyRow columns={3} label="No public tables returned." /> : null}
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
                      Open
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
        <TabsTrigger value="rows">Rows</TabsTrigger>
        <TabsTrigger value="schema">Schema</TabsTrigger>
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
    return <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No rows returned for this table.</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="table-rows-scroll max-h-[calc(100vh-15rem)] overflow-auto">
        <table className="w-max min-w-full caption-bottom text-sm">
          <TableHeader className="sticky top-0 z-10 bg-muted">
            <TableRow>
              <TableHead className="sticky left-0 w-24 bg-muted">Action</TableHead>
              {preview.data.columns.map((column) => (
                <TableHead className="whitespace-nowrap" key={column}>
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.data.rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell className="sticky left-0 bg-popover align-top">
                  <ActionButtons
                    deleteLabel={`Delete ${preview.name} row ${rowIndex + 1}`}
                    detailLabel={`Open ${preview.name} row ${rowIndex + 1}`}
                    onDelete={() => showReadOnlyDeleteToast(`${preview.name} row ${rowIndex + 1}`)}
                    onOpenDetail={() =>
                      onOpenDetail({
                        title: `${preview.name} row ${rowIndex + 1}`,
                        description: `Complete row from ${preview.name}`,
                        body: rowToMarkdown(row, preview.data.columns),
                        source: sourceFromRow(row, preview.data.columns),
                        metadata: [{ label: "Columns", value: String(preview.data.columns.length) }]
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
                          description: `Row ${rowIndex + 1}`,
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
            ))}
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
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Nullable</TableHead>
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
        <h3 className="text-sm font-medium">Indexes</h3>
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
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">No indexes returned.</div>
        )}
      </div>
    </div>
  );
}

function ActionButtons({
  deleteLabel,
  detailLabel,
  onDelete,
  onOpenDetail
}: {
  deleteLabel: string;
  detailLabel: string;
  onDelete: () => void;
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
      <Button
        aria-label={deleteLabel}
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        size="icon-xs"
        title={deleteLabel}
        type="button"
        variant="destructive"
      >
        <Trash2Icon />
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
      aria-label={`Open ${title}: ${description}`}
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
  if (!source) return <span className="text-muted-foreground">none</span>;

  if (!isHttpUrl(source)) {
    return <span className="block max-w-[200px] truncate text-muted-foreground">{source}</span>;
  }

  return (
    <Button asChild size="sm" variant="ghost">
      <a className="max-w-[200px] justify-start" href={source} rel="noreferrer" target="_blank">
        <span className="truncate">Source</span>
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
          <DialogTitle>{detail?.title ?? "Detail"}</DialogTitle>
          <DialogDescription>{detail?.description ?? "Read-only detail view"}</DialogDescription>
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
              Open source
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
  if (tags.length === 0) return <span className="text-muted-foreground">none</span>;

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
