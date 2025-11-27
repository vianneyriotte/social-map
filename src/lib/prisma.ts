import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;
  const databaseUrl = process.env.DATABASE_URL;
  const dbProvider = process.env.DB_PROVIDER; // Force provider during build

  // MariaDB/MySQL: Use adapter
  if (dbProvider === "mariadb" || databaseUrl?.startsWith("mysql://") || databaseUrl?.startsWith("mariadb://")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

    // Default config for build time (won't actually connect)
    let adapterConfig = {
      host: "localhost",
      port: 3306,
      user: "root",
      password: "",
      database: "db",
      connectionLimit: 5,
    };

    // Parse DATABASE_URL if available
    if (databaseUrl) {
      const normalizedUrl = databaseUrl.replace("mariadb://", "mysql://");
      const url = new URL(normalizedUrl);
      adapterConfig = {
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1),
        connectionLimit: 5,
      };
    }

    const adapter = new PrismaMariaDb(adapterConfig);
    return new PrismaClient({ adapter });
  }

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
