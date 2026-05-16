import "server-only";
import { getProvider, createClient } from "@/lib/ai/client";

export interface ImageOptions {
  size?: "1024x1024" | "1792x1024" | "1024x1792" | "1200x630";
  quality?: "standard" | "hd";
  providerId?: string | null;
  n?: number;
}

export async function generateImage(prompt: string, options: ImageOptions = {}): Promise<string[]> {
  const provider = await getProvider("IMAGE", options.providerId);
  if (!provider) throw new Error("No image provider configured.");
  const client = createClient(provider);
  const response = await client.images.generate({
    model: provider.model,
    prompt,
    n: options.n ?? 1,
    size: (options.size ?? "1024x1024") as "1024x1024",
    response_format: "url",
  });
  const data = response.data ?? [];
  return data.map((d) => d.url ?? "").filter(Boolean);
}
