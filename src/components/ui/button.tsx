"use client";

import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/cn";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-[var(--radius-md)] font-medium select-none",
    "transition-[box-shadow,transform,background-color,color] duration-200 ease-[var(--ease-out-soft)]",
    "focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canvas)]",
    "disabled:pointer-events-none disabled:opacity-50",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--color-primary)] text-[var(--color-primary-fg)]",
          "shadow-[var(--shadow-btn)]",
          "hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-btn-hover)]",
          "active:bg-[var(--color-primary-active)] active:translate-y-px",
        ].join(" "),
        secondary: [
          "bg-[var(--color-elevated)] text-[var(--color-foreground)]",
          "shadow-[inset_0_0_0_1px_var(--color-border),0_1px_2px_oklch(0_0_0/0.03)]",
          "hover:bg-[var(--color-surface)] hover:shadow-[inset_0_0_0_1px_var(--color-border-strong),0_1px_2px_oklch(0_0_0/0.03)]",
          "active:translate-y-px",
        ].join(" "),
        outline: [
          "bg-transparent text-[var(--color-foreground)]",
          "shadow-[inset_0_0_0_1px_var(--color-border-strong)]",
          "hover:bg-[var(--color-muted)]",
          "hover:shadow-[inset_0_0_0_1px_oklch(from_var(--color-primary)_l_c_h/0.25)]",
          "active:translate-y-px",
        ].join(" "),
        ghost: [
          "bg-transparent text-[var(--color-foreground)]",
          "hover:bg-[var(--color-muted)]",
        ].join(" "),
        destructive: [
          "bg-[var(--color-danger)] text-white",
          "shadow-[inset_0_1px_0_oklch(1_0_0/0.20),inset_0_0_0_1px_oklch(0_0_0/0.10)]",
          "hover:brightness-110",
          "hover:shadow-[inset_0_1px_0_oklch(1_0_0/0.20),inset_0_0_0_1px_oklch(0_0_0/0.10),0_4px_14px_-6px_oklch(from_var(--color-danger)_l_c_h/0.25)]",
          "active:translate-y-px",
        ].join(" "),
        link: [
          "text-[var(--color-foreground)] underline-offset-4",
          "underline decoration-1 decoration-[var(--color-border-strong)]",
          "hover:decoration-[var(--color-primary)]",
        ].join(" "),
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-[15px]",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild,
      loading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const classes = cn(buttonVariants({ variant, size }), className);
    const leftSlot = loading ? (
      <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
    ) : leftIcon ? (
      <span className="-ml-0.5 inline-flex items-center" aria-hidden>
        {leftIcon}
      </span>
    ) : null;
    const rightSlot =
      !loading && rightIcon ? (
        <span className="-mr-0.5 inline-flex items-center" aria-hidden>
          {rightIcon}
        </span>
      ) : null;

    if (asChild) {
      return (
        <Slot ref={ref} className={classes} {...props}>
          {leftSlot}
          <Slottable>{children}</Slottable>
          {rightSlot}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        type={(props as { type?: "button" | "submit" | "reset" }).type ?? "button"}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {leftSlot}
        {children}
        {rightSlot}
      </button>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
