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
  { description: "沉淀、标签和来源", title: "笔记库", view: "notes", icon: FileTextIcon, unit: "条" },
  { description: "资讯、优先级和可信度", title: "AI 信号流", view: "ai-news", icon: NewspaperIcon, unit: "条" },
  { description: "每日 Top 5 开源项目", title: "开源项目雷达", view: "ai-coding-oss", icon: BotIcon, unit: "项" }
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
  return (
    <Sidebar collapsible="offcanvas" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-12 data-[slot=sidebar-menu-button]:p-2" size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <DatabaseIcon />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Local DB</span>
                <span className="truncate text-xs text-muted-foreground">知识与信号工作台</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
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
                    <item.icon />
                    <span className={item.description ? "grid min-w-0 flex-1 leading-tight" : undefined}>
                      <span className="truncate">{item.title}</span>
                      {item.description ? (
                        <span className="truncate text-xs font-normal text-sidebar-foreground/60">{item.description}</span>
                      ) : null}
                    </span>
                    {count !== null && item.unit ? <SidebarMenuBadge>{count}{item.unit}</SidebarMenuBadge> : null}
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
                    <item.icon />
                    <span>{item.title}</span>
                    {count !== null && item.unit ? <SidebarMenuBadge>{count}{item.unit}</SidebarMenuBadge> : null}
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
                  <ServerIcon />
                  <span>Docker Compose</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <ActivityIcon />
                  <span>Guarded API</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="rounded-lg border bg-background/60 p-3 text-xs text-muted-foreground">
          Dashboard 只负责浏览；写入和迁移继续走 Docker CLI。
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
