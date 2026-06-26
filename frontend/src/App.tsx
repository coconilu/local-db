import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Loader,
  SegmentedControl,
  Table,
  Text,
  TextInput
} from "@mantine/core";
import { motion } from "framer-motion";
import {
  Activity,
  Database,
  FileText,
  Gauge,
  Newspaper,
  RefreshCw,
  Search,
  Server,
  Table2,
  Terminal
} from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

import { Inspector } from "./components/Inspector";
import { QueryPanel } from "./components/QueryPanel";
import { RadixScroll } from "./components/RadixScroll";
import { StatCard } from "./components/StatCard";
import { StatusTip } from "./components/StatusTip";
import { api, formatDate } from "./lib/api";
import type { AiNewsItem, HealthResponse, Note, TableDetail, TableSummary } from "./types";

type View = "overview" | "notes" | "ai-news" | "tables" | "query";
type Selection =
  | { kind: "note"; value: Note }
  | { kind: "ai-news"; value: AiNewsItem }
  | { kind: "table"; value: TableDetail }
  | { kind: "none"; value: null };

const navigation: Array<{ id: View; label: string; icon: typeof Gauge }> = [
  { id: "overview", label: "Overview", icon: Gauge },
  { id: "notes", label: "Notes", icon: FileText },
  { id: "ai-news", label: "AI News", icon: Newspaper },
  { id: "tables", label: "Tables", icon: Table2 },
  { id: "query", label: "Query", icon: Terminal }
];

const initialSelection: Selection = { kind: "none", value: null };

