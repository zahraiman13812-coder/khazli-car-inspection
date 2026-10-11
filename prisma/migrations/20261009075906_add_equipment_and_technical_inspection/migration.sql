-- CreateTable
CREATE TABLE "TechnicalInspectionPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "videoTitle" TEXT NOT NULL,
    "videoUrl" TEXT,
    "galleryTitle" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TechnicalInspectionImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "title" TEXT,
    "caption" TEXT,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TechnicalInspectionImage_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "TechnicalInspectionPage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TechnicalInspectionImage_pageId_idx" ON "TechnicalInspectionImage"("pageId");

-- CreateIndex
CREATE INDEX "TechnicalInspectionImage_pageId_isActive_sortOrder_idx" ON "TechnicalInspectionImage"("pageId", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "TechnicalInspectionImage_createdAt_idx" ON "TechnicalInspectionImage"("createdAt");
