-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "workAddress" TEXT,
    "workLatitude" REAL,
    "workLongitude" REAL,
    "avatarUrl" TEXT,
    "showOnMap" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_user" ("avatarUrl", "createdAt", "email", "emailVerified", "id", "image", "name", "updatedAt", "workAddress", "workLatitude", "workLongitude") SELECT "avatarUrl", "createdAt", "email", "emailVerified", "id", "image", "name", "updatedAt", "workAddress", "workLatitude", "workLongitude" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
