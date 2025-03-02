-- CreateTable
CREATE TABLE "Sounder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ZoneSounder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sounderId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    CONSTRAINT "ZoneSounder_sounderId_fkey" FOREIGN KEY ("sounderId") REFERENCES "Sounder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ZoneSounder_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zoneId" TEXT NOT NULL,
    "dayTypeId" TEXT NOT NULL,
    "audioId" TEXT NOT NULL,
    CONSTRAINT "Schedule_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Schedule_dayTypeId_fkey" FOREIGN KEY ("dayTypeId") REFERENCES "DayType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Schedule_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "Audio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DayType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DayTypeAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "dayTypeId" TEXT NOT NULL,
    CONSTRAINT "DayTypeAssignment_dayTypeId_fkey" FOREIGN KEY ("dayTypeId") REFERENCES "DayType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Audio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "fileName" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Sounder_key_key" ON "Sounder"("key");
