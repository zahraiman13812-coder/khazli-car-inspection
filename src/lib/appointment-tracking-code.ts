export const APPOINTMENT_TRACKING_CODE_MAX_LENGTH = 32;

const LEGACY_TRACKING_CODE_PATTERN =
  /^KHZ-[A-Z0-9]{8}$/;

const CURRENT_TRACKING_CODE_PATTERN =
  /^KHZ-[A-Z0-9]{6}-[A-Z0-9]{8}$/;

export function normalizeAppointmentTrackingCode(
  value: string,
) {
  return value
    .normalize("NFKC")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9-]/g, "");
}

export function isValidAppointmentTrackingCode(
  value: string,
) {
  const normalized =
    normalizeAppointmentTrackingCode(
      value,
    );

  return (
    LEGACY_TRACKING_CODE_PATTERN.test(
      normalized,
    ) ||
    CURRENT_TRACKING_CODE_PATTERN.test(
      normalized,
    )
  );
}
