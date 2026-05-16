import * as React from "react";
import { cn } from "@/lib/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-[var(--radius-md)] bg-[var(--color-surface)] px-3 py-2 text-sm",
        "text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-subtle)]",
        "shadow-[var(--shadow-input)]",
        "transition-[box-shadow] duration-200 ease-[var(--ease-out-soft)]",
        "focus-visible:outline-none focus-visible:shadow-[var(--shadow-input-focus)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--color-foreground)]",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
