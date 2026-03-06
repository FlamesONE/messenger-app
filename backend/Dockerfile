FROM oven/bun:1-alpine AS install

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ─── Production image ────────────────────────────────────
FROM oven/bun:1-alpine

WORKDIR /app

COPY --from=install /app/node_modules node_modules
COPY package.json bun.lock ./
COPY src ./src
COPY tsconfig.json drizzle.config.ts ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["bun", "src/index.ts"]
