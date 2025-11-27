import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl && tursoAuthToken) {
    // Production: Use Turso (libSQL)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSql } = require("@prisma/adapter-libsql");

    const adapter = new PrismaLibSql({
      url: tursoUrl,
      authToken: tursoAuthToken,
    });

    return new PrismaClient({ adapter });
  }

  // Development: Use SQLite
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require("path");

  const dbPath = path.join(process.cwd(), "dev.db");
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  return new PrismaClient({ adapter });
}

export function getDb(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = getDb();
export default prisma;
