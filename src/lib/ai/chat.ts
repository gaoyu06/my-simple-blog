import "server-only";
import { getProvider, createClient } from "@/lib/ai/client";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  providerId?: string | null;
  json?: boolean;
}

export async function chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<string> {
  const provider = await getProvider("LLM", options.providerId);
  if (!provider) throw new Error("No LLM provider configured. Add one in /admin/ai.");
  const client = createClient(provider);
  const completion = await client.chat.completions.create({
    model: provider.model,
    messages,
    temperature: options.temperature ?? 0.6,
    max_tokens: options.maxTokens,
    ...(options.json ? { response_format: { type: "json_object" as const } } : {}),
  });
  return completion.choices[0]?.message?.content ?? "";
}

export async function* chatStream(
  messages: ChatMessage[],
  options: ChatOptions = {},
): AsyncGenerator<string, void, void> {
  const provider = await getProvider("LLM", options.providerId);
  if (!provider) throw new Error("No LLM provider configured.");
  const client = createClient(provider);
  const stream = await client.chat.completions.create({
    model: provider.model,
    messages,
    temperature: options.temperature ?? 0.6,
    max_tokens: options.maxTokens,
    stream: true,
  });
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}
