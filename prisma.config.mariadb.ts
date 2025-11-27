import "dotenv/config";
import { defineConfig } from "prisma/config";

// Normalize mariadb:// to mysql:// for Prisma CLI
const databaseUrl = (process.env.DATABASE_URL || "").replace(
  "mariadb://",
  "mysql://"
);

export default defineConfig({
  schema: "prisma/schema.mysql.prisma",
  migrations: {
    path: "prisma/migrations-mysql",
  },
  datasource: {
    url: databaseUrl,
  },
});
