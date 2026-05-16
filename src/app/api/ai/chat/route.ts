import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { canWriteArticles } from "@/lib/permissions";
import { chatStream, type ChatMessage } from "@/lib/ai/chat";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string(),
      }),
    )
    .min(1),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(8192).optional(),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  if (!canWriteArticles(session)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch (e) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of chatStream(parsed.messages as ChatMessage[], {
          temperature: parsed.temperature,
          maxTokens: parsed.maxTokens,
        })) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "AI stream failed.";
        controller.enqueue(encoder.encode(`\n\n[error] ${msg}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
}
