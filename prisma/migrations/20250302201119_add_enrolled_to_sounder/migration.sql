-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sounder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enrolled" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Sounder" ("id", "key", "name") SELECT "id", "key", "name" FROM "Sounder";
DROP TABLE "Sounder";
ALTER TABLE "new_Sounder" RENAME TO "Sounder";
CREATE UNIQUE INDEX "Sounder_key_key" ON "Sounder"("key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
