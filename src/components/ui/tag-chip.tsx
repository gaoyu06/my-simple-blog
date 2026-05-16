import * as React from "react";
import { Hash } from "lucide-react";
import { cn } from "@/lib/cn";

export interface TagChipProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  name: string;
  count?: number;
}

export const TagChip = React.forwardRef<HTMLAnchorElement, TagChipProps>(
  ({ name, count, className, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium no-underline",
        "bg-[var(--color-surface)] text-[var(--color-foreground-muted)]",
        "shadow-[inset_0_0_0_1px_var(--color-border)]",
        "transition-[box-shadow,color,background-color] duration-200 ease-[var(--ease-out-soft)]",
        "hover:text-[var(--color-foreground)] hover:bg-[var(--color-elevated)]",
        "hover:shadow-[inset_0_0_0_1px_oklch(from_var(--color-border-strong)_l_c_h/0.90)]",
        className,
      )}
      {...props}
    >
      <Hash className="h-3 w-3 opacity-60 transition-opacity group-hover:opacity-100" aria-hidden />
      <span>{name}</span>
      {typeof count === "number" ? (
        <span className="ml-0.5 rounded-full bg-[var(--color-muted)] px-1.5 py-px text-[10px] tabular-nums text-[var(--color-foreground-subtle)]">
          {count}
        </span>
      ) : null}
    </a>
  ),
);
TagChip.displayName = "TagChip";
