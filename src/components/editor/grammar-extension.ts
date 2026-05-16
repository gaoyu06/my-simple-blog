import { Extension } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { EditorState, Transaction } from "@tiptap/pm/state";
import { Decoration, DecorationSet, type EditorView } from "@tiptap/pm/view";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

export interface GrammarHint {
  snippet: string;
  message: string;
  type: "grammar" | "spelling" | "clarity" | "style";
  suggestion?: string;
}

interface GrammarMark {
  from: number;
  to: number;
  hint: GrammarHint;
}

export const grammarKey = new PluginKey<GrammarMark[]>("grammar");

export const Grammar = Extension.create({
  name: "grammar",
  addProseMirrorPlugins() {
    return [
      new Plugin<GrammarMark[]>({
        key: grammarKey,
        state: {
          init: () => [],
          apply(tr: Transaction, prev) {
            const meta = tr.getMeta(grammarKey);
            if (meta !== undefined) return meta as GrammarMark[];
            if (tr.docChanged) return [];
            return prev;
          },
        },
        props: {
          decorations(state: EditorState) {
            const marks = grammarKey.getState(state) ?? [];
            if (marks.length === 0) return null;
            return DecorationSet.create(
              state.doc,
              marks.map((m) =>
                Decoration.inline(m.from, m.to, {
                  class: "grammar-mark",
                  title: `${m.hint.type}: ${m.hint.message}`,
                  "data-grammar-type": m.hint.type,
                }),
              ),
            );
          },
        },
      }),
    ];
  },
});

function findRanges(doc: ProseMirrorNode, hints: GrammarHint[]): GrammarMark[] {
  const marks: GrammarMark[] = [];
  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return;
    const text = node.text;
    for (const hint of hints) {
      if (!hint.snippet) continue;
      let idx = text.indexOf(hint.snippet);
      while (idx !== -1) {
        marks.push({
          from: pos + idx,
          to: pos + idx + hint.snippet.length,
          hint,
        });
        idx = text.indexOf(hint.snippet, idx + Math.max(1, hint.snippet.length));
      }
    }
  });
  return marks;
}

export function setGrammarHints(view: EditorView, hints: GrammarHint[]) {
  const marks = findRanges(view.state.doc, hints);
  view.dispatch(view.state.tr.setMeta(grammarKey, marks));
}

export function clearGrammarHints(view: EditorView) {
  view.dispatch(view.state.tr.setMeta(grammarKey, []));
}
