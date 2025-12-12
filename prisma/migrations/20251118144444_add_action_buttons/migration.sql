-- CreateTable
CREATE TABLE "ActionButton" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    CONSTRAINT "ActionButton_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
