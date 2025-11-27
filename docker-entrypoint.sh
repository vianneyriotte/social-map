#!/bin/sh
set -e

echo "[Entrypoint] Running Prisma db push to sync database schema..."
node node_modules/prisma/build/index.js db push --config=prisma.config.mariadb.ts --skip-generate --accept-data-loss

echo "[Entrypoint] Starting Next.js server..."
exec node server.js
