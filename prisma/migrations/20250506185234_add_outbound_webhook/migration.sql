-- CreateTable
CREATE TABLE "OutboundWebhook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "target" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "key" TEXT NOT NULL
);
