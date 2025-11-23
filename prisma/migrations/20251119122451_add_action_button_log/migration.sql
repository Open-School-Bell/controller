-- CreateTable
CREATE TABLE "ActionButtonLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "actionButtonId" TEXT NOT NULL,
    CONSTRAINT "ActionButtonLog_actionButtonId_fkey" FOREIGN KEY ("actionButtonId") REFERENCES "ActionButton" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
