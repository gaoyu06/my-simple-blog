import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary-subtle)] text-[var(--color-primary)] shadow-[inset_0_0_0_1px_oklch(from_var(--color-primary)_l_c_h/0.20)]",
        secondary:
          "bg-[var(--color-muted)] text-[var(--color-foreground-muted)] shadow-[inset_0_0_0_1px_var(--color-border)]",
        outline:
          "text-[var(--color-foreground)] shadow-[inset_0_0_0_1px_var(--color-border-strong)]",
        success:
          "bg-[oklch(from_var(--color-success)_l_c_h/0.12)] text-[var(--color-success)] shadow-[inset_0_0_0_1px_oklch(from_var(--color-success)_l_c_h/0.25)]",
        warning:
          "bg-[oklch(from_var(--color-warning)_l_c_h/0.15)] text-[var(--color-warning)] shadow-[inset_0_0_0_1px_oklch(from_var(--color-warning)_l_c_h/0.25)]",
        danger:
          "bg-[oklch(from_var(--color-danger)_l_c_h/0.12)] text-[var(--color-danger)] shadow-[inset_0_0_0_1px_oklch(from_var(--color-danger)_l_c_h/0.25)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  ),
);
Badge.displayName = "Badge";

export { badgeVariants };
