import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";

const COVERS_DIR = path.join(process.cwd(), "public", "uploads", "covers");

export async function saveCoverPng(buffer: Buffer): Promise<string> {
  await fs.mkdir(COVERS_DIR, { recursive: true });
  const filename = `${nanoid(12)}.png`;
  await fs.writeFile(path.join(COVERS_DIR, filename), buffer);
  return `/uploads/covers/${filename}`;
}

export async function downloadImageToLocal(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.mkdir(COVERS_DIR, { recursive: true });
  const ct = response.headers.get("content-type") ?? "";
  const ext = ct.includes("jpeg") || ct.includes("jpg") ? "jpg" : ct.includes("webp") ? "webp" : "png";
  const filename = `${nanoid(12)}.${ext}`;
  await fs.writeFile(path.join(COVERS_DIR, filename), buffer);
  return `/uploads/covers/${filename}`;
}
