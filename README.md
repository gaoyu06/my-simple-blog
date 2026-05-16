# Blog

A Halo-inspired, self-hostable personal blog built with Next.js 16 (App Router, RSC, Server Actions),
Prisma 7, Auth.js v5, Tailwind v4 (OKLCH theme), TipTap, and an OpenAI-compatible AI layer.

## Highlights

- **CMS-like content model** — Articles, Categories, Tags, Comments (nested), Custom Pages, Navigation, Media. Multiple authors with role-based access (Admin / Author / Guest).
- **Rich editing** — TipTap rich-text + Markdown round-trip, full keyboard toolbar, character count, draft autosave on save, revision history.
- **AI built in** — Configure any OpenAI-compatible provider (OpenAI, Azure, Together, Groq, OpenRouter, etc.). LLM features: one-click summary, inline grammar/style checking with red squiggle highlights, side-panel chat with current-article context, and code-style cover-image generation.
- **Cover image studio** — API mode (OpenAI image), HTML/JSX template mode rendered via Satori → PNG, and a code-drawing path for LLM-generated styles. Generated covers are saved under `public/uploads/covers/`.
- **Guest registration & moderation** — Optional approval queue for new accounts and comments, configurable from the admin UI.
- **Customization** — Edit the top navigation, create custom Markdown/HTML pages at arbitrary routes, inject custom CSS, and adjust the primary OKLCH color from the dashboard.
- **In-site search** — SQLite FTS5 with snippet highlighting; abstracted so swapping to PostgreSQL tsvector is a configuration change.
- **Performance** — Server Components by default, OKLCH design tokens, optimized fonts via `next/font`, image domain allowlist via `next/image`, ISR via `revalidatePath` on writes.
- **Editorial design system** — Default theme uses Fraunces + Hanken Grotesk, warm cinnamon primary, hairline borders, OKLCH-derived hover glow, no AI-template clichés.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions) + React 19 |
| Styling | Tailwind v4 + OKLCH tokens + Radix primitives |
| Database | SQLite by default (Prisma 7 + `@prisma/adapter-better-sqlite3`); swap to PostgreSQL via `prisma.config.ts` and `DATABASE_URL` |
| Auth | Auth.js v5 (Credentials) with role/status guard |
| Editor | TipTap + tiptap-markdown |
| Markdown render | unified + remark/rehype + Shiki |
| AI | `openai` SDK + custom base URL |
| Cover render | satori + `@resvg/resvg-js` |

## Getting started

```bash
pnpm install
pnpm setup                 # interactive: pick SQLite or PostgreSQL,
                           # writes .env, updates schema, applies migrations
pnpm dev
```

`pnpm setup` prompts:
1. **Database backend** — SQLite (default, zero-config) or PostgreSQL.
2. **Connection URL** — for PG only. Default: `postgresql://postgres:postgres@localhost:5432/blog`.

Non-interactive (CI / Docker):

```bash
pnpm setup --db sqlite
pnpm setup --db postgres --url "postgresql://user:pass@host:5432/blog?schema=public"
```

The script writes `.env` (generating `AUTH_SECRET` and `ENCRYPTION_KEY` if
absent), flips `provider` in `prisma/schema.prisma`, regenerates the Prisma
Client, and applies migrations. When switching SQLite→PG it moves the
SQLite-only migrations to `prisma/migrations.sqlite-backup/` and generates a
fresh PG init migration.

After `pnpm dev`, open <http://localhost:3000>. The first visit redirects to
`/setup` — a short in-app wizard that captures site identity, the admin
account, and (optionally) an AI provider. Once finished it sets
`setup.completed = true` and subsequent visits go straight to the site or
`/admin`.

> CI/Docker bootstrap can also call `pnpm db:seed` to create the admin from
> `INIT_ADMIN_EMAIL` / `INIT_ADMIN_PASSWORD`; either path sets the same
> "initialized" state.

### Environment variables

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Prisma datasource URL. Default: `file:./dev.db`. |
| `AUTH_SECRET` | Auth.js JWT secret. Generate with `openssl rand -base64 32`. |
| `AUTH_URL` / `APP_URL` | Canonical app URL. |
| `ENCRYPTION_KEY` | Base64 32-byte key used to encrypt AI provider API keys at rest. |
| `INIT_ADMIN_EMAIL` / `INIT_ADMIN_PASSWORD` / `INIT_ADMIN_NAME` | Seed admin account. |

### Configuring AI

After signing in as admin, open **Admin → AI** and add a provider:

- **LLM** — Base URL `https://api.openai.com/v1`, model `gpt-4o-mini`, paste API key.
- **Image** — Base URL `https://api.openai.com/v1`, model `gpt-image-1` (or similar), paste API key.

Anything OpenAI-compatible works: OpenRouter, Together, Groq, vLLM, etc.

## Switching the database later

Just re-run `pnpm setup`. It detects the current provider, backs up
SQLite-only migrations when moving to PG, and runs the right Prisma commands.
The runtime adapter in `src/lib/db.ts` is chosen automatically from
`DATABASE_URL` — `postgres://` / `postgresql://` use `@prisma/adapter-pg`,
otherwise `@prisma/adapter-better-sqlite3`.

> The search adapter falls back to `LIKE` automatically when FTS isn't
> available on the active backend. For better PG search, add a follow-up
> migration that creates a `tsvector` generated column with a `GIN` index.

## Self-hosting

A `Dockerfile` is included. With Docker:

```bash
docker build -t blog .
docker run -p 3000:3000 \
  -e DATABASE_URL=file:/data/dev.db \
  -e AUTH_SECRET=$(openssl rand -base64 32) \
  -e ENCRYPTION_KEY=$(openssl rand -base64 32) \
  -v $(pwd)/data:/data \
  -v $(pwd)/public/uploads:/app/public/uploads \
  blog
```

## Folder map

```
src/
  app/                public + admin routes (App Router)
    (site)/           public site (header/footer wrapped)
    (auth)/           login + register
    admin/            dashboard + CRUD
    api/              streaming AI + cover generation
  components/
    ui/               design-system primitives
    site/             header / footer / account menu
    editor/           TipTap + tags + AI panel
    admin/            admin forms & tables
    comments/         comment section + form + item
  lib/                db, auth, crypto, markdown, settings, AI client, cover render
  server/             server actions + read-only queries
prisma/
  schema.prisma       Prisma schema
  migrations/         Prisma + raw FTS5 migrations
  seed.ts             initial seed
```

## License

MIT.
