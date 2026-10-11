/*
 * ============================================================
 * APPOINTMENT CONFIG
 * تنظیمات سیستم نوبت‌دهی
 * ============================================================
 */

/*
 * Number of vehicles that can be booked
 * for the same date and time.
 *
 * تعداد خودروهایی که می‌توانند
 * همزمان در یک ساعت نوبت داشته باشند.
 */
export const APPOINTMENT_SLOT_CAPACITY = 1;

/*
 * Number of future days available for booking.
 * تعداد روزهای قابل رزرو.
 */
export const APPOINTMENT_BOOKING_DAYS = 14;

/*
 * Business hours.
 * ساعات نوبت‌دهی.
 */
export const APPOINTMENT_START_HOUR = 8;
export const APPOINTMENT_END_HOUR = 21;

/*
 * Appointment interval in minutes.
 * فاصله نوبت‌ها.
 */
export const APPOINTMENT_INTERVAL_MINUTES = 30;

export const APPOINTMENT_SERVICES = [
  "paint",
  "body",
  "full",
] as const;