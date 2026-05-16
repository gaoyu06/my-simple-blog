"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagsInput({ value, onChange, placeholder, className }: TagsInputProps) {
  const [draft, setDraft] = React.useState("");

  function add(raw: string) {
    const tag = raw.trim();
    if (!tag) return;
    if (value.includes(tag)) return;
    onChange([...value, tag]);
  }

  function remove(t: string) {
    onChange(value.filter((v) => v !== t));
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
      setDraft("");
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-surface)] p-1.5 shadow-[var(--shadow-input)]", className)}>
      {value.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--color-primary)] shadow-[inset_0_0_0_1px_oklch(from_var(--color-primary)_l_c_h/0.25)]"
        >
          {t}
          <button
            type="button"
            onClick={() => remove(t)}
            className="rounded-full p-0.5 hover:bg-[oklch(from_var(--color-primary)_l_c_h/0.15)]"
            aria-label={`Remove tag ${t}`}
          >
            <X className="h-3 w-3" aria-hidden />
          </button>
        </span>
      ))}
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => {
          if (draft.trim()) {
            add(draft);
            setDraft("");
          }
        }}
        placeholder={value.length === 0 ? (placeholder ?? "Add tag, press Enter") : ""}
        className="h-7 min-w-[120px] flex-1 border-0 bg-transparent p-0 px-1 shadow-none focus-visible:shadow-none"
      />
    </div>
  );
}
