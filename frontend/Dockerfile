# Stage 1: Build frontend
FROM oven/bun:1 AS builder

WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Stage 2: Serve with Caddy
FROM caddy:2-alpine

COPY --from=builder /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
