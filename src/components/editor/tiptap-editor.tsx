"use client";

import { toast } from "sonner";

import * as React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { Slice } from "@tiptap/pm/model";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CharacterCount from "@tiptap/extension-character-count";
import { Markdown } from "tiptap-markdown";
import { common, createLowlight } from "lowlight";
import { Grammar, setGrammarHints, clearGrammarHints, type GrammarHint } from "@/components/editor/grammar-extension";
import {
  Bold,
  Italic,
  Strikethrough,
  Code as CodeIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Pilcrow,
} from "lucide-react";

import { cn } from "@/lib/cn";

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
}

export interface TiptapEditorHandle {
  insertAtCursor: (text: string) => void;
  getSelection: () => string;
  focus: () => void;
  getMarkdown: () => string;
  setGrammarHints: (hints: GrammarHint[]) => void;
  clearGrammarHints: () => void;
}

export const TiptapEditor = React.forwardRef<TiptapEditorHandle, TiptapEditorProps>(
  ({ value, onChange, placeholder, className, editorClassName }, ref) => {
    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({ codeBlock: false }),
        Link.configure({
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer nofollow ugc", target: "_blank" },
        }),
        Image.configure({ inline: false, allowBase64: false }),
        Placeholder.configure({ placeholder: placeholder ?? "开始写作…" }),
        Typography,
        CodeBlockLowlight.configure({ lowlight }),
        TaskList,
        TaskItem.configure({ nested: true }),
        CharacterCount.configure({}),
        Grammar,
        Markdown.configure({
          html: false,
          tightLists: true,
          linkify: true,
          breaks: false,
          transformPastedText: true,
          transformCopiedText: true,
        }),
      ],
      content: value,
      editorProps: {
        attributes: {
          class: cn(
            "prose max-w-none px-2 py-3 focus:outline-none min-h-[60vh]",
            editorClassName,
          ),
        },
      },
      onUpdate: ({ editor }) => {
        const md = (editor.storage as unknown as { markdown: { getMarkdown(): string } }).markdown.getMarkdown();
        onChange(md);
      },
    });

    React.useImperativeHandle(
      ref,
      () => ({
        insertAtCursor: (text: string) => {
          if (!editor || !text) return;
          const markdown = editor.storage as unknown as {
            markdown: { parser: { parse(value: string): { content: Slice["content"] } } };
          };
          const parsed = markdown.markdown.parser.parse(text);
          editor.view.dispatch(
            editor.state.tr
              .replaceSelection(new Slice(parsed.content, 0, 0))
              .scrollIntoView(),
          );
        },
        getSelection: () => {
          if (!editor) return "";
          const { from, to } = editor.state.selection;
          return editor.state.doc.textBetween(from, to, " ");
        },
        focus: () => editor?.chain().focus().run(),
        getMarkdown: () =>
          editor
            ? (editor.storage as unknown as { markdown: { getMarkdown(): string } }).markdown.getMarkdown()
            : "",
        setGrammarHints: (hints) => {
          if (editor?.view) setGrammarHints(editor.view, hints);
        },
        clearGrammarHints: () => {
          if (editor?.view) clearGrammarHints(editor.view);
        },
      }),
      [editor],
    );

    React.useEffect(() => {
      if (!editor) return;
      const current = (editor.storage as unknown as { markdown: { getMarkdown(): string } }).markdown.getMarkdown();
      if (value && value !== current) {
        editor.commands.setContent(value, { emitUpdate: false });
      }
    }, [editor, value]);

    if (!editor) return null;

    return (
      <div className={cn("rounded-[var(--radius-lg)] bg-[var(--color-elevated)] shadow-[var(--shadow-card)]", className)}>
        <Toolbar editor={editor} />
        <EditorContent editor={editor} />
        <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border)] px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--color-foreground-subtle)]">
          <span>{editor.storage.characterCount?.characters() ?? 0} chars</span>
          <span>{editor.storage.characterCount?.words() ?? 0} words</span>
        </div>
      </div>
    );
  },
);
TiptapEditor.displayName = "TiptapEditor";

type EditorType = NonNullable<ReturnType<typeof useEditor>>;

function ToolbarButton({
  active,
  onClick,
  disabled,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-foreground-muted)]",
        "transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]",
        "disabled:cursor-not-allowed disabled:opacity-40",
        active && "bg-[var(--color-primary-subtle)] text-[var(--color-primary)] shadow-[inset_0_0_0_1px_oklch(from_var(--color-primary)_l_c_h/0.30)]",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-[var(--color-border)]" />;
}

function Toolbar({ editor }: { editor: EditorType }) {
  const imageInput = React.useRef<HTMLInputElement>(null);
  const promptUrl = (current?: string) => {
    if (typeof window === "undefined") return null;
    return window.prompt("链接地址", current ?? "https://") ?? null;
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--color-border)] px-2 py-1.5">
      <ToolbarButton label="撤销" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton label="重做" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <Divider />
      <ToolbarButton
        label="正文"
        active={editor.isActive("paragraph")}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <Pilcrow className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="标题 1"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="标题 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="标题 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <Divider />
      <ToolbarButton
        label="加粗"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="斜体"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="删除线"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="行内代码"
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <CodeIcon className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <Divider />
      <ToolbarButton
        label="无序列表"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="有序列表"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="任务列表"
        active={editor.isActive("taskList")}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      >
        <ListChecks className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="引用"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton
        label="代码块"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <CodeIcon className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton label="分隔线" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <Divider />
      <ToolbarButton
        label="链接"
        active={editor.isActive("link")}
        onClick={() => {
          const url = promptUrl(editor.getAttributes("link").href as string | undefined);
          if (url === null) return;
          if (url === "") editor.chain().focus().unsetLink().run();
          else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }}
      >
        <LinkIcon className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <ToolbarButton label="插入图片" onClick={() => imageInput.current?.click()}>
        <ImageIcon className="h-4 w-4" aria-hidden />
      </ToolbarButton>
      <input
        ref={imageInput}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          const body = new FormData();
          body.append("file", file);
          const res = await fetch("/api/uploads", { method: "POST", body });
          const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
          if (res.ok && data.url) editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
          else toast.error(data.error ?? `图片上传失败（${res.status}）`);
        }}
      />
    </div>
  );
}
