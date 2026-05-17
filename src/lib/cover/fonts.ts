import "server-only";

const cache = new Map<string, ArrayBuffer>();

export async function loadGoogleFont(
  family: string,
  weight = 500,
  style: "normal" | "italic" = "normal",
  text?: string,
): Promise<ArrayBuffer> {
  const key = text
    ? `${family}:${weight}:${style}:text:${text}`
    : `${family}:${weight}:${style}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const italicTag = style === "italic" ? "ital,wght@1," : "wght@";
  const textParam = text ? `&text=${encodeURIComponent(text)}` : "";
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:${italicTag}${weight}&display=swap${textParam}`;

  const css = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
  }).then((r) => r.text());

  const match = css.match(/src:\s*url\(([^)]+)\)\s*format\('([^']+)'\)/);
  if (!match) throw new Error(`Could not locate font src for ${family} ${weight} ${style}`);
  const data = await fetch(match[1]).then((r) => r.arrayBuffer());
  cache.set(key, data);
  return data;
}
