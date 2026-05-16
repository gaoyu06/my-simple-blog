FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN pnpm install --frozen-lockfile --prod=false

FROM deps AS build
COPY . .
RUN pnpm exec prisma generate
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_URL=file:/data/dev.db

RUN apk add --no-cache libstdc++ \
    && addgroup -S blog -g 1001 \
    && adduser -S -D -h /app -u 1001 -G blog blog \
    && mkdir -p /data /app/public/uploads/covers \
    && chown -R blog:blog /data /app

COPY --from=build --chown=blog:blog /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build --chown=blog:blog /app/node_modules ./node_modules
COPY --from=build --chown=blog:blog /app/.next ./.next
COPY --from=build --chown=blog:blog /app/public ./public
COPY --from=build --chown=blog:blog /app/prisma ./prisma
COPY --from=build --chown=blog:blog /app/prisma.config.ts ./prisma.config.ts
COPY --from=build --chown=blog:blog /app/src ./src
COPY --from=build --chown=blog:blog /app/next.config.ts ./next.config.ts
COPY --from=build --chown=blog:blog /app/tsconfig.json ./tsconfig.json

USER blog
EXPOSE 3000
VOLUME ["/data", "/app/public/uploads"]

# On startup: run pending migrations, then start the server.
CMD ["sh", "-c", "node ./node_modules/prisma/build/index.js migrate deploy && node ./node_modules/next/dist/bin/next start -p $PORT -H $HOSTNAME"]
