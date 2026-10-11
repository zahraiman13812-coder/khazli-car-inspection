-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "trackingCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dailyIdentityKey" TEXT,
    "activeSlotKey" TEXT,
    "serviceId" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "carBrand" TEXT NOT NULL,
    "carModel" TEXT NOT NULL,
    "carYear" TEXT,
    "note" TEXT,
    "washConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "source" TEXT NOT NULL DEFAULT 'customer',
    "cancelledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentBlock" (
    "id" TEXT NOT NULL,
    "blockKey" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "time" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppointmentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "fullName" TEXT,
    "phone" TEXT,
    "type" TEXT NOT NULL DEFAULT 'feedback',
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsappPhone" TEXT,
    "address" TEXT NOT NULL,
    "businessHours" TEXT NOT NULL,
    "instagramUrl" TEXT,
    "logoUrl" TEXT,
    "mapUrl" TEXT,
    "baladMapUrl" TEXT,
    "neshanMapUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "vehicle" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'full',
    "description" TEXT NOT NULL,
    "beforeImageUrl" TEXT,
    "afterImageUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EquipmentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicalInspectionPage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "videoTitle" TEXT NOT NULL,
    "videoUrl" TEXT,
    "galleryTitle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnicalInspectionPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicalInspectionImage" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "title" TEXT,
    "caption" TEXT,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnicalInspectionImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyInspectionPage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "videoTitle" TEXT NOT NULL,
    "videoUrl" TEXT,
    "galleryTitle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BodyInspectionPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyInspectionImage" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "title" TEXT,
    "caption" TEXT,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BodyInspectionImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminLoginGuard" (
    "key" TEXT NOT NULL,
    "failures" INTEGER NOT NULL DEFAULT 0,
    "windowStartedAt" TIMESTAMP(3) NOT NULL,
    "blockedUntil" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminLoginGuard_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "AdminCredential" (
    "id" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "deletePinHash" TEXT,
    "sessionVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_trackingCode_key" ON "Appointment"("trackingCode");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_dailyIdentityKey_key" ON "Appointment"("dailyIdentityKey");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_activeSlotKey_key" ON "Appointment"("activeSlotKey");

-- CreateIndex
CREATE INDEX "Appointment_dateKey_idx" ON "Appointment"("dateKey");

-- CreateIndex
CREATE INDEX "Appointment_dateKey_time_idx" ON "Appointment"("dateKey", "time");

-- CreateIndex
CREATE INDEX "Appointment_phone_idx" ON "Appointment"("phone");

-- CreateIndex
CREATE INDEX "Appointment_normalizedName_idx" ON "Appointment"("normalizedName");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "Appointment_source_idx" ON "Appointment"("source");

-- CreateIndex
CREATE INDEX "Appointment_dateKey_phone_normalizedName_idx" ON "Appointment"("dateKey", "phone", "normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentBlock_blockKey_key" ON "AppointmentBlock"("blockKey");

-- CreateIndex
CREATE INDEX "AppointmentBlock_dateKey_idx" ON "AppointmentBlock"("dateKey");

-- CreateIndex
CREATE INDEX "AppointmentBlock_dateKey_time_idx" ON "AppointmentBlock"("dateKey", "time");

-- CreateIndex
CREATE INDEX "Feedback_status_idx" ON "Feedback"("status");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "Feedback_phone_idx" ON "Feedback"("phone");

-- CreateIndex
CREATE INDEX "Faq_isActive_sortOrder_idx" ON "Faq"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "PortfolioItem_isActive_sortOrder_idx" ON "PortfolioItem"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "EquipmentItem_isActive_sortOrder_idx" ON "EquipmentItem"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "EquipmentItem_createdAt_idx" ON "EquipmentItem"("createdAt");

-- CreateIndex
CREATE INDEX "TechnicalInspectionImage_pageId_idx" ON "TechnicalInspectionImage"("pageId");

-- CreateIndex
CREATE INDEX "TechnicalInspectionImage_pageId_isActive_sortOrder_idx" ON "TechnicalInspectionImage"("pageId", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "TechnicalInspectionImage_createdAt_idx" ON "TechnicalInspectionImage"("createdAt");

-- CreateIndex
CREATE INDEX "BodyInspectionImage_pageId_idx" ON "BodyInspectionImage"("pageId");

-- CreateIndex
CREATE INDEX "BodyInspectionImage_pageId_isActive_sortOrder_idx" ON "BodyInspectionImage"("pageId", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "BodyInspectionImage_createdAt_idx" ON "BodyInspectionImage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_status_publishedAt_idx" ON "Article"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Article_isFeatured_idx" ON "Article"("isFeatured");

-- CreateIndex
CREATE INDEX "Article_createdAt_idx" ON "Article"("createdAt");

-- CreateIndex
CREATE INDEX "AdminLoginGuard_blockedUntil_idx" ON "AdminLoginGuard"("blockedUntil");

-- AddForeignKey
ALTER TABLE "TechnicalInspectionImage" ADD CONSTRAINT "TechnicalInspectionImage_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "TechnicalInspectionPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodyInspectionImage" ADD CONSTRAINT "BodyInspectionImage_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "BodyInspectionPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
