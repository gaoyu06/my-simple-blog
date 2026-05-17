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

function extractJsonObject(raw: string): unknown {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Some providers ignore response_format and wrap JSON in prose. Pull out
    // the first {...} block and try again.
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first >= 0 && last > first) {
      return JSON.parse(cleaned.slice(first, last + 1));
    }
    throw new Error("Response was not valid JSON");
  }
}

export async function checkGrammar(content: string): Promise<AIResult<GrammarIssue[]>> {
  const session = await auth();
  if (!canWriteArticles(session)) return { ok: false, error: "Not authorized." };
  if (!content.trim()) return { ok: true, data: [] };

  let raw = "";
  try {
    raw = await chat(
      [
        {
          role: "system",
          content: [
            "You are an editorial proofreader.",
            'Return a JSON object with exactly this shape: {"issues":[{"type":"grammar"|"spelling"|"clarity"|"style","message":"...","snippet":"exact substring from the input","suggestion":"..."}]}.',
            "The snippet MUST be a verbatim contiguous substring of the input — case and punctuation preserved — so it can be highlighted by string match.",
            "Escape every double-quote, backslash and newline inside string values so the output is strictly valid JSON.",
            "Be conservative. Report at most 20 of the most important issues. If nothing is wrong, return an empty issues array.",
            "Do not include any prose outside the JSON object.",
          ].join(" "),
        },
        { role: "user", content: content.slice(0, 16000) },
      ],
      { temperature: 0, maxTokens: 2000, json: true },
    );
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "AI request failed." };
  }

  let payload: unknown;
  try {
    payload = extractJsonObject(raw);
  } catch (e) {
    const snippet = raw.slice(0, 160).replace(/\s+/g, " ");
    return {
      ok: false,
      error: `${e instanceof Error ? e.message : "Parse failed"} — model said: ${snippet}${raw.length > 160 ? "…" : ""}`,
    };
  }

  const parsed = grammarSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: "Grammar response had the wrong shape." };
  const valid = parsed.data.issues.filter((i) => content.includes(i.snippet));
  return { ok: true, data: valid };
}
