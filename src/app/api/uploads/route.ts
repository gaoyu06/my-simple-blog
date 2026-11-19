import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import sharp from "sharp";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { canWriteArticles } from "@/lib/permissions";

export const runtime = "nodejs";

const MAX_BYTES = 15 * 1024 * 1024;
const MAX_WIDTH = 1920;

/** Upload an image, re-encode it as WebP, and record it in the media library. */
export async function POST(request: Request) {
  const session = await auth();
  if (!canWriteArticles(session)) {
    return NextResponse.json({ error: "没有权限" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "请选择图片文件" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "图片不能超过 15 MB" }, { status: 400 });
  }

  let output: { data: Buffer; info: sharp.OutputInfo };
  try {
    output = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    return NextResponse.json({ error: "无法读取这张图片" }, { status: 400 });
  }

  const now = new Date();
  const dir = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const filename = `${nanoid(12)}.webp`;
  const absDir = path.join(process.cwd(), "public", "uploads", "media", dir);
  await fs.mkdir(absDir, { recursive: true });
  await fs.writeFile(path.join(absDir, filename), output.data);

  const url = `/uploads/media/${dir}/${filename}`;
  await db.media.create({
    data: {
      filename: file.name,
      mimeType: "image/webp",
      size: output.info.size,
      path: url,
      width: output.info.width,
      height: output.info.height,
      uploaderId: session!.user.id,
    },
  });

  return NextResponse.json({ url, width: output.info.width, height: output.info.height });
}