export function App() {
  const [view, setView] = useState<View>("overview");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [news, setNews] = useState<AiNewsItem[]>([]);
  const [tables, setTables] = useState<TableSummary[]>([]);
  const [selection, setSelection] = useState<Selection>(initialSelection);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const currentPort = window.location.port || "5173";

  function loadData(search = query) {
    startTransition(() => {
      setError("");
      Promise.all([api.health(), api.notes(search), api.aiNews(search), api.tables()])
        .then(([healthResult, noteResult, newsResult, tableResult]) => {
          setHealth(healthResult);
          setNotes(noteResult.items);
          setNews(newsResult.items);
          setTables(tableResult.items);
          if (selection.kind === "none" && noteResult.items.length > 0) {
            setSelection({ kind: "note", value: noteResult.items[0] });
          }
        })
        .catch((err: Error) => setError(err.message));
    });
  }

  useEffect(() => {
    loadData("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const map = new Map((health?.counts ?? []).map((item) => [item.name, item.count]));
    return {
      notes: map.get("notes") ?? notes.length,
      news: map.get("ai_news_items") ?? news.length,
      tables: map.get("tables") ?? tables.length
    };
  }, [health, news.length, notes.length, tables.length]);

  const selectedValue = selection.kind === "none" ? null : selection.value;

  return (
    <div className="dashboard-shell">
      <aside className="side-rail">
        <div className="brand-block">
          <span className="brand-mark">
            <Database size={22} />
          </span>
          <div>
            <Text className="brand-title">Local Postgres</Text>
            <Text className="brand-subtitle">Control</Text>
          </div>
        </div>
        <nav className="nav-stack">
          {navigation.map((item) => (
            <button
              className={`nav-item ${view === item.id ? "active" : ""}`}
              key={item.id}
              onClick={() => setView(item.id)}
            >
              <item.icon size={17} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-surface">
        <header className="top-bar">
          <Group gap={10}>
            <StatusTip label="FastAPI is reading from the local-postgres Docker network.">
              <Badge className="connection-badge" leftSection={<Activity size={13} />}>
                {health?.status ?? "checking"} - {health?.database?.database ?? "localdb"}
              </Badge>
            </StatusTip>
            <Text className="muted hide-mobile">LAN-ready dashboard on port {currentPort}</Text>
          </Group>
          <Group className="top-actions">
            <TextInput
              className="global-search"
              placeholder="Search notes and AI news"
              leftSection={<Search size={16} />}
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") loadData(event.currentTarget.value);
              }}
            />
            <ActionIcon className="icon-button" aria-label="Refresh data" loading={isPending} onClick={() => loadData()}>
              <RefreshCw size={17} />
            </ActionIcon>
          </Group>
        </header>

        {error && <div className="error-line">{error}</div>}

        <div className="content-grid">
          <motion.section
            className="workspace"
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {isPending && !health ? <Loader color="cyan" /> : null}
            {view === "overview" && <Overview counts={counts} notes={notes} news={news} tables={tables} onSelect={setSelection} />}
            {view === "notes" && <NotesView notes={notes} onSelect={(note) => setSelection({ kind: "note", value: note })} />}
            {view === "ai-news" && <AiNewsView news={news} onSelect={(item) => setSelection({ kind: "ai-news", value: item })} />}
            {view === "tables" && <TablesView tables={tables} onSelect={setSelection} />}
            {view === "query" && <QueryPanel />}
          </motion.section>
          <Inspector selected={selectedValue} kind={selection.kind} />
        </div>
      </main>
    </div>
  );
}

function Overview({
  counts,
  notes,
  news,
  tables,
  onSelect
}: {
  counts: { notes: number; news: number; tables: number };
  notes: Note[];
  news: AiNewsItem[];
  tables: TableSummary[];
  onSelect: (selection: Selection) => void;
}) {
  return (
    <div className="view-stack">
      <section className="stat-grid">
        <StatCard label="Tables" value={counts.tables} icon={Server} tone="cyan" />
        <StatCard label="Notes" value={counts.notes} icon={FileText} tone="green" />
        <StatCard label="AI News" value={counts.news} icon={Newspaper} tone="violet" />
        <StatCard label="Mode" value="Read-only" icon={Terminal} tone="cyan" />
      </section>
      <section className="split-panels">
        <div className="panel">
          <PanelHeading title="Recent Notes" subtitle="Latest rows from notes" />
          <RadixScroll className="list-scroll">
            {notes.length === 0 ? (
              <div className="empty-state">No notes match the current filter.</div>
            ) : (
              notes.slice(0, 8).map((note) => (
                <button className="data-row" key={note.id} onClick={() => onSelect({ kind: "note", value: note })}>
                  <span className="row-id">#{note.id}</span>
                  <span className="row-main">{note.content}</span>
                  <span className="row-meta">{formatDate(note.created_at)}</span>
                </button>
              ))
            )}
          </RadixScroll>
        </div>
        <div className="panel">
          <PanelHeading title="AI Signal Digest" subtitle="Prioritized items from ai_news_items" />
          <RadixScroll className="list-scroll">
            {news.length === 0 ? (
              <div className="empty-state">No AI news rows yet.</div>
            ) : (
              news.slice(0, 8).map((item) => (
                <button className="data-row news-row" key={item.id} onClick={() => onSelect({ kind: "ai-news", value: item })}>
                  <Badge className="priority-badge">{item.priority}</Badge>
                  <span className="row-main">{item.title}</span>
                  <span className="row-meta">{item.source_name}</span>
                </button>
              ))
            )}
          </RadixScroll>
        </div>
      </section>
      <div className="panel">
        <PanelHeading title="Public Tables" subtitle="Current schema surface" />
        <div className="table-chip-row">
          {tables.map((table) => (
            <span className="table-chip" key={table.table_name}>
              {table.table_name}
              <small>{table.estimated_rows} est.</small>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotesView({ notes, onSelect }: { notes: Note[]; onSelect: (note: Note) => void }) {
  return (
    <div className="panel tall-panel">
      <PanelHeading title="Notes" subtitle="Read-only memory rows" />
      <RadixScroll className="table-scroll">
        <Table className="data-table">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Content</Table.Th>
              <Table.Th>Tags</Table.Th>
              <Table.Th>Created</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {notes.map((note) => (
              <Table.Tr key={note.id} onClick={() => onSelect(note)}>
                <Table.Td>#{note.id}</Table.Td>
                <Table.Td>{note.content}</Table.Td>
                <Table.Td>{note.tags.join(", ") || "none"}</Table.Td>
                <Table.Td>{formatDate(note.created_at)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </RadixScroll>
    </div>
  );
}

function AiNewsView({ news, onSelect }: { news: AiNewsItem[]; onSelect: (item: AiNewsItem) => void }) {
  const [priority, setPriority] = useState("all");
  const filtered = priority === "all" ? news : news.filter((item) => item.priority === priority);

  return (
    <div className="panel tall-panel">
      <Group justify="space-between" align="start">
        <PanelHeading title="AI News" subtitle="Digest items with priority and source context" />
        <SegmentedControl
          className="segmented"
          value={priority}
          onChange={setPriority}
          data={["all", "high", "medium_high", "medium", "low"]}
        />
      </Group>
      <RadixScroll className="table-scroll">
        <div className="news-list">
          {filtered.map((item) => (
            <button className="news-card" key={item.id} onClick={() => onSelect(item)}>
              <Group justify="space-between" align="center">
                <Badge className="priority-badge">{item.priority}</Badge>
                <Text className="row-meta">{formatDate(item.published_at || item.digest_run_at)}</Text>
              </Group>
              <Text className="news-title">{item.title}</Text>
              <Text className="news-summary">{item.summary}</Text>
              <Group gap={8}>
                <Badge className="tag-badge">{item.category}</Badge>
                <Badge className="tag-badge">{item.signal_type}</Badge>
                <Text className="row-meta">{item.source_name}</Text>
              </Group>
            </button>
          ))}
        </div>
      </RadixScroll>
    </div>
  );
}

function TablesView({
  tables,
  onSelect
}: {
  tables: TableSummary[];
  onSelect: (selection: Selection) => void;
}) {
  const [loadingTable, setLoadingTable] = useState("");

  function inspectTable(name: string) {
    setLoadingTable(name);
    api
      .table(name)
      .then((detail) => onSelect({ kind: "table", value: detail }))
      .finally(() => setLoadingTable(""));
  }

  return (
    <div className="panel tall-panel">
      <PanelHeading title="Tables" subtitle="Schema browser for public tables" />
      <div className="schema-grid">
        {tables.map((table) => (
          <button className="schema-card" key={table.table_name} onClick={() => inspectTable(table.table_name)}>
            <Group justify="space-between">
              <Text className="schema-name">{table.table_name}</Text>
              {loadingTable === table.table_name ? <Loader size={16} color="cyan" /> : <Table2 size={16} />}
            </Group>
            <Text className="muted">{table.estimated_rows} estimated rows</Text>
          </button>
        ))}
      </div>
    </div>
  );
}

function PanelHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="panel-heading">
      <Text className="section-title">{title}</Text>
      <Text className="muted">{subtitle}</Text>
    </div>
  );
}
