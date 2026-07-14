import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { AiCodingOssItem, AiNewsItem, Note, TableSummary } from "@/types";

type ActivityPoint = {
  coding: number;
  date: string;
  notes: number;
  news: number;
};

const chartConfig = {
  notes: {
    label: "笔记",
    color: "var(--chart-1)"
  },
  news: {
    label: "AI 信号",
    color: "var(--chart-3)"
  },
  coding: {
    label: "开源项目",
    color: "var(--chart-2)"
  }
} satisfies ChartConfig;

function dayKey(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function buildActivity(notes: Note[], news: AiNewsItem[], codingItems: AiCodingOssItem[]): ActivityPoint[] {
  const grouped = new Map<string, ActivityPoint>();

  for (const note of notes) {
    const key = dayKey(note.created_at);
    if (!key) continue;
    const current = grouped.get(key) ?? { coding: 0, date: key, notes: 0, news: 0 };
    current.notes += 1;
    grouped.set(key, current);
  }

  for (const item of news) {
    const key = dayKey(item.published_at ?? item.digest_run_at ?? item.created_at);
    if (!key) continue;
    const current = grouped.get(key) ?? { coding: 0, date: key, notes: 0, news: 0 };
    current.news += 1;
    grouped.set(key, current);
  }

  for (const item of codingItems) {
    const key = dayKey(item.last_mentioned_at ?? item.updated_at ?? item.created_at);
    if (!key) continue;
    const current = grouped.get(key) ?? { coding: 0, date: key, notes: 0, news: 0 };
    current.coding += 1;
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
  codingItems,
  news,
  notes,
  tables
}: {
  codingItems: AiCodingOssItem[];
  news: AiNewsItem[];
  notes: Note[];
  tables: TableSummary[];
}) {
  const [timeRange, setTimeRange] = useState("30d");
  const activity = useMemo(() => buildActivity(notes, news, codingItems), [codingItems, news, notes]);
  const filteredData = useMemo(() => filterActivity(activity, timeRange), [activity, timeRange]);
  const estimatedRows = tables.reduce((total, table) => total + Math.max(0, table.estimated_rows), 0);
  const maxActivity = Math.max(0, ...filteredData.map((item) => item.notes + item.news + item.coding));
  const yMax = Math.max(1, Math.ceil(maxActivity * 1.15));

  return (
    <Card className="@container/card overflow-hidden">
      <CardHeader>
        <CardTitle>内容活动趋势</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">按日期汇总笔记、AI 信号和开源项目提及</span>
          <span className="@[540px]/card:hidden">近期内容活动</span>
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
            <ToggleGroupItem value="7d">7 天</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 天</ToggleGroupItem>
            <ToggleGroupItem value="all">全部</ToggleGroupItem>
          </ToggleGroup>
          <Select onValueChange={setTimeRange} value={timeRange}>
            <SelectTrigger aria-label="选择图表范围" className="flex w-32 @[767px]/card:hidden" size="sm">
              <SelectValue placeholder="范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="7d">7 天</SelectItem>
                <SelectItem value="30d">30 天</SelectItem>
                <SelectItem value="all">全部</SelectItem>
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
                <linearGradient id="fillCoding" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-coding)" stopOpacity={0.72} />
                  <stop offset="95%" stopColor="var(--color-coding)" stopOpacity={0.08} />
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
              <Area dataKey="coding" fill="url(#fillCoding)" stackId="a" stroke="var(--color-coding)" type="natural" />
              <Area dataKey="news" fill="url(#fillNews)" stackId="a" stroke="var(--color-news)" type="natural" />
              <Area dataKey="notes" fill="url(#fillNotes)" stackId="a" stroke="var(--color-notes)" type="natural" />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[260px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            暂时没有带日期的内容活动。
          </div>
        )}
        <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-4">
          <div>已加载笔记：{notes.length}</div>
          <div>已加载 AI 信号：{news.length}</div>
          <div>已加载开源项目：{codingItems.length}</div>
          <div>系统估算行数：{estimatedRows}</div>
        </div>
      </CardContent>
    </Card>
  );
}
