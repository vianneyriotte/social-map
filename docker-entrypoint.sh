#!/bin/sh
set -e

echo "[Entrypoint] Running Prisma db push to sync database schema..."
cd /app/prisma-cli && node node_modules/prisma/build/index.js db push --config=prisma.config.mariadb.ts --accept-data-loss

echo "[Entrypoint] Starting Next.js server..."
cd /app
exec node server.js
