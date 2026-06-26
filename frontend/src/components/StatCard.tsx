import { Group, Text } from "@mantine/core";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "cyan" | "green" | "violet";
};

export function StatCard({ label, value, icon: Icon, tone = "cyan" }: StatCardProps) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <Group justify="space-between" align="center">
        <Text className="stat-label">{label}</Text>
        <span className="stat-icon">
          <Icon size={18} strokeWidth={1.8} />
        </span>
      </Group>
      <Text className="stat-value">{value}</Text>
    </div>
  );
}
