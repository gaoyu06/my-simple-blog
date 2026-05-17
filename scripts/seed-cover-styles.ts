/**
 * Seeds two preset CoverStyle records that mirror the built-in Satori
 * templates under src/lib/cover/templates/. Without these rows the
 * editor's "Generate cover" picker has nothing to offer.
 *
 * Idempotent: matches by the template key inside `source`, so re-running
 * won't create duplicates.
 *
 *   pnpm tsx scripts/seed-cover-styles.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

interface Preset {
  name: string;
  template: "minimal-gradient" | "editorial";
}

const PRESETS: Preset[] = [
  { name: "Minimal Gradient", template: "minimal-gradient" },
  { name: "Editorial", template: "editorial" },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

  let created = 0;
  let skipped = 0;

  for (const p of PRESETS) {
    const sourceJson = JSON.stringify({ kind: "satori", template: p.template });
    const existing = await db.coverStyle.findFirst({ where: { source: sourceJson } });
    if (existing) {
      skipped++;
      console.log(`  skip: ${p.name}  (already exists as ${existing.id})`);
      continue;
    }
    await db.coverStyle.create({
      data: {
        name: p.name,
        kind: "TEMPLATE",
        source: sourceJson,
        config: JSON.stringify({}),
      },
    });
    created++;
    console.log(`  + ${p.name}`);
  }

  console.log(`\nDone. Created ${created}, skipped ${skipped}.`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
