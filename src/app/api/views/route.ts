import { db } from "@/lib/db";

export const runtime = "nodejs";

// Article pages are static, so views are counted by a beacon from the browser.
export async function POST(request: Request) {
  const id = (await request.text()).slice(0, 64);
  if (!id) return new Response(null, { status: 400 });
  await db.article
    .update({ where: { id, status: "PUBLISHED" }, data: { viewCount: { increment: 1 } } })
    .catch(() => null);
  return new Response(null, { status: 204 });
}
