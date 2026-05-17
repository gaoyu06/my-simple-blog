import { stat, readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Serve files under /uploads/* directly from disk at request time.
 *
 * Next.js's built-in static handler scans public/ once at boot, so files
 * created after the server is running (covers generated from the editor,
 * imports run via scripts/) are never registered and get caught by the
 * (site)/[...slug] catch-all route instead. Routing this prefix through
 * a real handler keeps everything under /uploads/ working regardless of
 * when the file appeared.
 */

const UPLOADS_DIR = path.resolve(process.cwd(), "public", "uploads");

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await params;
  const rel = parts.join("/");
  const full = path.resolve(UPLOADS_DIR, rel);
  if (full !== UPLOADS_DIR && !full.startsWith(UPLOADS_DIR + path.sep)) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const stats = await stat(full);
    if (!stats.isFile()) return new Response("Not found", { status: 404 });
    const data = await readFile(full);
    const mime = MIME[path.extname(full).toLowerCase()] ?? "application/octet-stream";
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": mime,
        "Content-Length": String(stats.size),
        "Cache-Control": "public, max-age=86400, must-revalidate",
        "Last-Modified": stats.mtime.toUTCString(),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
