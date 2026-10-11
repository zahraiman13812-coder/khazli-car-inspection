-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackingCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dailyIdentityKey" TEXT,
    "serviceId" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "carBrand" TEXT NOT NULL,
    "carModel" TEXT NOT NULL,
    "carYear" TEXT,
    "note" TEXT,
    "washConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "cancelledAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_trackingCode_key" ON "Appointment"("trackingCode");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_dailyIdentityKey_key" ON "Appointment"("dailyIdentityKey");

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
CREATE INDEX "Appointment_dateKey_phone_normalizedName_idx" ON "Appointment"("dateKey", "phone", "normalizedName");
