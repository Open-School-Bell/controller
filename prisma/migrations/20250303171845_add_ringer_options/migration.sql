-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Audio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "ringerWire" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Audio" ("fileName", "id", "name") SELECT "fileName", "id", "name" FROM "Audio";
DROP TABLE "Audio";
ALTER TABLE "new_Audio" RENAME TO "Audio";
CREATE TABLE "new_Sounder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enrolled" BOOLEAN NOT NULL DEFAULT false,
    "ringerPin" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Sounder" ("enrolled", "id", "key", "name") SELECT "enrolled", "id", "key", "name" FROM "Sounder";
DROP TABLE "Sounder";
ALTER TABLE "new_Sounder" RENAME TO "Sounder";
CREATE UNIQUE INDEX "Sounder_key_key" ON "Sounder"("key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
