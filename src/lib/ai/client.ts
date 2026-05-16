import "server-only";
import OpenAI from "openai";

import { db } from "@/lib/db";
import { decryptSecret } from "@/lib/crypto";

export type AIKind = "LLM" | "IMAGE";

export interface AIProviderConfig {
  id: string;
  name: string;
  kind: AIKind;
  baseUrl: string;
  model: string;
  apiKey: string;
  extra: Record<string, unknown>;
}

async function findDefault(kind: AIKind): Promise<AIProviderConfig | null> {
  const provider =
    (await db.aIProvider.findFirst({
      where: { kind, enabled: true, isDefault: true },
    })) ??
    (await db.aIProvider.findFirst({
      where: { kind, enabled: true },
      orderBy: { updatedAt: "desc" },
    }));
  if (!provider) return null;
  return {
    id: provider.id,
    name: provider.name,
    kind: provider.kind,
    baseUrl: provider.baseUrl,
    model: provider.model,
    apiKey: decryptSecret(provider.apiKeyEnc),
    extra: provider.extra ? safeParse(provider.extra) : {},
  };
}

function safeParse(s: string): Record<string, unknown> {
  try {
    const v = JSON.parse(s);
    return typeof v === "object" && v ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export async function getProvider(kind: AIKind, idOverride?: string | null): Promise<AIProviderConfig | null> {
  if (idOverride) {
    const provider = await db.aIProvider.findUnique({ where: { id: idOverride } });
    if (!provider || !provider.enabled) return null;
    return {
      id: provider.id,
      name: provider.name,
      kind: provider.kind,
      baseUrl: provider.baseUrl,
      model: provider.model,
      apiKey: decryptSecret(provider.apiKeyEnc),
      extra: provider.extra ? safeParse(provider.extra) : {},
    };
  }
  return findDefault(kind);
}

export function createClient(provider: AIProviderConfig): OpenAI {
  return new OpenAI({
    apiKey: provider.apiKey,
    baseURL: provider.baseUrl || undefined,
  });
}
