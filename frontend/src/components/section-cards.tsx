import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDateOnly } from "@/lib/api";
import type { AiCodingOssItem, AiNewsItem, Note } from "@/types";
import { BotIcon, DatabaseIcon, FileTextIcon, NewspaperIcon, ShieldCheckIcon } from "lucide-react";

type Counts = {
  coding: number;
  notes: number;
  news: number;
  tables: number;
};

export function SectionCards({
  codingItems,
  counts,
  databaseName,
  isLoading,
  news,
  notes,
  status
}: {
  codingItems: AiCodingOssItem[];
  counts: Counts;
  databaseName: string;
  isLoading: boolean;
  news: AiNewsItem[];
  notes: Note[];
  status: string;
}) {
  const noteTagCount = new Set(notes.flatMap((note) => note.tags)).size;
  const latestNote = notes[0]?.updated_at ?? notes[0]?.created_at;
  const highPriorityNews = news.filter((item) => /high|p0|p1|重要|高/i.test(item.priority)).length;
  const pendingVerification = news.filter((item) => /pending|unknown|待|未/i.test(item.verification_status)).length;
  const latestBriefDate = codingItems[0]?.brief_date;
  const latestBriefCount = latestBriefDate
    ? codingItems.filter((item) => item.brief_date === latestBriefDate).length
    : 0;

  const cards = [
    {
      label: "笔记库",
      value: counts.notes,
      unit: "条",
      detail: noteTagCount > 0 ? `${noteTagCount} 个标签，最近 ${formatDate(latestNote)}` : "沉淀内容、来源和标签",
      icon: FileTextIcon,
      badge: "可复用知识",
      footer: "优先用于回看、检索和整理线索"
    },
    {
      label: "AI 信号流",
      value: counts.news,
      unit: "条",
      detail: highPriorityNews > 0 ? `${highPriorityNews} 条重点信号，${pendingVerification} 条待核验` : "按优先级、分类和可信度阅读",
      icon: NewspaperIcon,
      badge: "资讯雷达",
      footer: "先看重要性，再打开来源"
    },
    {
      label: "开源项目雷达",
      value: counts.coding,
      unit: "项",
      detail: latestBriefDate ? `${formatDateOnly(latestBriefDate)} 最新 ${latestBriefCount} 项` : "跟踪每日 Top 5 与热度变化",
      icon: BotIcon,
      badge: "项目观察",
      footer: "默认聚焦最新日报，必要时看全部"
    },
    {
      label: "系统边界",
      value: "只读",
      unit: "",
      detail: isLoading ? "正在同步 API 状态" : `${counts.tables} 张表 · ${databaseName}`,
      icon: ShieldCheckIcon,
      badge: status,
      footer: "写入和迁移仍走 Docker CLI"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => (
        <Card className="@container/card bg-gradient-to-t from-muted/35 to-card shadow-xs" key={card.label}>
          <CardHeader>
            <CardDescription>{card.label}</CardDescription>
            <CardTitle className="flex items-baseline gap-1 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.value}
              {card.unit ? <span className="text-sm font-medium text-muted-foreground">{card.unit}</span> : null}
            </CardTitle>
            <CardAction>
              <Badge className="gap-1.5" variant="outline">
                <card.icon />
                {card.badge}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="flex gap-2 font-medium">
              <DatabaseIcon />
              {card.footer}
            </div>
            <div className="text-muted-foreground">{card.detail}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
