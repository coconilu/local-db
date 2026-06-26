import { Badge, Divider, Group, Text } from "@mantine/core";
import { ExternalLink } from "lucide-react";

import { formatDate } from "../lib/api";
import type { AiNewsItem, Note, TableDetail } from "../types";
import { RadixScroll } from "./RadixScroll";

type InspectorProps = {
  selected: Note | AiNewsItem | TableDetail | null;
  kind: "note" | "ai-news" | "table" | "none";
};

export function Inspector({ selected, kind }: InspectorProps) {
  return (
    <aside className="inspector">
      <Text className="section-kicker">Inspector</Text>
      <RadixScroll className="inspector-scroll">
        {!selected && <Text className="muted">Select a row to inspect metadata and details.</Text>}
        {kind === "note" && selected && <NoteInspector note={selected as Note} />}
        {kind === "ai-news" && selected && <AiNewsInspector item={selected as AiNewsItem} />}
        {kind === "table" && selected && <TableInspector detail={selected as TableDetail} />}
      </RadixScroll>
    </aside>
  );
}

function NoteInspector({ note }: { note: Note }) {
  return (
    <div className="inspector-stack">
      <Text className="detail-title">Note #{note.id}</Text>
      <Text className="muted">Created {formatDate(note.created_at)}</Text>
      <Text className="muted">Updated {formatDate(note.updated_at)}</Text>
      <Divider className="soft-divider" />
      <Text className="detail-body">{note.content}</Text>
      <Group gap={8}>
        {note.tags.map((tag) => (
          <Badge key={tag} className="tag-badge">
            {tag}
          </Badge>
        ))}
      </Group>
    </div>
  );
}

function AiNewsInspector({ item }: { item: AiNewsItem }) {
  return (
    <div className="inspector-stack">
      <Text className="detail-title">{item.title}</Text>
      <Group gap={8}>
        <Badge className="priority-badge">{item.priority}</Badge>
        <Badge className="tag-badge">{item.signal_type}</Badge>
      </Group>
      <Text className="muted">{item.source_name} - {formatDate(item.published_at || item.digest_run_at)}</Text>
      <a className="source-link" href={item.source_url} target="_blank" rel="noreferrer">
        Open source <ExternalLink size={14} />
      </a>
      <Divider className="soft-divider" />
      <Text className="detail-body">{item.summary}</Text>
      {item.why_it_matters && <Text className="detail-body emphasis">{item.why_it_matters}</Text>}
      <Group gap={8}>
        {[...item.entities, ...item.tags].slice(0, 10).map((tag) => (
          <Badge key={tag} className="tag-badge">
            {tag}
          </Badge>
        ))}
      </Group>
    </div>
  );
}

function TableInspector({ detail }: { detail: TableDetail }) {
  return (
    <div className="inspector-stack">
      <Text className="detail-title">{detail.table}</Text>
      <Text className="muted">{detail.columns.length} columns - {detail.indexes.length} indexes</Text>
      <Divider className="soft-divider" />
      {detail.columns.map((column) => (
        <div className="schema-line" key={column.column_name}>
          <Text>{column.column_name}</Text>
          <Text className="muted">{column.data_type}</Text>
        </div>
      ))}
    </div>
  );
}
