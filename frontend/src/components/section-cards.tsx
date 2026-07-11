import {
  ArrowRightIcon,
  BotIcon,
  FileTextIcon,
  NewspaperIcon,
  ShieldCheckIcon,
  SparklesIcon
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDateOnly } from "@/lib/api";
import type { AiCodingOssItem, AiNewsItem, DashboardView, Note } from "@/types";

type Counts = {
  coding: number;
  notes: number;
  news: number;
  tables: number;
};

function previewText(value: string | undefined, fallback: string, maxLength = 150) {
  if (!value?.trim()) return fallback;
  const normalized = value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[>*_#]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}…` : normalized;
}

export function SectionCards({
  codingItems,
  counts,
  databaseName,
  isLoading,
  news,
  notes,
  onViewChange,
  status
}: {
  codingItems: AiCodingOssItem[];
  counts: Counts;
  databaseName: string;
  isLoading: boolean;
  news: AiNewsItem[];
  notes: Note[];
  onViewChange: (view: DashboardView) => void;
  status: string;
}) {
  const latestNote = notes[0];
  const latestNews = news[0];
  const latestProject = codingItems[0];
  const totalKnowledge = counts.notes + counts.news + counts.coding;
  const recommendationTitle = latestProject?.project_name ?? latestNews?.title ?? "等待新的知识信号";
  const recommendationBody = latestProject
    ? previewText(latestProject.positioning, "查看最新开源项目日报")
    : previewText(latestNews?.summary, "新的 AI 信号和项目日报会在这里出现");
  const recommendationMeta = latestProject
    ? `${formatDateOnly(latestProject.brief_date)} · 排名 #${latestProject.digest_rank}`
    : latestNews
      ? `${latestNews.source_name} · ${formatDate(latestNews.updated_at)}`
      : "尚无推荐内容";
  const recommendationView: DashboardView = latestProject ? "ai-coding-oss" : "ai-news";

  const paths: Array<{
    count: number;
    description: string;
    icon: typeof FileTextIcon;
    label: string;
    view: DashboardView;
  }> = [
    {
      count: counts.notes,
      description: latestNote ? `最近更新 ${formatDate(latestNote.updated_at)}` : "沉淀内容、来源和标签",
      icon: FileTextIcon,
      label: "笔记库",
      view: "notes"
    },
    {
      count: counts.news,
      description: latestNews ? `${latestNews.verification_status} · ${latestNews.source_name}` : "按优先级和可信度阅读",
      icon: NewspaperIcon,
      label: "AI 信号流",
      view: "ai-news"
    },
    {
      count: counts.coding,
      description: latestProject ? `${formatDateOnly(latestProject.brief_date)} 最新项目` : "跟踪每日 Top 5 开源项目",
      icon: BotIcon,
      label: "开源项目雷达",
      view: "ai-coding-oss"
    }
  ];

  return (
    <section aria-labelledby="knowledge-overview-title" className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl" id="knowledge-overview-title">
            继续整理你的知识空间
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">
            从最近沉淀、待核验信号和项目雷达继续，让本地数据保持清晰可用。
          </p>
        </div>
        <Badge className="w-fit gap-1.5" variant="outline">
          <ShieldCheckIcon />
          {isLoading ? "正在同步" : `${status} · ${databaseName}`}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
        <Card className="knowledge-focus-card overflow-hidden border-primary bg-primary text-primary-foreground shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardDescription className="text-primary-foreground/75">最近沉淀</CardDescription>
              <SparklesIcon aria-hidden="true" />
            </div>
            <CardTitle className="text-xl leading-tight md:text-2xl">
              {latestNote ? `笔记 #${latestNote.id}` : "从第一条笔记开始"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-3 min-h-16 text-sm leading-6 text-primary-foreground/85">
              {previewText(latestNote?.content, "新的笔记会在这里成为下一次整理的起点。", 220)}
            </p>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-primary-foreground/15 bg-primary">
            <span className="text-xs text-primary-foreground/70">
              {latestNote ? `更新于 ${formatDate(latestNote.updated_at)}` : `${totalKnowledge} 条内容已归档`}
            </span>
            <Button onClick={() => onViewChange("notes")} size="sm" type="button" variant="secondary">
              打开笔记库
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="knowledge-recommendation-card overflow-hidden bg-secondary/65 shadow-sm">
          <CardHeader>
            <CardDescription>今日推荐</CardDescription>
            <CardTitle className="line-clamp-2 text-xl leading-tight">{recommendationTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-3 min-h-16 text-sm leading-6 text-muted-foreground">{recommendationBody}</p>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-3 bg-secondary">
            <span className="text-xs text-muted-foreground">{recommendationMeta}</span>
            <Button onClick={() => onViewChange(recommendationView)} size="sm" type="button" variant="outline">
              查看内容
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="knowledge-path-card gap-0 overflow-hidden py-0 shadow-xs">
        <CardHeader className="gap-0.5 border-b px-4 py-3">
          <CardTitle>知识路径</CardTitle>
          <CardDescription>用真实内容数量呈现当前积累，快速返回重要内容。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col p-0">
          {paths.map((path) => (
            <Button
              className="knowledge-path-button h-auto min-w-0 justify-start rounded-none px-4 py-2.5 text-left"
              key={path.view}
              onClick={() => onViewChange(path.view)}
              type="button"
              variant="ghost"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <path.icon aria-hidden="true" />
              </span>
              <span className="grid min-w-0 flex-1 gap-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{path.label}</span>
                  <span className="text-lg font-semibold tabular-nums">{path.count}</span>
                </span>
                <span className="truncate text-xs font-normal text-muted-foreground">{path.description}</span>
              </span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
