-- CreateTable
CREATE TABLE "AdminLoginGuard" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "failures" INTEGER NOT NULL DEFAULT 0,
    "windowStartedAt" DATETIME NOT NULL,
    "blockedUntil" DATETIME,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "AdminLoginGuard_blockedUntil_idx" ON "AdminLoginGuard"("blockedUntil");
