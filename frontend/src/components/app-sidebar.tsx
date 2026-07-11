import {
  ActivityIcon,
  BotIcon,
  DatabaseIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  NewspaperIcon,
  ServerIcon,
  Table2Icon,
  TerminalIcon
} from "lucide-react";
import type * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import type { DashboardView } from "@/types";

type Counts = {
  coding: number;
  notes: number;
  news: number;
  tables: number;
};

const navItems: Array<{
  description?: string;
  title: string;
  view: DashboardView;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  unit?: string;
}> = [
  { title: "工作台总览", view: "overview", icon: LayoutDashboardIcon },
  { description: "沉淀与标签", title: "笔记库", view: "notes", icon: FileTextIcon, unit: "条" },
  { description: "资讯与核验", title: "AI 信号流", view: "ai-news", icon: NewspaperIcon, unit: "条" },
  { description: "每日 Top 5", title: "开源项目雷达", view: "ai-coding-oss", icon: BotIcon, unit: "项" }
];

const systemItems: Array<{
  title: string;
  view: DashboardView;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  unit?: string;
}> = [
  { title: "数据表", view: "tables", icon: Table2Icon, unit: "张" },
  { title: "只读 SQL", view: "query", icon: TerminalIcon }
];

function countForView(view: DashboardView, counts: Counts) {
  if (view === "notes") return counts.notes;
  if (view === "ai-news") return counts.news;
  if (view === "ai-coding-oss") return counts.coding;
  if (view === "tables") return counts.tables;
  return null;
}

export function AppSidebar({
  activeView,
  counts,
  onViewChange,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  activeView: DashboardView;
  counts: Counts;
  onViewChange: (view: DashboardView) => void;
}) {
  const totalKnowledge = counts.notes + counts.news + counts.coding;

  return (
    <Sidebar collapsible="offcanvas" variant="inset" {...props}>
      <SidebarHeader className="pb-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-14 data-[slot=sidebar-menu-button]:p-2" size="lg">
              <span className="flex aspect-square size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                <DatabaseIcon aria-hidden="true" />
              </span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-semibold">Local DB</span>
                <span className="truncate text-xs text-muted-foreground">知识与信号工作台</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pb-1">
          <SidebarGroupContent>
            <div className="knowledge-sidebar-summary">
              <div className="knowledge-count-ring" aria-label={`共 ${totalKnowledge} 条知识内容`}>
                <div>
                  <strong>{totalKnowledge}</strong>
                  <span>条内容</span>
                </div>
              </div>
              <div className="grid gap-1">
                <span className="text-sm font-semibold text-sidebar-foreground">知识脉络</span>
                <span className="text-xs leading-5 text-sidebar-foreground/60">
                  {counts.notes} 条笔记 · {counts.news} 条信号
                </span>
                <span className="text-xs leading-5 text-sidebar-foreground/60">{counts.coding} 个项目观察</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>内容工作区</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const count = countForView(item.view, counts);

                return (
                  <SidebarMenuItem key={item.view}>
                    <SidebarMenuButton
                      className={item.description ? "h-11 pr-14" : undefined}
                      isActive={activeView === item.view}
                      onClick={() => onViewChange(item.view)}
                      tooltip={item.title}
                    >
                      <item.icon aria-hidden="true" />
                      <span className={item.description ? "grid min-w-0 flex-1 leading-tight" : undefined}>
                        <span className="truncate">{item.title}</span>
                        {item.description ? (
                          <span className="truncate text-xs font-normal text-sidebar-foreground/55">{item.description}</span>
                        ) : null}
                      </span>
                      {count !== null && item.unit ? (
                        <SidebarMenuBadge>
                          {count}{item.unit}
                        </SidebarMenuBadge>
                      ) : null}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>系统工具</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => {
                const count = countForView(item.view, counts);

                return (
                  <SidebarMenuItem key={item.view}>
                    <SidebarMenuButton
                      isActive={activeView === item.view}
                      onClick={() => onViewChange(item.view)}
                      tooltip={item.title}
                    >
                      <item.icon aria-hidden="true" />
                      <span>{item.title}</span>
                      {count !== null && item.unit ? (
                        <SidebarMenuBadge>
                          {count}{item.unit}
                        </SidebarMenuBadge>
                      ) : null}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>运行边界</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <ServerIcon aria-hidden="true" />
                  <span>Docker Compose</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <ActivityIcon aria-hidden="true" />
                  <span>只读 Dashboard</span>
                  <span className="ml-auto size-2 rounded-full bg-chart-1" aria-label="运行正常" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="rounded-xl border border-sidebar-border bg-background/70 p-3 text-xs leading-5 text-muted-foreground shadow-xs">
          浏览与查询留在这里；写入和迁移继续使用 Docker CLI。
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
