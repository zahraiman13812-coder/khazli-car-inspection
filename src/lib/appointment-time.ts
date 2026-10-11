import {
  APPOINTMENT_BOOKING_DAYS,
  APPOINTMENT_END_HOUR,
  APPOINTMENT_INTERVAL_MINUTES,
  APPOINTMENT_START_HOUR,
} from "@/config/appointments";

/*
 * ============================================================
 * TEHRAN DATE
 * ============================================================
 */

export function getTehranTodayISO(
  now = new Date(),
) {
  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          "Asia/Tehran",

        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit",
      },
    ).formatToParts(
      now,
    );

  const year =
    parts.find(
      (part) =>
        part.type ===
        "year",
    )?.value;

  const month =
    parts.find(
      (part) =>
        part.type ===
        "month",
    )?.value;

  const day =
    parts.find(
      (part) =>
        part.type ===
        "day",
    )?.value;

  return `${year}-${month}-${day}`;
}

export function getTehranCurrentMinutes(
  now = new Date(),
) {
  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          "Asia/Tehran",

        hour:
          "2-digit",

        minute:
          "2-digit",

        hourCycle:
          "h23",
      },
    ).formatToParts(
      now,
    );

  const hour =
    Number(
      parts.find(
        (part) =>
          part.type ===
          "hour",
      )?.value ?? 0,
    );

  const minute =
    Number(
      parts.find(
        (part) =>
          part.type ===
          "minute",
      )?.value ?? 0,
    );

  return (
    hour * 60 +
    minute
  );
}

/*
 * ============================================================
 * DATE HELPERS
 * ============================================================
 */

export function isValidISODate(
  value: string,
) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value,
    )
  ) {
    return false;
  }

  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        12,
      ),
    );

  return (
    date.getUTCFullYear() ===
      year &&
    date.getUTCMonth() + 1 ===
      month &&
    date.getUTCDate() ===
      day
  );
}

export function addDaysToISODate(
  dateKey: string,
  days: number,
) {
  if (
    !isValidISODate(
      dateKey,
    )
  ) {
    throw new Error(
      "Invalid ISO date.",
    );
  }

  const [
    year,
    month,
    day,
  ] = dateKey
    .split("-")
    .map(Number);

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day + days,
        12,
      ),
    );

  return date
    .toISOString()
    .slice(
      0,
      10,
    );
}

export function getLastBookableDateISO() {
  return addDaysToISODate(
    getTehranTodayISO(),
    APPOINTMENT_BOOKING_DAYS -
      1,
  );
}

export function isBookableDate(
  value: string,
) {
  if (
    !isValidISODate(
      value,
    )
  ) {
    return false;
  }

  const today =
    getTehranTodayISO();

  const lastDay =
    getLastBookableDateISO();

  return (
    value >= today &&
    value <= lastDay
  );
}

/*
 * ============================================================
 * TIME
 * ============================================================
 */

export function timeToMinutes(
  value: string,
) {
  const [
    hour,
    minute,
  ] = value
    .split(":")
    .map(Number);

  return (
    hour * 60 +
    minute
  );
}

export function getAllowedAppointmentTimes() {
  const result:
    string[] = [];

  const start =
    APPOINTMENT_START_HOUR *
    60;

  const end =
    APPOINTMENT_END_HOUR *
    60;

  for (
    let minutes =
      start;
    minutes <=
      end;
    minutes +=
      APPOINTMENT_INTERVAL_MINUTES
  ) {
    const hour =
      Math.floor(
        minutes /
          60,
      );

    const minute =
      minutes %
      60;

    result.push(
      `${String(
        hour,
      ).padStart(
        2,
        "0",
      )}:${String(
        minute,
      ).padStart(
        2,
        "0",
      )}`,
    );
  }

  return result;
}

export function isAllowedAppointmentTime(
  value: string,
) {
  if (
    !/^\d{2}:\d{2}$/.test(
      value,
    )
  ) {
    return false;
  }

  const [
    hour,
    minute,
  ] = value
    .split(":")
    .map(Number);

  if (
    !Number.isInteger(
      hour,
    ) ||
    !Number.isInteger(
      minute,
    )
  ) {
    return false;
  }

  const minutes =
    hour * 60 +
    minute;

  const start =
    APPOINTMENT_START_HOUR *
    60;

  const end =
    APPOINTMENT_END_HOUR *
    60;

  return (
    minutes >= start &&
    minutes <= end &&
    (minutes -
      start) %
      APPOINTMENT_INTERVAL_MINUTES ===
      0
  );
}

/*
 * ============================================================
 * PAST TIME
 * ============================================================
 */

export function isPastAppointmentTime({
  date,
  time,
}: {
  date: string;
  time: string;
}) {
  const today =
    getTehranTodayISO();

  if (
    date < today
  ) {
    return true;
  }

  if (
    date >
    today
  ) {
    return false;
  }

  return (
    timeToMinutes(
      time,
    ) <=
    getTehranCurrentMinutes()
  );
}