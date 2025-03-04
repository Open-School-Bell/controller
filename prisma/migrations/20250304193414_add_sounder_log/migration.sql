-- CreateTable
CREATE TABLE "SounderLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "sounderId" TEXT NOT NULL,
    CONSTRAINT "SounderLog_sounderId_fkey" FOREIGN KEY ("sounderId") REFERENCES "Sounder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
