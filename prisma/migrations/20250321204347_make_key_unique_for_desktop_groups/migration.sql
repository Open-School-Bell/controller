/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `DesktopAlertGroup` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DesktopAlertGroup_key_key" ON "DesktopAlertGroup"("key");
