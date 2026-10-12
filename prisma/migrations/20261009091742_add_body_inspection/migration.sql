-- CreateTable
CREATE TABLE "BodyInspectionPage" (
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
CREATE TABLE "BodyInspectionImage" (
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
    CONSTRAINT "BodyInspectionImage_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "BodyInspectionPage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "BodyInspectionImage_pageId_idx" ON "BodyInspectionImage"("pageId");

-- CreateIndex
CREATE INDEX "BodyInspectionImage_pageId_isActive_sortOrder_idx" ON "BodyInspectionImage"("pageId", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "BodyInspectionImage_createdAt_idx" ON "BodyInspectionImage"("createdAt");
