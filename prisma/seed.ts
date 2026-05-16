import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { SETTINGS } from "../src/lib/settings-keys";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = /^postgres(ql)?:\/\//i.test(url)
  ? new PrismaPg({ connectionString: url })
  : new PrismaBetterSqlite3({ url });
const db = new PrismaClient({ adapter });

async function seedSettings() {
  const defaults: Record<string, string> = {
    [SETTINGS.SITE_NAME]: JSON.stringify("My Blog"),
    [SETTINGS.SITE_DESCRIPTION]: JSON.stringify("A blog powered by Next.js."),
    [SETTINGS.SITE_LOGO]: JSON.stringify(""),
    [SETTINGS.SITE_FAVICON]: JSON.stringify(""),
    [SETTINGS.SITE_FOOTER]: JSON.stringify("Built with Next.js."),
    [SETTINGS.SITE_KEYWORDS]: JSON.stringify(["blog", "nextjs"]),
    [SETTINGS.REGISTRATION_OPEN]: JSON.stringify(true),
    [SETTINGS.REGISTRATION_NEEDS_APPROVAL]: JSON.stringify(false),
    [SETTINGS.COMMENT_NEEDS_APPROVAL]: JSON.stringify(false),
    [SETTINGS.COMMENT_ALLOW_ANONYMOUS]: JSON.stringify(true),
    [SETTINGS.THEME_DEFAULT_MODE]: JSON.stringify("system"),
    [SETTINGS.THEME_PRIMARY]: JSON.stringify("oklch(0.62 0.18 250)"),
    [SETTINGS.CUSTOM_CSS]: JSON.stringify(""),
    [SETTINGS.AI_LLM_DEFAULT]: JSON.stringify(""),
    [SETTINGS.AI_IMAGE_DEFAULT]: JSON.stringify(""),
    [SETTINGS.SEO_OG_IMAGE]: JSON.stringify(""),
  };

  for (const [key, value] of Object.entries(defaults)) {
    await db.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
}

async function seedAdmin() {
  const email = process.env.INIT_ADMIN_EMAIL ?? "admin@example.com";
  const name = process.env.INIT_ADMIN_NAME ?? "Admin";
  const password = process.env.INIT_ADMIN_PASSWORD ?? "admin123456";
  const userCount = await db.user.count();
  if (userCount > 0) return;
  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.create({
    data: {
      email,
      name,
      username: "admin",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log(`Created admin user: ${email}`);
}

async function seedCategories() {
  const count = await db.category.count();
  if (count > 0) return;
  await db.category.create({
    data: { slug: "general", name: "General", description: "Default category." },
  });
}

async function seedNav() {
  const count = await db.navItem.count();
  if (count > 0) return;
  const items = [
    { label: "Home", href: "/", position: 0 },
    { label: "Archive", href: "/archive", position: 1 },
    { label: "Categories", href: "/categories", position: 2 },
    { label: "Tags", href: "/tags", position: 3 },
  ];
  for (const item of items) {
    await db.navItem.create({ data: item });
  }
}

async function seedCoverStyles() {
  const count = await db.coverStyle.count();
  if (count > 0) return;

  await db.coverStyle.create({
    data: {
      name: "Minimal Gradient",
      description: "Clean gradient with title and subtitle.",
      kind: "TEMPLATE",
      source: JSON.stringify({
        kind: "satori",
        template: "minimal-gradient",
      }),
      config: JSON.stringify({
        width: 1200,
        height: 630,
        gradientFrom: "oklch(0.62 0.18 250)",
        gradientTo: "oklch(0.45 0.20 280)",
      }),
    },
  });

  await db.coverStyle.create({
    data: {
      name: "Editorial",
      description: "Magazine-style cover with large serif title.",
      kind: "TEMPLATE",
      source: JSON.stringify({
        kind: "satori",
        template: "editorial",
      }),
      config: JSON.stringify({
        width: 1200,
        height: 630,
        background: "oklch(0.18 0.02 250)",
        textColor: "oklch(0.95 0.01 90)",
      }),
    },
  });
}

async function seedWelcomePost() {
  const exists = await db.article.count();
  if (exists > 0) return;
  const admin = await db.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) return;
  const general = await db.category.findFirst({ where: { slug: "general" } });
  const md = `This is your first post. Edit or delete it from the **dashboard**.

## What you can do

- Write articles in Markdown or with the rich-text editor.
- Generate covers with AI or HTML templates.
- Use the LLM panel to brainstorm or check your grammar.
- Customize the top nav, theme, and add custom pages.

Have fun writing.
`;
  await db.article.create({
    data: {
      slug: "welcome",
      title: "Welcome to your blog",
      summary: "Your first post — feel free to edit or delete.",
      contentMd: md,
      status: "PUBLISHED",
      authorId: admin.id,
      categoryId: general?.id ?? null,
      publishedAt: new Date(),
      readingTime: 1,
    },
  });
}

async function main() {
  await seedSettings();
  await seedAdmin();
  await seedCategories();
  await seedNav();
  await seedCoverStyles();
  await seedWelcomePost();
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
