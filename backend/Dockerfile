FROM oven/bun:1-alpine AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY src ./src
COPY tsconfig.json drizzle.config.ts ./

ENV NODE_ENV=production

RUN bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --target bun-linux-x64 \
    --outfile server \
    src/index.ts

# ─── Production image ────────────────────────────────────
FROM oven/bun:1-alpine

WORKDIR /app

COPY --from=build /app/server server
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/src/migrations src/migrations
COPY --from=build /app/drizzle.config.ts drizzle.config.ts
COPY --from=build /app/package.json package.json

ENV NODE_ENV=production

EXPOSE 3000

CMD ["./server"]
