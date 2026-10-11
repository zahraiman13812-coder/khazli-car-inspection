-- CreateTable
CREATE TABLE "AppointmentBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockKey" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "time" TEXT,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "cancelledAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Appointment" ("activeSlotKey", "cancelledAt", "carBrand", "carModel", "carYear", "completedAt", "createdAt", "dailyIdentityKey", "dateKey", "fullName", "id", "normalizedName", "note", "phone", "serviceId", "status", "time", "trackingCode", "updatedAt", "washConfirmed") SELECT "activeSlotKey", "cancelledAt", "carBrand", "carModel", "carYear", "completedAt", "createdAt", "dailyIdentityKey", "dateKey", "fullName", "id", "normalizedName", "note", "phone", "serviceId", "status", "time", "trackingCode", "updatedAt", "washConfirmed" FROM "Appointment";
DROP TABLE "Appointment";
ALTER TABLE "new_Appointment" RENAME TO "Appointment";
CREATE UNIQUE INDEX "Appointment_trackingCode_key" ON "Appointment"("trackingCode");
CREATE UNIQUE INDEX "Appointment_dailyIdentityKey_key" ON "Appointment"("dailyIdentityKey");
CREATE UNIQUE INDEX "Appointment_activeSlotKey_key" ON "Appointment"("activeSlotKey");
CREATE INDEX "Appointment_dateKey_idx" ON "Appointment"("dateKey");
CREATE INDEX "Appointment_dateKey_time_idx" ON "Appointment"("dateKey", "time");
CREATE INDEX "Appointment_phone_idx" ON "Appointment"("phone");
CREATE INDEX "Appointment_normalizedName_idx" ON "Appointment"("normalizedName");
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");
CREATE INDEX "Appointment_source_idx" ON "Appointment"("source");
CREATE INDEX "Appointment_dateKey_phone_normalizedName_idx" ON "Appointment"("dateKey", "phone", "normalizedName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentBlock_blockKey_key" ON "AppointmentBlock"("blockKey");

-- CreateIndex
CREATE INDEX "AppointmentBlock_dateKey_idx" ON "AppointmentBlock"("dateKey");

-- CreateIndex
CREATE INDEX "AppointmentBlock_dateKey_time_idx" ON "AppointmentBlock"("dateKey", "time");
