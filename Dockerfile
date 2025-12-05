# syntax=docker/dockerfile:1

# ================================
# Base image with Node.js 20 (Debian for native module compatibility)
# ================================
FROM node:20-slim AS base

# Install dependencies for native modules (including build tools for lightningcss)
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# ================================
# Dependencies installation
# ================================
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
COPY prisma.config.mariadb.ts ./

# Install all dependencies (including devDependencies for build)
# Install native binaries for linux-x64 (Tailwind CSS v4 requires these)
RUN npm ci && npm install lightningcss-linux-x64-gnu @tailwindcss/oxide-linux-x64-gnu

# Generate Prisma client for MariaDB
RUN npx prisma generate --config=prisma.config.mariadb.ts

# ================================
# Build stage
# ================================
FROM base AS builder
WORKDIR /app

# Build arguments for Next.js public environment variables
# These are baked into the client bundle at build time
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Debug: Log build arguments
RUN echo "============================================="
RUN echo "[Docker Build] NEXT_PUBLIC_APP_URL = $NEXT_PUBLIC_APP_URL"
RUN echo "============================================="

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Copy prisma config for MariaDB
COPY prisma.config.mariadb.ts ./

# Generate Prisma client for MariaDB
RUN npx prisma generate --config=prisma.config.mariadb.ts

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
ENV DB_PROVIDER=mariadb
ENV BETTER_AUTH_SECRET=build-time-secret-not-used-in-production
RUN echo "[Docker Build] Starting Next.js build with NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL"
RUN npm run build:mariadb

# ================================
# Production runner
# ================================
FROM node:20-slim AS runner
WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files for runtime adapter
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.mariadb.ts ./

# Copy full node_modules for Prisma CLI (db push)
COPY --from=builder /app/node_modules ./prisma-cli/node_modules
COPY --from=builder /app/package.json ./prisma-cli/
COPY --from=builder /app/prisma ./prisma-cli/prisma
COPY --from=builder /app/prisma.config.mariadb.ts ./prisma-cli/

# Copy entrypoint script
COPY --from=builder --chown=nextjs:nodejs /app/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application with db sync
CMD ["./docker-entrypoint.sh"]
