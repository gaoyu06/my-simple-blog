import "server-only";

type FontKey = `${string}:${number}:${"normal" | "italic"}`;

const cache = new Map<FontKey, ArrayBuffer>();

export async function loadGoogleFont(
  family: string,
  weight = 500,
  style: "normal" | "italic" = "normal",
): Promise<ArrayBuffer> {
  const key: FontKey = `${family}:${weight}:${style}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const italicTag = style === "italic" ? "ital,wght@1," : "wght@";
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:${italicTag}${weight}&display=swap`;

  const css = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
  }).then((r) => r.text());

  const match = css.match(/src:\s*url\(([^)]+)\)\s*format\('([^']+)'\)/);
  if (!match) throw new Error(`Could not locate font src for ${family} ${weight} ${style}`);
  const data = await fetch(match[1]).then((r) => r.arrayBuffer());
  cache.set(key, data);
  return data;
}
