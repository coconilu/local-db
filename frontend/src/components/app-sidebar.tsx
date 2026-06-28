import {
  ActivityIcon,
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
  notes: number;
  news: number;
  tables: number;
};

const navItems: Array<{
  title: string;
  view: DashboardView;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}> = [
  { title: "Overview", view: "overview", icon: LayoutDashboardIcon },
  { title: "Notes", view: "notes", icon: FileTextIcon },
  { title: "AI News", view: "ai-news", icon: NewspaperIcon },
  { title: "Tables", view: "tables", icon: Table2Icon },
  { title: "Read-only Query", view: "query", icon: TerminalIcon }
];

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
                <span className="truncate text-xs text-muted-foreground">PostgreSQL control plane</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.view}>
                  <SidebarMenuButton
                    isActive={activeView === item.view}
                    onClick={() => onViewChange(item.view)}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                    {item.view === "notes" ? <SidebarMenuBadge>{counts.notes}</SidebarMenuBadge> : null}
                    {item.view === "ai-news" ? <SidebarMenuBadge>{counts.news}</SidebarMenuBadge> : null}
                    {item.view === "tables" ? <SidebarMenuBadge>{counts.tables}</SidebarMenuBadge> : null}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Runtime</SidebarGroupLabel>
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
          Queries stay read-only. Row deletes require an explicit confirmation.
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
