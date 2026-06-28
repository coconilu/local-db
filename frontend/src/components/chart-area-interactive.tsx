import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { AiNewsItem, Note, TableSummary } from "@/types";

type ActivityPoint = {
  date: string;
  notes: number;
  news: number;
};

const chartConfig = {
  notes: {
    label: "Notes",
    color: "var(--chart-1)"
  },
  news: {
    label: "AI News",
    color: "var(--chart-3)"
  }
} satisfies ChartConfig;

function dayKey(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function buildActivity(notes: Note[], news: AiNewsItem[]): ActivityPoint[] {
  const grouped = new Map<string, ActivityPoint>();

  for (const note of notes) {
    const key = dayKey(note.created_at);
    if (!key) continue;
    const current = grouped.get(key) ?? { date: key, notes: 0, news: 0 };
    current.notes += 1;
    grouped.set(key, current);
  }

  for (const item of news) {
    const key = dayKey(item.published_at ?? item.digest_run_at ?? item.created_at);
    if (!key) continue;
    const current = grouped.get(key) ?? { date: key, notes: 0, news: 0 };
    current.news += 1;
    grouped.set(key, current);
  }

  return Array.from(grouped.values()).sort((left, right) => left.date.localeCompare(right.date));
}

function filterActivity(data: ActivityPoint[], range: string) {
  if (range === "all" || data.length === 0) return data;

  const lastDate = new Date(data[data.length - 1].date);
  const days = range === "7d" ? 7 : 30;
  const start = new Date(lastDate);
  start.setDate(lastDate.getDate() - days);

  return data.filter((item) => new Date(item.date) >= start);
}

export function ChartAreaInteractive({
  news,
  notes,
  tables
}: {
  news: AiNewsItem[];
  notes: Note[];
  tables: TableSummary[];
}) {
  const [timeRange, setTimeRange] = useState("30d");
  const activity = useMemo(() => buildActivity(notes, news), [news, notes]);
  const filteredData = useMemo(() => filterActivity(activity, timeRange), [activity, timeRange]);
  const estimatedRows = tables.reduce((total, table) => total + Math.max(0, table.estimated_rows), 0);
  const maxActivity = Math.max(0, ...filteredData.map((item) => item.notes + item.news));
  const yMax = Math.max(1, Math.ceil(maxActivity * 1.15));

  return (
    <Card className="@container/card overflow-hidden">
      <CardHeader>
        <CardTitle>Database activity</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">Recent note and AI signal rows grouped by day</span>
          <span className="@[540px]/card:hidden">Recent row activity</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
            onValueChange={(value) => {
              if (value) setTimeRange(value);
            }}
            type="single"
            value={timeRange}
            variant="outline"
          >
            <ToggleGroupItem value="7d">7d</ToggleGroupItem>
            <ToggleGroupItem value="30d">30d</ToggleGroupItem>
            <ToggleGroupItem value="all">All</ToggleGroupItem>
          </ToggleGroup>
          <Select onValueChange={setTimeRange} value={timeRange}>
            <SelectTrigger aria-label="Select chart range" className="flex w-32 @[767px]/card:hidden" size="sm">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="all">All rows</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="overflow-hidden px-2 pt-4 sm:px-6 sm:pt-6">
        {filteredData.length > 0 ? (
          <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full min-w-0 overflow-hidden">
            <AreaChart data={filteredData} margin={{ bottom: 0, left: 12, right: 12, top: 24 }}>
              <defs>
                <linearGradient id="fillNotes" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-notes)" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="var(--color-notes)" stopOpacity={0.08} />
                </linearGradient>
                <linearGradient id="fillNews" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-news)" stopOpacity={0.75} />
                  <stop offset="95%" stopColor="var(--color-news)" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <YAxis domain={[0, yMax]} hide />
              <XAxis
                axisLine={false}
                dataKey="date"
                minTickGap={32}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short"
                  })
                }
                tickLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })
                    }
                  />
                }
                cursor={false}
              />
              <Area dataKey="news" fill="url(#fillNews)" stackId="a" stroke="var(--color-news)" type="natural" />
              <Area dataKey="notes" fill="url(#fillNotes)" stackId="a" stroke="var(--color-notes)" type="natural" />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[260px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            No dated rows yet. Insert notes or AI news items to populate activity.
          </div>
        )}
        <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
          <div>Loaded notes: {notes.length}</div>
          <div>Loaded AI signals: {news.length}</div>
          <div>Estimated rows across tables: {estimatedRows}</div>
        </div>
      </CardContent>
    </Card>
  );
}
