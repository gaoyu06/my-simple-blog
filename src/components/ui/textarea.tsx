import * as React from "react";
import { cn } from "@/lib/cn";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-[var(--radius-md)] bg-[var(--color-surface)] px-3 py-2 text-sm",
        "text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-subtle)]",
        "shadow-[var(--shadow-input)]",
        "transition-[box-shadow] duration-200 ease-[var(--ease-out-soft)]",
        "focus-visible:outline-none focus-visible:shadow-[var(--shadow-input-focus)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "resize-y",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
