import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.mysql.prisma",
  migrations: {
    path: "prisma/migrations-mysql",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
