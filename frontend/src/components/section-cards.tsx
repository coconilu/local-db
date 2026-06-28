import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DatabaseIcon, FileTextIcon, NewspaperIcon, ShieldCheckIcon, Table2Icon } from "lucide-react";

type Counts = {
  notes: number;
  news: number;
  tables: number;
};

export function SectionCards({
  counts,
  databaseName,
  isLoading,
  status
}: {
  counts: Counts;
  databaseName: string;
  isLoading: boolean;
  status: string;
}) {
  const cards = [
    {
      label: "Public Tables",
      value: counts.tables,
      detail: "Schema objects in public",
      icon: Table2Icon,
      badge: databaseName
    },
    {
      label: "Notes",
      value: counts.notes,
      detail: "Rows available to agents",
      icon: FileTextIcon,
      badge: "notes"
    },
    {
      label: "AI News",
      value: counts.news,
      detail: "Signal rows in digest table",
      icon: NewspaperIcon,
      badge: "ai_news_items"
    },
    {
      label: "Mode",
      value: "Guarded",
      detail: isLoading ? "Syncing API state" : "Queries are read-only; deletes need confirmation",
      icon: ShieldCheckIcon,
      badge: status
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => (
        <Card className="@container/card bg-gradient-to-t from-muted/40 to-card shadow-xs" key={card.label}>
          <CardHeader>
            <CardDescription>{card.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.value}
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
              Local PostgreSQL
            </div>
            <div className="text-muted-foreground">{card.detail}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
