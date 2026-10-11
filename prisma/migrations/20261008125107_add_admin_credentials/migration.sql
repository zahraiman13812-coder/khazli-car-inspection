-- CreateTable
CREATE TABLE "AdminCredential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "passwordHash" TEXT NOT NULL,
    "sessionVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
