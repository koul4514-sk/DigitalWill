import { Shield } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Logo — single source of truth for brand presentation.
 * `compact` renders only the mark (used by the collapsed sidebar).
 */
export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="relative grid size-9 shrink-0 place-items-center rounded-xl bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]">
        <Shield className="size-4.5 text-primary-foreground" strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="font-display text-[15px] leading-tight font-semibold tracking-tight">
          Digital
          <span className="text-gradient">Will</span>
        </span>
      )}
    </span>
  );
}
