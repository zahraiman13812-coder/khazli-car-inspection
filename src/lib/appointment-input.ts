import {
  randomBytes,
} from "node:crypto";

import {
  APPOINTMENT_BOOKING_DAYS,
  APPOINTMENT_SERVICES,
} from "@/config/appointments";

import {
  isAllowedAppointmentTime,
  isBookableDate,
  isPastAppointmentTime,
} from "@/lib/appointment-time";

type AppointmentBody =
  Record<
    string,
    unknown
  >;

export type ValidatedAppointmentInput = {
  fullName:
    string;

  normalizedName:
    string;

  phone:
    string;

  serviceId:
    string;

  dateKey:
    string;

  time:
    string;

  carBrand:
    string;

  carModel:
    string;

  carYear:
    string | null;

  note:
    string | null;

  washConfirmed:
    boolean;

  dailyIdentityKey:
    string;
};

type ValidationResult =
  | {
      ok: true;

      data:
        ValidatedAppointmentInput;
    }
  | {
      ok: false;

      code:
        string;

      message:
        string;
    };

const SERVICE_SET =
  new Set<string>(
    APPOINTMENT_SERVICES,
  );

function normalizeDigits(
  value: string,
) {
  return value
    .replace(
      /[۰-۹]/g,
      (digit) =>
        String(
          "۰۱۲۳۴۵۶۷۸۹".indexOf(
            digit,
          ),
        ),
    )
    .replace(
      /[٠-٩]/g,
      (digit) =>
        String(
          "٠١٢٣٤٥٦٧٨٩".indexOf(
            digit,
          ),
        ),
    );
}

function normalizeWhitespace(
  value: string,
) {
  return value
    .normalize(
      "NFKC",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

function normalizePersonName(
  value: string,
) {
  return normalizeWhitespace(
    value,
  )
    .replace(
      /ك/g,
      "ک",
    )
    .replace(
      /[يى]/g,
      "ی",
    )
    .replace(
      /ـ/g,
      "",
    )
    .replace(
      /\u200c+/g,
      "\u200c",
    )
    .toLocaleLowerCase(
      "fa-IR",
    );
}

export function createAppointmentTrackingCode() {
  const timePart =
    Date.now()
      .toString(
        36,
      )
      .toUpperCase()
      .slice(
        -6,
      );

  const randomPart =
    randomBytes(
      4,
    )
      .toString(
        "hex",
      )
      .toUpperCase();

  return `KHZ-${timePart}-${randomPart}`;
}

export function validateAppointmentInput(
  body:
    AppointmentBody,
  {
    requireWashConfirmation = true,
  }: {
    requireWashConfirmation?:
      boolean;
  } = {},
): ValidationResult {
  const fullName =
    normalizeWhitespace(
      typeof body.fullName ===
        "string"
        ? body.fullName
        : "",
    );

  const normalizedName =
    normalizePersonName(
      fullName,
    );

  const phone =
    normalizeDigits(
      typeof body.phone ===
        "string"
        ? body.phone
        : "",
    )
      .replace(
        /\D/g,
        "",
      )
      .trim();

  const serviceId =
    typeof body.serviceId ===
    "string"
      ? body.serviceId.trim()
      : "";

  /*
   * هر دو را می‌پذیریم:
   *
   * dateKey = نسخه جدید
   * date    = سازگاری با Booking قدیمی
   */
  const rawDate =
    typeof body.dateKey ===
    "string"
      ? body.dateKey
      : typeof body.date ===
          "string"
        ? body.date
        : "";

  const dateKey =
    normalizeDigits(
      rawDate,
    ).trim();

  const time =
    normalizeDigits(
      typeof body.time ===
        "string"
        ? body.time
        : "",
    ).trim();

  const carBrand =
    normalizeWhitespace(
      typeof body.carBrand ===
        "string"
        ? body.carBrand
        : "",
    );

  const carModel =
    normalizeWhitespace(
      typeof body.carModel ===
        "string"
        ? body.carModel
        : "",
    );

  const carYear =
    normalizeDigits(
      typeof body.carYear ===
        "string"
        ? body.carYear
        : "",
    ).trim();

  const note =
    typeof body.note ===
    "string"
      ? body.note
          .trim()
          .slice(
            0,
            1000,
          )
      : "";

  if (
    fullName.length <
      2 ||
    fullName.length >
      80 ||
    !/^[\p{L}\p{M}\s\u200c]+$/u.test(
      fullName,
    )
  ) {
    return {
      ok: false,

      code:
        "INVALID_NAME",

      message:
        "نام و نام خانوادگی معتبر نیست.",
    };
  }

  if (
    !/^09\d{9}$/.test(
      phone,
    )
  ) {
    return {
      ok: false,

      code:
        "INVALID_PHONE",

      message:
        "شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.",
    };
  }

  if (
    !SERVICE_SET.has(
      serviceId,
    )
  ) {
    return {
      ok: false,

      code:
        "INVALID_SERVICE",

      message:
        "نوع کارشناسی انتخاب‌شده معتبر نیست.",
    };
  }

  if (
    !isBookableDate(
      dateKey,
    )
  ) {
    return {
      ok: false,

      code:
        "INVALID_DATE",

      message:
        `تاریخ نوبت باید در بازه ${APPOINTMENT_BOOKING_DAYS} روز آینده باشد.`,
    };
  }

  if (
    !isAllowedAppointmentTime(
      time,
    )
  ) {
    return {
      ok: false,

      code:
        "INVALID_TIME",

      message:
        "ساعت انتخاب‌شده معتبر نیست.",
    };
  }

  if (
    isPastAppointmentTime({
      date:
        dateKey,

      time,
    })
  ) {
    return {
      ok: false,

      code:
        "PAST_TIME",

      message:
        "این تاریخ یا ساعت گذشته است و امکان ثبت نوبت برای آن وجود ندارد.",
    };
  }

  if (
    carBrand.length <
      2 ||
    carBrand.length >
      80
  ) {
    return {
      ok: false,

      code:
        "INVALID_CAR_BRAND",

      message:
        "برند خودرو را به‌درستی وارد کنید.",
    };
  }

  if (
    carModel.length <
      1 ||
    carModel.length >
      100
  ) {
    return {
      ok: false,

      code:
        "INVALID_CAR_MODEL",

      message:
        "مدل خودرو را به‌درستی وارد کنید.",
    };
  }

  if (
    carYear &&
    !/^\d{2,4}$/.test(
      carYear,
    )
  ) {
    return {
      ok: false,

      code:
        "INVALID_CAR_YEAR",

      message:
        "سال خودرو باید به‌صورت عددی وارد شود.",
    };
  }

  if (
    requireWashConfirmation &&
    body.washConfirmed !==
      true
  ) {
    return {
      ok: false,

      code:
        "WASH_REQUIRED",

      message:
        "قبل از کارشناسی حتماً حتماً بدنه خودرو شستشو یا کارواش بشود.",
    };
  }

  const dailyIdentityKey =
    `${dateKey}:${phone}:${normalizedName}`;

  return {
    ok: true,

    data: {
      fullName,
      normalizedName,
      phone,
      serviceId,
      dateKey,
      time,
      carBrand,
      carModel,

      carYear:
        carYear ||
        null,

      note:
        note ||
        null,

      washConfirmed:
        requireWashConfirmation
          ? true
          : true,

      dailyIdentityKey,
    },
  };
}