import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * EmptyState — shown whenever a collection has no records yet.
 * Always pairs an explanation with the primary action that fixes it.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass flex flex-col items-center justify-center rounded-2xl px-6 py-14 text-center",
        className,
      )}
    >
      <span className="grid size-14 place-items-center rounded-2xl bg-primary/12 text-primary">
        <Icon className="size-6" />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
