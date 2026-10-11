/*
 * نوبت‌هایی که هنوز برای کاربر
 * به‌عنوان نوبت فعال محسوب می‌شوند.
 *
 * confirmed فقط برای سازگاری با
 * داده‌های قدیمی باقی مانده است.
 */
export const ACTIVE_APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
] as const;

/*
 * وضعیت‌هایی که اجازه نداریم همان
 * تاریخ و ساعت دوباره رزرو شوند.
 *
 * completed عمداً اینجاست.
 * نوبت انجام‌شده نباید Slot را دوباره آزاد کند.
 */
export const SLOT_RESERVING_APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
  "completed",
] as const;

export function createActiveSlotKey(
  dateKey: string,
  time: string,
) {
  return `${dateKey}:${time}`;
}