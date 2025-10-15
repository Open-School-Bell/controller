-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Audio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "ringerWire" TEXT NOT NULL DEFAULT '',
    "duration" INTEGER NOT NULL DEFAULT 0,
    "audioContainer" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Audio" ("fileName", "id", "name", "ringerWire") SELECT "fileName", "id", "name", "ringerWire" FROM "Audio";
DROP TABLE "Audio";
ALTER TABLE "new_Audio" RENAME TO "Audio";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
