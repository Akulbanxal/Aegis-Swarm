-- CreateTable
CREATE TABLE "Protocol" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "name" TEXT,
    "registeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "protocolId" TEXT NOT NULL,
    "targetContract" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 0,
    "attackVector" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "defenseActionTaken" TEXT NOT NULL DEFAULT 'NO_ACTION',
    "defenseTxHash" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    CONSTRAINT "Incident_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "Protocol" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Protocol_address_key" ON "Protocol"("address");
