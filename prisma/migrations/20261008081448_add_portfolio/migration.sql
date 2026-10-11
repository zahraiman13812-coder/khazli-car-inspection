-- CreateTable
CREATE TABLE "PortfolioItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "vehicle" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'full',
    "description" TEXT NOT NULL,
    "beforeImageUrl" TEXT,
    "afterImageUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "PortfolioItem_isActive_sortOrder_idx" ON "PortfolioItem"("isActive", "sortOrder");
