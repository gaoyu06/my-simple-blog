/**
 * One-off importer for legacy Halo blog data exported under `data/`.
 *
 * Reads `data/index.json` for metadata + each entry's markdown body,
 * copies `data/images/<slug>/` into `public/uploads/posts/<slug>/`, and
 * rewrites `../images/<slug>/foo` references to `/uploads/posts/<slug>/foo`.
 *
 * Idempotent: re-running skips entries whose slug already exists.
 *
 * Run from project root:
 *   pnpm tsx scripts/import-legacy-data.ts
 */

import fs from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import slugify from "slugify";

const DATA_DIR = path.resolve(process.cwd(), "data");
const UPLOADS_BASE = path.resolve(process.cwd(), "public", "uploads", "posts");

interface IndexEntry {
  type: "post" | "page";
  slug: string;
  title: string;
  date?: string;
  categories: string[];
  tags: string[];
  cover?: string;
  draft?: boolean;
  file: string;
}

interface IndexFile {
  entries: IndexEntry[];
}

function toSlug(name: string): string {
  const s = slugify(name, { lower: true, strict: true, locale: "en" });
  return s || name.trim().toLowerCase();
}

function stripFrontmatter(raw: string): string {
  if (!raw.startsWith("---")) return raw;
  const end = raw.indexOf("\n---", 3);
  if (end < 0) return raw;
  return raw.slice(end + 4).replace(/^\r?\n/, "");
}

function rewriteImagePaths(md: string): string {
  return md.replace(
    /\.\.\/images\/([^/)\s"']+)\/([^)\s"']+)/g,
    "/uploads/posts/$1/$2",
  );
}

function rewriteCover(cover?: string): string | null {
  if (!cover) return null;
  return cover.replace(/^\.\.\/images\//, "/uploads/posts/");
}

async function copyImagesFor(slug: string): Promise<boolean> {
  const src = path.join(DATA_DIR, "images", slug);
  const dst = path.join(UPLOADS_BASE, slug);
  try {
    await fs.cp(src, dst, { recursive: true });
    return true;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw e;
  }
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

  const index: IndexFile = JSON.parse(
    await fs.readFile(path.join(DATA_DIR, "index.json"), "utf8"),
  );

  const admin = await db.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
  });
  if (!admin) {
    throw new Error("No ADMIN user found — finish /setup before importing.");
  }

  const stats = {
    posts: 0,
    pages: 0,
    skippedPosts: 0,
    skippedPages: 0,
    imageDirs: 0,
    missingImages: [] as string[],
  };

  for (const e of index.entries) {
    const raw = await fs.readFile(path.join(DATA_DIR, e.file), "utf8");
    const body = rewriteImagePaths(stripFrontmatter(raw));
    const cover = rewriteCover(e.cover);

    const copied = await copyImagesFor(e.slug);
    if (copied) stats.imageDirs++;
    else if (e.cover) stats.missingImages.push(e.slug);

    if (e.type === "post") {
      const existing = await db.article.findUnique({ where: { slug: e.slug } });
      if (existing) {
        stats.skippedPosts++;
        console.log(`  skip post: ${e.slug} (exists)`);
        continue;
      }

      let categoryId: string | undefined;
      if (e.categories?.length) {
        const name = e.categories[0];
        const cat = await db.category.upsert({
          where: { slug: toSlug(name) },
          update: {},
          create: { slug: toSlug(name), name },
        });
        categoryId = cat.id;
      }

      const tagRecords = await Promise.all(
        (e.tags ?? []).map((t) =>
          db.tag.upsert({
            where: { slug: toSlug(t) },
            update: {},
            create: { slug: toSlug(t), name: t },
          }),
        ),
      );

      await db.article.create({
        data: {
          slug: e.slug,
          title: e.title,
          contentMd: body,
          coverImage: cover,
          status: e.draft ? "DRAFT" : "PUBLISHED",
          publishedAt: e.date && !e.draft ? new Date(e.date) : null,
          authorId: admin.id,
          categoryId,
          tags: { create: tagRecords.map((t) => ({ tagId: t.id })) },
        },
      });
      stats.posts++;
      console.log(`  + post: ${e.slug}  ${e.title}`);
    } else if (e.type === "page") {
      const existing = await db.page.findUnique({ where: { slug: e.slug } });
      if (existing) {
        stats.skippedPages++;
        console.log(`  skip page: ${e.slug} (exists)`);
        continue;
      }

      await db.page.create({
        data: {
          slug: e.slug,
          title: e.title,
          content: body,
          contentType: "MARKDOWN",
          published: !e.draft,
        },
      });
      stats.pages++;
      console.log(`  + page: ${e.slug}  ${e.title}`);
    }
  }

  console.log("");
  console.log(
    `Done. Imported ${stats.posts} posts, ${stats.pages} pages, copied ${stats.imageDirs} image dirs.`,
  );
  console.log(
    `Skipped ${stats.skippedPosts} posts and ${stats.skippedPages} pages already present.`,
  );
  if (stats.missingImages.length) {
    console.log(
      `Entries with no image dir found (cover still rewritten, may 404): ${stats.missingImages.join(", ")}`,
    );
  }

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
