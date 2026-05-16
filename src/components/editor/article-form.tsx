"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Save,
  Trash2,
  Eye,
  Sparkles,
  SpellCheck,
  X,
  Settings2,
  Image as ImageIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { TiptapEditor, type TiptapEditorHandle } from "@/components/editor/tiptap-editor";
import { TagsInput } from "@/components/editor/tags-input";
import { AiChatPanel } from "@/components/editor/ai-chat-panel";
import type { GrammarHint } from "@/components/editor/grammar-extension";
import { useT } from "@/components/i18n-provider";
import { localizedName } from "@/lib/taxonomy-i18n";
import { makeSlug } from "@/lib/markdown";
import { saveArticle, deleteArticle } from "@/server/actions/articles";
import { summarizeContent, checkGrammar } from "@/server/actions/ai";

type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface ArticleFormInitial {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  contentMd: string;
  status: ArticleStatus;
  categoryId: string | null;
  tags: string[];
  coverImage: string | null;
  coverStyleId: string | null;
  featured: boolean;
  allowComment: boolean;
}

export interface ArticleFormProps {
  initial: ArticleFormInitial;
  categories: Array<{ id: string; name: string; slug: string; translations: string | null }>;
  coverStyles: Array<{ id: string; name: string }>;
}

const STATUS_TONE: Record<ArticleStatus, string> = {
  PUBLISHED: "text-[var(--color-success)]",
  ARCHIVED: "text-[var(--color-foreground-muted)]",
  DRAFT: "text-[var(--color-warning)]",
};

