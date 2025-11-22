-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActionButton" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "ledPin" INTEGER NOT NULL DEFAULT 0,
    "buttonPin" INTEGER NOT NULL DEFAULT 0,
    "holdDuration" INTEGER NOT NULL DEFAULT 0,
    "cancelDuration" INTEGER NOT NULL DEFAULT 0,
    "actionId" TEXT NOT NULL,
    CONSTRAINT "ActionButton_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ActionButton" ("actionId", "id", "key", "name") SELECT "actionId", "id", "key", "name" FROM "ActionButton";
DROP TABLE "ActionButton";
ALTER TABLE "new_ActionButton" RENAME TO "ActionButton";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
