import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Trend = "up" | "down" | "neutral";

/**
 * StatCard — KPI tile used across the owner and nominee dashboards.
 */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend = "neutral",
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  trend?: Trend;
  className?: string;
}) {
  const trendClass =
    trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground";

  return (
    <div
      className={cn(
        "glass group relative overflow-hidden rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-1",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
        style={{ background: "var(--gradient-primary)" }}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p className="font-display text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <span className="grid size-10 place-items-center rounded-xl bg-primary/12 text-primary">
          <Icon className="size-5" />
        </span>
      </div>
      {hint && <p className={cn("relative mt-3 text-xs", trendClass)}>{hint}</p>}
    </div>
  );
}
