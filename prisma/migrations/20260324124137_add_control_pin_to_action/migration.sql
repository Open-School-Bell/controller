-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Action" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "data" TEXT NOT NULL DEFAULT '',
    "controlPin" TEXT NOT NULL DEFAULT '',
    "audioId" TEXT,
    CONSTRAINT "Action_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "Audio" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Action" ("action", "audioId", "data", "icon", "id", "name") SELECT "action", "audioId", "data", "icon", "id", "name" FROM "Action";
DROP TABLE "Action";
ALTER TABLE "new_Action" RENAME TO "Action";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
