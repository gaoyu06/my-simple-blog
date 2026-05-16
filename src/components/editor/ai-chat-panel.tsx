"use client";

import * as React from "react";
import { Send, Sparkles, Copy, ArrowDownToLine } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/cn";

export interface AiChatMessage {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
}

interface AiChatPanelProps {
  buildContextSystemPrompt: () => string;
  getEditorSelection: () => string;
  onInsert: (text: string) => void;
}

export function AiChatPanel({ buildContextSystemPrompt, getEditorSelection, onInsert }: AiChatPanelProps) {
  const [messages, setMessages] = React.useState<AiChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [includeSelection, setIncludeSelection] = React.useState(true);
  const [streaming, setStreaming] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  async function send() {
    const userInput = input.trim();
    if (!userInput || streaming) return;
    const selection = includeSelection ? getEditorSelection() : "";

    const userMessage: AiChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userInput,
    };
    const assistantId = crypto.randomUUID();
    const assistantMessage: AiChatMessage = { id: assistantId, role: "assistant", content: "" };

    const history = [...messages, userMessage];
    setMessages([...history, assistantMessage]);
    setInput("");
    setStreaming(true);

    const systemPrompt =
      buildContextSystemPrompt() +
      (selection ? `\n\nThe user has selected this excerpt:\n"""\n${selection}\n"""` : "");

    const payload = {
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map((m) => ({ role: m.role, content: m.content })),
      ],
    };

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        const error = await response.text();
        throw new Error(error || `HTTP ${response.status}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: buffer } : m)),
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Chat failed.";
      toast.error(msg);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied.");
  }

  return (
    <div className="flex h-full min-h-[480px] flex-col rounded-[var(--radius-lg)] bg-[var(--color-elevated)] shadow-[var(--shadow-card)]">
      <header className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
        <Sparkles className="h-4 w-4 text-[var(--color-primary)]" aria-hidden />
        <h3 className="text-sm font-medium">AI assist</h3>
      </header>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-[var(--color-foreground-muted)]">
            <p>Ask anything about your draft, brainstorm, or get a critique.</p>
            <p className="mt-2 text-xs text-[var(--color-foreground-subtle)]">
              The current article is included as context.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {messages.map((m) => (
              <li
                key={m.id}
                className={cn(
                  "flex flex-col gap-1.5",
                  m.role === "user" ? "items-end" : "items-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[90%] rounded-[var(--radius-md)] px-3 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-[var(--color-primary-subtle)] text-[var(--color-foreground)] shadow-[inset_0_0_0_1px_oklch(from_var(--color-primary)_l_c_h/0.20)]"
                      : "bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-[inset_0_0_0_1px_var(--color-border)]",
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.content || (streaming ? "…" : "")}</p>
                </div>
                {m.role === "assistant" && m.content ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => copy(m.content)}
                      className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[11px] text-[var(--color-foreground-subtle)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                    >
                      <Copy className="h-3 w-3" aria-hidden /> Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => onInsert(m.content)}
                      className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[11px] text-[var(--color-foreground-subtle)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                    >
                      <ArrowDownToLine className="h-3 w-3" aria-hidden /> Insert
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
      <footer className="flex flex-col gap-2 border-t border-[var(--color-border)] p-3">
        <label className="flex items-center gap-2 text-xs text-[var(--color-foreground-muted)]">
          <input
            type="checkbox"
            checked={includeSelection}
            onChange={(e) => setIncludeSelection(e.target.checked)}
            className="h-3 w-3 accent-[var(--color-primary)]"
          />
          Include current selection
        </label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask, brainstorm, or critique…"
          rows={3}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--color-foreground-subtle)]">⌘ + Enter to send</span>
          <Button
            size="sm"
            onClick={send}
            disabled={!input.trim() || streaming}
            loading={streaming}
            rightIcon={<Send className="h-3.5 w-3.5" />}
          >
            Send
          </Button>
        </div>
      </footer>
    </div>
  );
}
