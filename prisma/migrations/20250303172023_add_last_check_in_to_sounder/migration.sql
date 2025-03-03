-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sounder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enrolled" BOOLEAN NOT NULL DEFAULT false,
    "ringerPin" INTEGER NOT NULL DEFAULT 0,
    "lastCheckIn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Sounder" ("enrolled", "id", "key", "name", "ringerPin") SELECT "enrolled", "id", "key", "name", "ringerPin" FROM "Sounder";
DROP TABLE "Sounder";
ALTER TABLE "new_Sounder" RENAME TO "Sounder";
CREATE UNIQUE INDEX "Sounder_key_key" ON "Sounder"("key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
