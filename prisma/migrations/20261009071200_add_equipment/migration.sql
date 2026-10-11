-- CreateTable
CREATE TABLE "EquipmentItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "EquipmentItem_isActive_sortOrder_idx" ON "EquipmentItem"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "EquipmentItem_createdAt_idx" ON "EquipmentItem"("createdAt");
