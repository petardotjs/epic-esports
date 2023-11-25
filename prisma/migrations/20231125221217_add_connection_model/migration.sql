-- CreateTable
CREATE TABLE "Connection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "providerId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Connection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Connection_userId_key" ON "Connection"("userId");

-- CreateIndex
CREATE INDEX "Connection_userId_idx" ON "Connection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Connection_providerId_provider_key" ON "Connection"("providerId", "provider");
