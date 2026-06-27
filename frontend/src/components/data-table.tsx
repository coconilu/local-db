import { ExternalLinkIcon, Loader2Icon, Table2Icon } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
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
import type { AiNewsItem, DashboardView, Note, TableDetail, TableSummary } from "@/types";

type DataTab = "notes" | "ai-news" | "tables";

function toDataTab(view: DashboardView): DataTab {
  if (view === "ai-news" || view === "tables") return view;
  return "notes";
}

function toDashboardView(value: string): DashboardView {
  if (value === "ai-news" || value === "tables") return value;
  return "notes";
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
  const [tableDetail, setTableDetail] = useState<TableDetail | null>(null);
  const [loadingTable, setLoadingTable] = useState("");
  const activeTab = toDataTab(view);

  async function inspectTable(tableName: string) {
    setLoadingTable(tableName);
    try {
      const detail = await api.table(tableName);
      setTableDetail(detail);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to inspect ${tableName}`);
    } finally {
      setLoadingTable("");
    }
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
            <NotesTable isLoading={isLoading} notes={notes} />
          </DataCard>
        </TabsContent>

        <TabsContent className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6" value="ai-news">
          <DataCard description="AI signal rows with source and verification context" title="AI News">
            <NewsTable isLoading={isLoading} news={news} />
          </DataCard>
        </TabsContent>

        <TabsContent className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6" value="tables">
          <DataCard description="Public schema tables and estimated row counts" title="Tables">
            <TablesTable
              isLoading={isLoading}
              loadingTable={loadingTable}
              onInspectTable={(name) => void inspectTable(name)}
              tables={tables}
            />
          </DataCard>
        </TabsContent>
      </Tabs>

      <Sheet onOpenChange={(open) => !open && setTableDetail(null)} open={tableDetail !== null}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{tableDetail?.table ?? "Table details"}</SheetTitle>
            <SheetDescription>Columns and indexes from the public schema.</SheetDescription>
          </SheetHeader>
          {tableDetail ? (
            <div className="mt-6 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">Columns</h3>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Nullable</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableDetail.columns.map((column) => (
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
                {tableDetail.indexes.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {tableDetail.indexes.map((index) => (
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
          ) : null}
        </SheetContent>
      </Sheet>
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

function NotesTable({ isLoading, notes }: { isLoading: boolean; notes: Note[] }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="w-20">ID</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="w-40">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? <LoadingRows columns={4} /> : null}
          {!isLoading && notes.length === 0 ? <EmptyRow columns={4} label="No notes match the current filter." /> : null}
          {!isLoading
            ? notes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell className="font-mono text-xs">#{note.id}</TableCell>
                  <TableCell className="max-w-[520px] truncate">{note.content}</TableCell>
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
  );
}

function NewsTable({ isLoading, news }: { isLoading: boolean; news: AiNewsItem[] }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="w-32">Priority</TableHead>
            <TableHead className="w-40">Source</TableHead>
            <TableHead className="w-36">Updated</TableHead>
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? <LoadingRows columns={5} /> : null}
          {!isLoading && news.length === 0 ? <EmptyRow columns={5} label="No AI news rows match the current filter." /> : null}
          {!isLoading
            ? news.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex max-w-[560px] flex-col gap-1">
                      <span className="truncate font-medium">{item.title}</span>
                      <span className="line-clamp-2 text-xs text-muted-foreground">{item.summary}</span>
                    </div>
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
  );
}

function TablesTable({
  isLoading,
  loadingTable,
  onInspectTable,
  tables
}: {
  isLoading: boolean;
  loadingTable: string;
  onInspectTable: (tableName: string) => void;
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
                <TableRow key={table.table_name}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <Table2Icon />
                      {table.table_name}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{table.estimated_rows}</TableCell>
                  <TableCell>
                    <Button disabled={loadingTable === table.table_name} onClick={() => onInspectTable(table.table_name)} size="sm" variant="outline">
                      {loadingTable === table.table_name ? <Loader2Icon className="animate-spin" data-icon="inline-start" /> : null}
                      Inspect
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
