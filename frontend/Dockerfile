# Stage 1: Build frontend
FROM oven/bun:1 AS builder

WORKDIR /app/frontend
COPY frontend/package.json frontend/bun.lock* ./
RUN bun install --frozen-lockfile

# Copy backend types (needed for @backend/* path alias)
COPY backend/src /app/backend/src

# Copy frontend source
COPY frontend/ .
RUN bunx vite build

# Stage 2: Serve with Caddy
FROM caddy:2-alpine

COPY --from=builder /app/frontend/dist /srv
COPY frontend/Caddyfile /etc/caddy/Caddyfile
