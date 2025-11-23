-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActionButton" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "ip" TEXT NOT NULL DEFAULT '',
    "enrolled" BOOLEAN NOT NULL DEFAULT false,
    "lastCheckIn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ledPin" INTEGER NOT NULL DEFAULT 0,
    "buttonPin" INTEGER NOT NULL DEFAULT 0,
    "holdDuration" INTEGER NOT NULL DEFAULT 0,
    "cancelDuration" INTEGER NOT NULL DEFAULT 0,
    "actionId" TEXT NOT NULL,
    "zoneId" TEXT,
    CONSTRAINT "ActionButton_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActionButton_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ActionButton" ("actionId", "buttonPin", "cancelDuration", "enrolled", "holdDuration", "id", "ip", "key", "lastCheckIn", "ledPin", "name") SELECT "actionId", "buttonPin", "cancelDuration", "enrolled", "holdDuration", "id", "ip", "key", "lastCheckIn", "ledPin", "name" FROM "ActionButton";
DROP TABLE "ActionButton";
ALTER TABLE "new_ActionButton" RENAME TO "ActionButton";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
