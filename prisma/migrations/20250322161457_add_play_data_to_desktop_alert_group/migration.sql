-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DesktopAlertGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "playData" TEXT NOT NULL DEFAULT '{}'
);
INSERT INTO "new_DesktopAlertGroup" ("id", "key", "name") SELECT "id", "key", "name" FROM "DesktopAlertGroup";
DROP TABLE "DesktopAlertGroup";
ALTER TABLE "new_DesktopAlertGroup" RENAME TO "DesktopAlertGroup";
CREATE UNIQUE INDEX "DesktopAlertGroup_key_key" ON "DesktopAlertGroup"("key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
