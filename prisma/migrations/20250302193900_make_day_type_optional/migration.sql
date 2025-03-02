-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Schedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "time" TEXT NOT NULL,
    "weekDays" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "dayTypeId" TEXT,
    "audioId" TEXT NOT NULL,
    CONSTRAINT "Schedule_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Schedule_dayTypeId_fkey" FOREIGN KEY ("dayTypeId") REFERENCES "DayType" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Schedule_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "Audio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Schedule" ("audioId", "dayTypeId", "id", "time", "weekDays", "zoneId") SELECT "audioId", "dayTypeId", "id", "time", "weekDays", "zoneId" FROM "Schedule";
DROP TABLE "Schedule";
ALTER TABLE "new_Schedule" RENAME TO "Schedule";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
