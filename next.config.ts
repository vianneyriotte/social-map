import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "better-sqlite3",
    "@libsql/client",
    "libsql",
    "@prisma/adapter-libsql",
    "@prisma/adapter-better-sqlite3",
  ],
};

export default nextConfig;