export function ArticleForm({ initial, categories, coverStyles }: ArticleFormProps) {
  const router = useRouter();
  const { t, locale } = useT();
  const editorRef = React.useRef<TiptapEditorHandle | null>(null);
  const [title, setTitle] = React.useState(initial.title);
  const [slug, setSlug] = React.useState(initial.slug);
  const [slugTouched, setSlugTouched] = React.useState(Boolean(initial.id));
  const [summary, setSummary] = React.useState(initial.summary);
  const [contentMd, setContentMd] = React.useState(initial.contentMd);
  const [status, setStatus] = React.useState<ArticleStatus>(initial.status);
  const [categoryId, setCategoryId] = React.useState<string | null>(initial.categoryId);
  const [tags, setTags] = React.useState<string[]>(initial.tags);
  const [coverImage, setCoverImage] = React.useState(initial.coverImage ?? "");
  const [coverStyleId, setCoverStyleId] = React.useState<string | null>(initial.coverStyleId);
  const [featured, setFeatured] = React.useState(initial.featured);
  const [allowComment, setAllowComment] = React.useState(initial.allowComment);
  const [saving, setSaving] = React.useState(false);
  const [summarizing, setSummarizing] = React.useState(false);
  const [checking, setChecking] = React.useState(false);
  const [generatingCover, setGeneratingCover] = React.useState(false);
  const [grammarIssues, setGrammarIssues] = React.useState<GrammarHint[]>([]);
  const [aiOpen, setAiOpen] = React.useState(true);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  React.useEffect(() => {
    if (!slugTouched) setSlug(makeSlug(title));
  }, [title, slugTouched]);

  async function onSave(targetStatus?: ArticleStatus) {
    setSaving(true);
    const payload = {
      id: initial.id,
      title,
      slug: slug || makeSlug(title),
      summary: summary || null,
      contentMd,
      status: targetStatus ?? status,
      categoryId: categoryId ?? null,
      tags,
      coverImage: coverImage || null,
      coverStyleId: coverStyleId ?? null,
      featured,
      allowComment,
    };
    const result = await saveArticle(payload);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setStatus(payload.status);
    toast.success(payload.status === "PUBLISHED" ? t("editor.toast.published") : t("editor.toast.saved"));
    if (!initial.id) {
      router.replace(`/admin/articles/${result.id}/edit`);
      router.refresh();
    } else {
      router.refresh();
    }
  }

  async function onDelete() {
    if (!initial.id) return;
    if (!confirm(t("editor.confirm.delete"))) return;
    const result = await deleteArticle(initial.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(t("common.deleted"));
    router.push("/admin/articles");
    router.refresh();
  }

  async function onGenerateSummary() {
    setSummarizing(true);
    const result = await summarizeContent(contentMd);
    setSummarizing(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setSummary(result.data);
    toast.success(t("editor.toast.summary"));
  }

  async function onCheckGrammar() {
    setChecking(true);
    const result = await checkGrammar(contentMd);
    setChecking(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setGrammarIssues(result.data);
    editorRef.current?.setGrammarHints(result.data);
    toast.success(
      result.data.length === 1
        ? t("editor.toast.grammarFoundOne")
        : t("editor.toast.grammarFound", { count: result.data.length }),
    );
  }

  function dismissGrammar() {
    setGrammarIssues([]);
    editorRef.current?.clearGrammarHints();
  }

  async function onGenerateCover() {
    if (!initial.id || !coverStyleId) return;
    setGeneratingCover(true);
    try {
      const response = await fetch("/api/cover/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          styleId: coverStyleId,
          title: title || "Untitled",
          summary,
          articleId: initial.id,
        }),
      });
      if (!response.ok) {
        toast.error(t("editor.toast.coverFailed"));
        return;
      }
      const data = (await response.json()) as { url?: string; error?: string };
      if (data.url) {
        setCoverImage(data.url);
        toast.success(t("editor.toast.coverGenerated"));
      } else {
        toast.error(data.error ?? t("editor.toast.coverFailed"));
      }
    } finally {
      setGeneratingCover(false);
    }
  }

  function buildContextSystemPrompt() {
    return [
      "You are an editorial assistant helping the user write a blog post.",
      `Current title: ${title || "(untitled)"}.`,
      `Current draft (markdown):\n"""\n${contentMd.slice(0, 8000)}\n"""`,
      "Respond concisely and in the same language as the draft.",
    ].join("\n");
  }

  return (
    <div
      className={
        aiOpen
          ? "grid h-[calc(100dvh-3.5rem)] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]"
          : "grid h-[calc(100dvh-3.5rem)] grid-cols-1"
      }
    >
      {/* === Composer column === */}
      <div className="flex min-w-0 flex-col overflow-hidden">
        {/* Sticky action bar */}
        <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-[var(--color-border)] bg-[oklch(from_var(--color-canvas)_l_c_h/0.92)] px-6 py-2.5 backdrop-blur-md">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider shadow-[inset_0_0_0_1px_var(--color-border)] ${STATUS_TONE[status]}`}
          >
            {t(`status.${status}`)}
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSave()}
              loading={saving}
              leftIcon={<Save className="h-3.5 w-3.5" />}
            >
              {t("editor.action.save")}
            </Button>
            {status !== "PUBLISHED" ? (
              <Button size="sm" onClick={() => onSave("PUBLISHED")} loading={saving}>
                {t("editor.action.publish")}
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => onSave("DRAFT")} loading={saving}>
                {t("editor.action.unpublish")}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSettingsOpen(true)}
              leftIcon={<Settings2 className="h-3.5 w-3.5" />}
            >
              {t("editor.action.settings")}
            </Button>
            {initial.id ? (
              <Button size="sm" variant="ghost" asChild leftIcon={<Eye className="h-3.5 w-3.5" />}>
                <a href={`/articles/${slug}`} target="_blank" rel="noopener noreferrer">
                  {t("editor.action.preview")}
                </a>
              </Button>
            ) : null}
            {!aiOpen ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAiOpen(true)}
                leftIcon={<Sparkles className="h-3.5 w-3.5" />}
              >
                {t("editor.action.ai")}
              </Button>
            ) : null}
          </div>
        </div>

        {/* Scrollable composer area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-3xl flex-col gap-4 px-8 py-8">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("editor.titlePlaceholder")}
              className="h-auto border-0 bg-transparent px-0 py-2 text-4xl font-serif font-medium tracking-tight shadow-none focus-visible:shadow-none"
            />
            <div className="flex items-start gap-2">
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder={t("editor.summaryPlaceholder")}
                className="min-h-[44px] resize-none border-0 bg-transparent px-0 text-[15px] leading-relaxed text-[var(--color-foreground-muted)] shadow-none focus-visible:shadow-none"
                rows={2}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onGenerateSummary}
                loading={summarizing}
                leftIcon={<Sparkles className="h-3.5 w-3.5" />}
                className="shrink-0"
              >
                {t("editor.aiSummary")}
              </Button>
            </div>
            <div className="flex items-center gap-2 border-y border-[var(--color-border)] py-1.5 -mx-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCheckGrammar}
                loading={checking}
                leftIcon={<SpellCheck className="h-3.5 w-3.5" />}
              >
                {t("editor.grammarCheck")}
              </Button>
              {grammarIssues.length > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={dismissGrammar}
                  leftIcon={<X className="h-3.5 w-3.5" />}
                >
                  {t("editor.clearN", { count: grammarIssues.length })}
                </Button>
              ) : null}
            </div>
            <TiptapEditor
              ref={editorRef}
              value={contentMd}
              onChange={setContentMd}
              placeholder={t("editor.startWriting")}
              editorClassName="px-2 py-3 min-h-[55vh]"
              className="border-0 bg-transparent shadow-none"
            />
            {grammarIssues.length > 0 ? (
              <Card>
                <CardContent className="py-4">
                  <p className="eyebrow mb-3">{t("editor.suggestions")}</p>
                  <ul className="flex flex-col gap-3">
                    {grammarIssues.map((issue, i) => (
                      <li key={i} className="text-sm">
                        <p className="text-xs uppercase tracking-wider text-[var(--color-foreground-subtle)]">
                          {issue.type}
                        </p>
                        <p className="mt-0.5">
                          <span className="rounded bg-[oklch(from_var(--color-danger)_l_c_h/0.10)] px-1 text-[var(--color-foreground)]">
                            {issue.snippet}
                          </span>
                        </p>
                        <p className="mt-1 text-[var(--color-foreground-muted)]">{issue.message}</p>
                        {issue.suggestion ? (
                          <p className="mt-1 text-[var(--color-success)]">→ {issue.suggestion}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>

      {/* === AI column === */}
      {aiOpen ? (
        <aside className="relative hidden border-l border-[var(--color-border)] bg-[var(--color-surface)] lg:flex lg:flex-col">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--color-primary)]" aria-hidden />
              <span className="text-sm font-medium">{t("editor.aiAssist")}</span>
            </div>
            <button
              type="button"
              onClick={() => setAiOpen(false)}
              className="rounded-md p-1 text-[var(--color-foreground-subtle)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              aria-label={t("editor.aiPanelClose")}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <AiChatPanel
              buildContextSystemPrompt={buildContextSystemPrompt}
              getEditorSelection={() => editorRef.current?.getSelection() ?? ""}
              onInsert={(text) => editorRef.current?.insertAtCursor(text)}
            />
          </div>
        </aside>
      ) : null}

      {/* === Settings dialog === */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("editor.settings.title")}</DialogTitle>
            <DialogDescription>{t("editor.settings.desc")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="slug">{t("editor.settings.slug")}</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                placeholder="my-article"
              />
              <p className="text-xs text-[var(--color-foreground-subtle)]">
                {t("editor.settings.slugHint", { path: `/articles/${slug || "your-slug"}` })}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="category">{t("editor.settings.category")}</Label>
                <Select
                  value={categoryId ?? "__none"}
                  onValueChange={(v) => setCategoryId(v === "__none" ? null : v)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder={t("editor.settings.categoryNone")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">{t("editor.settings.categoryNone")}</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {localizedName(c, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tags">{t("editor.settings.tags")}</Label>
                <TagsInput value={tags} onChange={setTags} placeholder={t("editor.settings.tagsPlaceholder")} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cover">{t("editor.settings.cover")}</Label>
              <Input
                id="cover"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder={t("editor.settings.coverPlaceholder")}
              />
              {coverStyles.length > 0 ? (
                <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
                  <Select
                    value={coverStyleId ?? "__none"}
                    onValueChange={(v) => setCoverStyleId(v === "__none" ? null : v)}
                  >
                    <SelectTrigger id="coverStyle">
                      <SelectValue placeholder={t("editor.settings.coverStyle")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">{t("editor.settings.categoryNone")}</SelectItem>
                      {coverStyles.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={!initial.id || !coverStyleId}
                    loading={generatingCover}
                    onClick={onGenerateCover}
                    leftIcon={<ImageIcon className="h-3.5 w-3.5" />}
                  >
                    {t("editor.settings.coverGenerate")}
                  </Button>
                </div>
              ) : null}
              {!initial.id ? (
                <p className="text-xs text-[var(--color-foreground-subtle)]">
                  {t("editor.settings.coverStyleAuto")}
                </p>
              ) : null}
            </div>

            <fieldset className="flex flex-col gap-2 rounded-[var(--radius-md)] bg-[var(--color-surface)] p-3 shadow-[inset_0_0_0_1px_var(--color-border)]">
              <legend className="px-1 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-foreground-muted)]">
                {t("editor.settings.flags")}
              </legend>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 accent-[var(--color-primary)]"
                />
                {t("editor.settings.featured")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={allowComment}
                  onChange={(e) => setAllowComment(e.target.checked)}
                  className="h-4 w-4 accent-[var(--color-primary)]"
                />
                {t("editor.settings.allowComment")}
              </label>
            </fieldset>
          </div>
          <DialogFooter className="sm:justify-between">
            {initial.id ? (
              <Button
                type="button"
                variant="ghost"
                onClick={onDelete}
                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                className="text-[var(--color-danger)] hover:bg-[oklch(from_var(--color-danger)_l_c_h/0.08)]"
              >
                {t("editor.settings.deleteArticle")}
              </Button>
            ) : (
              <span />
            )}
            <DialogClose asChild>
              <Button type="button">{t("common.done")}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
