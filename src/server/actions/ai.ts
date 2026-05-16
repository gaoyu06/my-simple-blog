"use server";

import { z } from "zod";

import { auth } from "@/lib/auth";
import { canWriteArticles } from "@/lib/permissions";
import { chat } from "@/lib/ai/chat";

type AIResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function summarizeContent(content: string, opts: { language?: string } = {}): Promise<AIResult<string>> {
  const session = await auth();
  if (!canWriteArticles(session)) return { ok: false, error: "Not authorized." };
  if (!content.trim()) return { ok: false, error: "Content is empty." };
  try {
    const lang = opts.language ?? "the same language as the input";
    const summary = await chat(
      [
        {
          role: "system",
          content:
            "You are an editorial assistant. Produce a single-sentence summary (max 220 characters) of the given markdown article. Output only the sentence. No quotes, no markdown formatting.",
        },
        {
          role: "user",
          content: `Write the summary in ${lang}.\n\nArticle:\n\n${content.slice(0, 12000)}`,
        },
      ],
      { temperature: 0.3, maxTokens: 200 },
    );
    return { ok: true, data: summary.trim().replace(/^"|"$/g, "") };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "AI request failed." };
  }
}

const grammarIssue = z.object({
  type: z.enum(["grammar", "spelling", "clarity", "style"]),
  message: z.string(),
  snippet: z.string(),
  suggestion: z.string().optional(),
});

const grammarSchema = z.object({
  issues: z.array(grammarIssue),
});

export type GrammarIssue = z.infer<typeof grammarIssue>;

export async function checkGrammar(content: string): Promise<AIResult<GrammarIssue[]>> {
  const session = await auth();
  if (!canWriteArticles(session)) return { ok: false, error: "Not authorized." };
  if (!content.trim()) return { ok: true, data: [] };
  try {
    const raw = await chat(
      [
        {
          role: "system",
          content: [
            "You are an editorial proofreader.",
            'Return a JSON object with exactly this shape: {"issues":[{"type":"grammar"|"spelling"|"clarity"|"style","message":"...","snippet":"exact substring from the input","suggestion":"..."}]}.',
            "The snippet MUST be a verbatim contiguous substring of the input — case and punctuation preserved — so it can be highlighted by string match.",
            "Be conservative. Report at most 20 of the most important issues. If nothing is wrong, return an empty issues array.",
            "Do not include any prose outside the JSON object.",
          ].join(" "),
        },
        { role: "user", content: content.slice(0, 16000) },
      ],
      { temperature: 0, maxTokens: 1500 },
    );

    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = grammarSchema.safeParse(JSON.parse(cleaned));
    if (!parsed.success) return { ok: false, error: "Could not parse grammar response." };
    const valid = parsed.data.issues.filter((i) => content.includes(i.snippet));
    return { ok: true, data: valid };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "AI request failed." };
  }
}
