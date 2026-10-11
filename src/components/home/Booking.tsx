"use client";

import {
  CalendarDays,
  CarFront,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Loader2,
  Phone,
  ShieldCheck,
  TriangleAlert,
  UserRound,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  FormEvent,
  ReactNode,
} from "react";

import {
  APPOINTMENT_BOOKING_DAYS,
} from "@/config/appointments";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type ServiceId =
  | "paint"
  | "body"
  | "full";

type BookingForm = {
  serviceId:
    | ServiceId
    | "";

  date: string;

  time: string;

  fullName: string;

  phone: string;

  carBrand: string;

  carModel: string;

  carYear: string;

  note: string;
};

type DateOption = {
  iso: string;

  weekday: string;

  day: string;

  month: string;

  isToday: boolean;
};

type CreatedAppointment = {
  trackingCode: string;

  fullName: string;

  phone: string;

  serviceId: string;

  date: string;

  time: string;

  carBrand: string;

  carModel: string;

  carYear:
    | string
    | null;

  status: string;
};

type BookingApiResponse = {
  ok: boolean;

  code?: string;

  message?: string;

  appointment?: {
    trackingCode: string;

    fullName?: string;

    phone?: string;

    serviceId?: string;

    dateKey?: string;

    time?: string;

    carBrand?: string;

    carModel?: string;

    carYear?:
      | string
      | null;

    status?: string;
  };
};

type AvailabilityResponse = {
  ok: boolean;

  message?: string;

  fullTimes?: string[];
};

/*
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

const ACTIVE_APPOINTMENTS_STORAGE_KEY =
  "khz-active-appointment-codes";

const APPOINTMENTS_CHANGED_EVENT =
  "khz:appointments-changed";

const services = [
  {
    id:
      "paint" as const,

    title:
      "کارشناسی رنگ و بدنه",

    description:
      "بررسی رنگ‌شدگی، ضخامت رنگ، قطعات تعویضی و وضعیت بدنه",

    duration:
      "حدود 30 دقیقه",
  },

  {
    id:
      "body" as const,

    title:
      "کارشناسی فنی ",

    description:
      "بررسی شاسی، ستون‌ها، آثار ضربه و بخش‌های ساختاری خودرو",

    duration:
      "حدود 30 دقیقه",
  },

  {
    id:
      "full" as const,

    title:
      "کارشناسی کامل خودرو",

    description:
      "بررسی رنگ، بدنه، بخش‌های فنی و اطلاعات قابل بررسی با دیاگ",

    duration:
      "حدود 30 دقیقه",
  },
];

const initialForm:
  BookingForm = {
    serviceId:
      "",

    date:
      "",

    time:
      "",

    fullName:
      "",

    phone:
      "",

    carBrand:
      "",

    carModel:
      "",

    carYear:
      "",

    note:
      "",
  };

const inputClassName =
  "h-12 w-full min-w-0 rounded-xl border border-line bg-input px-4 text-base text-ink outline-none transition-colors placeholder:text-placeholder hover:bg-input-hover focus:border-focus focus:ring-4 focus:ring-brand-soft";

/*
 * ============================================================
 * DIGITS
 * ============================================================
 */

function toPersianDigits(
  value: string,
) {
  const persianDigits =
    "۰۱۲۳۴۵۶۷۸۹";

  return value.replace(
    /\d/g,
    (digit) =>
      persianDigits[
        Number(
          digit,
        )
      ],
  );
}

function normalizeDigits(
  value: string,
) {
  const persianDigits =
    "۰۱۲۳۴۵۶۷۸۹";

  const arabicDigits =
    "٠١٢٣٤٥٦٧٨٩";

  return value
    .replace(
      /[۰-۹]/g,
      (digit) =>
        String(
          persianDigits.indexOf(
            digit,
          ),
        ),
    )
    .replace(
      /[٠-٩]/g,
      (digit) =>
        String(
          arabicDigits.indexOf(
            digit,
          ),
        ),
    );
}

/*
 * ============================================================
 * SANITIZATION
 * ============================================================
 */

function sanitizeFullName(
  value: string,
) {
  return value.replace(
    /[^\p{L}\s\u200C]/gu,
    "",
  );
}

function sanitizePhone(
  value: string,
) {
  return normalizeDigits(
    value,
  )
    .replace(
      /\D/g,
      "",
    )
    .slice(
      0,
      11,
    );
}

/*
 * ============================================================
 * VALIDATION
 * ============================================================
 */

function validateFullName(
  value: string,
) {
  const trimmed =
    value.trim();

  if (!trimmed) {
    return "نام و نام خانوادگی الزامی است.";
  }

  if (
    trimmed.length <
    2
  ) {
    return "نام و نام خانوادگی معتبر نیست.";
  }

  if (
    !/^[\p{L}\s\u200C]+$/u.test(
      trimmed,
    )
  ) {
    return "نام و نام خانوادگی باید فقط شامل حروف باشد.";
  }

  return "";
}

function validatePhone(
  value: string,
) {
  const normalized =
    sanitizePhone(
      value,
    );

  if (!normalized) {
    return "شماره موبایل الزامی است.";
  }

  if (
    !normalized.startsWith(
      "09",
    )
  ) {
    return "شماره موبایل باید با 09 شروع شود.";
  }

  if (
    normalized.length !==
    11
  ) {
    return "شماره موبایل باید دقیقاً ۱۱ رقم باشد.";
  }

  if (
    !/^09\d{9}$/.test(
      normalized,
    )
  ) {
    return "شماره موبایل معتبر نیست.";
  }

  return "";
}

/*
 * ============================================================
 * TIME
 * ============================================================
 */

function generateAvailableTimes() {
  const times:
    string[] = [];

  const startMinutes =
    8 * 60;

  const endMinutes =
    21 * 60;

  for (
    let minutes =
      startMinutes;
    minutes <=
    endMinutes;
    minutes +=
    30
  ) {
    const hour =
      Math.floor(
        minutes /
          60,
      );

    const minute =
      minutes %
      60;

    times.push(
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

  return times;
}

const availableTimes =
  generateAvailableTimes();

function getTehranTodayISO() {
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
      new Date(),
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

function getTehranCurrentMinutes() {
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
      new Date(),
    );

  const hour =
    Number(
      parts.find(
        (part) =>
          part.type ===
          "hour",
      )?.value ??
        0,
    );

  const minute =
    Number(
      parts.find(
        (part) =>
          part.type ===
          "minute",
      )?.value ??
        0,
    );

  return (
    hour * 60 +
    minute
  );
}

function timeToMinutes(
  value: string,
) {
  const [
    hour,
    minute,
  ] = value
    .split(":")
    .map(
      Number,
    );

  return (
    hour * 60 +
    minute
  );
}

/*
 * ============================================================
 * DATE
 * ============================================================
 */

function createDateOptions(
  days: number,
): DateOption[] {
  const todayISO =
    getTehranTodayISO();

  const [
    year,
    month,
    day,
  ] = todayISO
    .split("-")
    .map(
      Number,
    );

  return Array.from(
    {
      length:
        days,
    },

    (
      _,
      index,
    ) => {
      const date =
        new Date(
          Date.UTC(
            year,
            month -
              1,
            day +
              index,
            12,
          ),
        );

      const iso =
        date
          .toISOString()
          .slice(
            0,
            10,
          );

      const weekday =
        new Intl.DateTimeFormat(
          "fa-IR-u-ca-persian",
          {
            weekday:
              "short",

            timeZone:
              "Asia/Tehran",
          },
        ).format(
          date,
        );

      const persianDay =
        new Intl.DateTimeFormat(
          "fa-IR-u-ca-persian",
          {
            day:
              "numeric",

            timeZone:
              "Asia/Tehran",
          },
        ).format(
          date,
        );

      const persianMonth =
        new Intl.DateTimeFormat(
          "fa-IR-u-ca-persian",
          {
            month:
              "short",

            timeZone:
              "Asia/Tehran",
          },
        ).format(
          date,
        );

      return {
        iso,

        weekday,

        day:
          persianDay,

        month:
          persianMonth,

        isToday:
          iso ===
          todayISO,
      };
    },
  );
}

function formatPersianDate(
  value: string,
) {
  if (!value) {
    return "انتخاب نشده";
  }

  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(
      Number,
    );

  const date =
    new Date(
      Date.UTC(
        year,
        month -
          1,
        day,
        12,
      ),
    );

  return new Intl.DateTimeFormat(
    "fa-IR-u-ca-persian",
    {
      weekday:
        "long",

      day:
        "numeric",

      month:
        "long",

      year:
        "numeric",

      timeZone:
        "Asia/Tehran",
    },
  ).format(
    date,
  );
}

function formatTime(
  value: string,
) {
  if (!value) {
    return "انتخاب نشده";
  }

  return toPersianDigits(
    value,
  );
}

/*
 * ============================================================
 * LOCAL STORAGE
 * ============================================================
 */

function saveActiveAppointmentCode(
  trackingCode: string,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  try {
    const raw =
      window.localStorage.getItem(
        ACTIVE_APPOINTMENTS_STORAGE_KEY,
      );

    const parsed =
      raw
        ? JSON.parse(
            raw,
          )
        : [];

    const current:
      string[] =
      Array.isArray(
        parsed,
      )
        ? parsed.filter(
            (
              item,
            ): item is string =>
              typeof item ===
              "string",
          )
        : [];

    const next =
      Array.from(
        new Set([
          trackingCode,
          ...current,
        ]),
      );

    window.localStorage.setItem(
      ACTIVE_APPOINTMENTS_STORAGE_KEY,
      JSON.stringify(
        next,
      ),
    );
  } catch {
    /*
     * LocalStorage failure must not
     * prevent appointment registration.
     */
  }
}

/*
 * ============================================================
 * MAIN COMPONENT
 * ============================================================
 */

export default function Booking() {
  const [
    form,
    setForm,
  ] =
    useState<BookingForm>({
      ...initialForm,
    });

  const [
    washConfirmed,
    setWashConfirmed,
  ] =
    useState(
      false,
    );

  const [
    submitting,
    setSubmitting,
  ] =
    useState(
      false,
    );

  const [
    bookingError,
    setBookingError,
  ] =
    useState(
      "",
    );

  const [
    duplicateTrackingCode,
    setDuplicateTrackingCode,
  ] =
    useState(
      "",
    );

  const [
    createdAppointment,
    setCreatedAppointment,
  ] =
    useState<
      CreatedAppointment | null
    >(
      null,
    );

  const [
    successModalOpen,
    setSuccessModalOpen,
  ] =
    useState(
      false,
    );

  const [
    unavailableTimes,
    setUnavailableTimes,
  ] =
    useState<
      string[]
    >(
      [],
    );

  const [
    availabilityLoading,
    setAvailabilityLoading,
  ] =
    useState(
      false,
    );

  const [
    touchedFields,
    setTouchedFields,
  ] =
    useState({
      fullName:
        false,

      phone:
        false,
    });

  const [
    submitAttempted,
    setSubmitAttempted,
  ] =
    useState(
      false,
    );

  /*
   * Request controllers.
   */
  const submitControllerRef =
    useRef<
      AbortController | null
    >(
      null,
    );

  const availabilityControllerRef =
    useRef<
      AbortController | null
    >(
      null,
    );

  /*
   * Only cleanup happens in this effect.
   *
   * هیچ setState داخل این Effect نداریم.
   */
  useEffect(
    () => {
      return () => {
        submitControllerRef.current?.abort();

        availabilityControllerRef.current?.abort();
      };
    },
    [],
  );

  const dateOptions =
    useMemo(
      () =>
        createDateOptions(
          APPOINTMENT_BOOKING_DAYS,
        ),
      [],
    );

  const todayISO =
    useMemo(
      () =>
        getTehranTodayISO(),
      [],
    );

  const selectedService =
    services.find(
      (
        service,
      ) =>
        service.id ===
        form.serviceId,
    );

  const fullNameError =
    validateFullName(
      form.fullName,
    );

  const phoneError =
    validatePhone(
      form.phone,
    );

  const showFullNameError =
    Boolean(
      fullNameError &&
        (touchedFields.fullName ||
          submitAttempted),
    );

  const showPhoneError =
    Boolean(
      phoneError &&
        (touchedFields.phone ||
          submitAttempted),
    );

  const isReady =
    Boolean(
      form.serviceId &&
        form.date &&
        form.time &&
        form.carBrand.trim() &&
        form.carModel.trim() &&
        !fullNameError &&
        !phoneError &&
        washConfirmed &&
        !unavailableTimes.includes(
          form.time,
        ),
    );

  /*
   * ==========================================================
   * LOAD DATE AVAILABILITY
   * ==========================================================
   */

  async function selectDate(
    date: string,
  ) {
    /*
     * Cancel previous request.
     */
    availabilityControllerRef.current?.abort();

    const controller =
      new AbortController();

    availabilityControllerRef.current =
      controller;

    /*
     * Clear previous date availability.
     */
    setUnavailableTimes(
      [],
    );

    setBookingError(
      "",
    );

    setDuplicateTrackingCode(
      "",
    );

    setAvailabilityLoading(
      true,
    );

    setForm(
      (
        current,
      ) => ({
        ...current,

        date,

        time:
          "",
      }),
    );

    try {
      const response =
        await fetch(
          `/api/appointments/availability?date=${encodeURIComponent(
            date,
          )}`,
          {
            method:
              "GET",

            cache:
              "no-store",

            signal:
              controller.signal,
          },
        );

      const data =
        (await response.json()) as AvailabilityResponse;

      if (
        controller.signal
          .aborted
      ) {
        return;
      }

      if (
        !response.ok ||
        !data.ok
      ) {
        setBookingError(
          data.message ??
            "دریافت ساعت‌های آزاد انجام نشد.",
        );

        return;
      }

      const fullTimes:
        string[] =
        Array.isArray(
          data.fullTimes,
        )
          ? data.fullTimes.filter(
              (
                item,
              ): item is string =>
                typeof item ===
                "string",
            )
          : [];

      setUnavailableTimes(
        fullTimes,
      );
    } catch (
      error
    ) {
      if (
        controller.signal
          .aborted
      ) {
        return;
      }

      console.error(
        "LOAD_AVAILABILITY_ERROR",
        error,
      );

      setBookingError(
        "دریافت ساعت‌های آزاد با خطا مواجه شد.",
      );
    } finally {
      if (
        !controller.signal
          .aborted
      ) {
        setAvailabilityLoading(
          false,
        );
      }
    }
  }

  /*
   * ==========================================================
   * UPDATE FIELD
   * ==========================================================
   */

  function updateField<
    Key extends keyof BookingForm,
  >(
    field:
      Key,

    value:
      BookingForm[Key],
  ) {
    setForm(
      (
        current,
      ) => ({
        ...current,

        [field]:
          value,
      }),
    );

    setBookingError(
      "",
    );

    setDuplicateTrackingCode(
      "",
    );
  }

  /*
   * ==========================================================
   * PAST SLOT
   * ==========================================================
   */

  function isPastTimeSlot(
    time: string,
  ) {
    if (
      form.date !==
      todayISO
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

  /*
   * ==========================================================
   * SUBMIT
   * ==========================================================
   */

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSubmitAttempted(
      true,
    );

    setTouchedFields({
      fullName:
        true,

      phone:
        true,
    });

    setBookingError(
      "",
    );

    setDuplicateTrackingCode(
      "",
    );

    if (
      !isReady ||
      submitting ||
      availabilityLoading
    ) {
      return;
    }

    if (
      unavailableTimes.includes(
        form.time,
      )
    ) {
      setBookingError(
        "این ساعت قبلاً رزرو شده است. لطفاً ساعت دیگری را انتخاب کنید.",
      );

      return;
    }

    submitControllerRef.current?.abort();

    const controller =
      new AbortController();

    submitControllerRef.current =
      controller;

    setSubmitting(
      true,
    );

    try {
      const response =
        await fetch(
          "/api/appointments",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            signal:
              controller.signal,

            body:
              JSON.stringify(
                {
                  serviceId:
                    form.serviceId,

                  dateKey:
                    form.date,

                  time:
                    form.time,

                  fullName:
                    form.fullName,

                  phone:
                    form.phone,

                  carBrand:
                    form.carBrand,

                  carModel:
                    form.carModel,

                  carYear:
                    form.carYear,

                  note:
                    form.note,

                  washConfirmed,
                },
              ),
          },
        );

      const data =
        (await response.json()) as BookingApiResponse;

      if (
        controller.signal
          .aborted
      ) {
        return;
      }

      /*
       * Same person has already registered
       * an appointment for this date.
       */
      if (
        response.status ===
          409 &&
        data.code ===
          "DUPLICATE_DAILY_APPOINTMENT"
      ) {
        setBookingError(
          data.message ??
            "شما برای این روز قبلاً نوبت ثبت کرده‌اید.",
        );

        const existingCode =
          data.appointment
            ?.trackingCode;

        if (
          existingCode
        ) {
          setDuplicateTrackingCode(
            existingCode,
          );

          saveActiveAppointmentCode(
            existingCode,
          );

          window.dispatchEvent(
            new Event(
              APPOINTMENTS_CHANGED_EVENT,
            ),
          );
        }

        return;
      }

      /*
       * Selected time became full
       * before final submission.
       */
      if (
        response.status ===
          409 &&
        data.code ===
          "SLOT_FULL"
      ) {
        const selectedTime =
          form.time;

        setBookingError(
          data.message ??
            "این ساعت تکمیل شده است. لطفاً ساعت دیگری را انتخاب کنید.",
        );

        if (
          selectedTime
        ) {
          setUnavailableTimes(
            (
              current,
            ) =>
              Array.from(
                new Set([
                  ...current,

                  selectedTime,
                ]),
              ),
          );
        }

        setForm(
          (
            current,
          ) => ({
            ...current,

            time:
              "",
          }),
        );

        return;
      }

      if (
        !response.ok ||
        !data.ok
      ) {
        setBookingError(
          data.message ??
            "ثبت نوبت انجام نشد. دوباره تلاش کنید.",
        );

        return;
      }

      const appointment =
        data.appointment;

      if (
        !appointment ||
        !appointment.trackingCode ||
        !appointment.fullName ||
        !appointment.phone ||
        !appointment.serviceId ||
        !appointment.dateKey  ||
        !appointment.time ||
        !appointment.carBrand ||
        !appointment.carModel ||
        !appointment.status
      ) {
        setBookingError(
          "اطلاعات نوبت از سرور به‌درستی دریافت نشد.",
        );

        return;
      }

      const created:
        CreatedAppointment = {
          trackingCode:
            appointment.trackingCode,

          fullName:
            appointment.fullName,

          phone:
            appointment.phone,

          serviceId:
            appointment.serviceId,

          date:
            appointment.dateKey,

          time:
            appointment.time,

          carBrand:
            appointment.carBrand,

          carModel:
            appointment.carModel,

          carYear:
            appointment.carYear ??
            null,

          status:
            appointment.status,
        };

      /*
       * Save tracking code on this browser.
       */
      saveActiveAppointmentCode(
        created.trackingCode,
      );

      /*
       * Notify active appointments component.
       */
      window.dispatchEvent(
        new Event(
          APPOINTMENTS_CHANGED_EVENT,
        ),
      );

      /*
       * Show result.
       */
      setCreatedAppointment(
        created,
      );

      setSuccessModalOpen(
        true,
      );

      /*
       * Reset form for another person.
       */
      setForm({
        ...initialForm,
      });

      setWashConfirmed(
        false,
      );

      setSubmitAttempted(
        false,
      );

      setTouchedFields({
        fullName:
          false,

        phone:
          false,
      });

      setBookingError(
        "",
      );

      setDuplicateTrackingCode(
        "",
      );

      setUnavailableTimes(
        [],
      );
    } catch (
      error
    ) {
      if (
        controller.signal
          .aborted
      ) {
        return;
      }

      console.error(
        "BOOKING_SUBMIT_ERROR",
        error,
      );

      setBookingError(
        "ارتباط با سرور برقرار نشد. دوباره تلاش کنید.",
      );
    } finally {
      if (
        !controller.signal
          .aborted
      ) {
        setSubmitting(
          false,
        );
      }
    }
  }

  /*
   * ==========================================================
   * CLOSE SUCCESS MODAL
   * ==========================================================
   */

  function closeSuccessModal() {
    setSuccessModalOpen(
      false,
    );

    setCreatedAppointment(
      null,
    );
  }

  return (
    <>
      <section
        id="booking"
        className="section-space scroll-mt-24 border-y border-line bg-surface-muted"
      >
        <div className="site-container">
          {/* Heading */}
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-black text-brand-active">
              دریافت نوبت
            </span>

            <h2 className="mt-4 text-3xl font-black leading-[1.4] text-ink sm:text-4xl lg:text-5xl">
              نوبت کارشناسی خود را

              <span className="block">
                آنلاین ثبت کنید.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-ink-secondary sm:text-base">
              تاریخ و ساعت مراجعه را انتخاب
              کنید و مشخصات خودرو و
              مراجعه‌کننده را وارد کنید.
            </p>
          </div>

          <div className="mt-10 grid items-start gap-5 sm:mt-12 lg:mt-16 lg:grid-cols-[1.35fr_0.65fr] lg:gap-6">
            {/* Form */}
            <form
              onSubmit={
                handleSubmit
              }
              noValidate
              className="min-w-0 rounded-[1.75rem] border border-line bg-surface p-5 shadow-card sm:p-7 lg:p-8"
            >
              {/* Service */}
              <FormSection
                number="۱"
                title="نوع کارشناسی"
                description="خدمت موردنظر خود را انتخاب کنید."
              >
                <div className="grid gap-3 md:grid-cols-3">
                  {services.map(
                    (
                      service,
                    ) => {
                      const selected =
                        form.serviceId ===
                        service.id;

                      return (
                        <button
                          key={
                            service.id
                          }
                          type="button"
                          onClick={() =>
                            updateField(
                              "serviceId",
                              service.id,
                            )
                          }
                          className={`relative min-w-0 rounded-2xl border p-4 text-right transition-all sm:p-5 ${
                            selected
                              ? "border-brand bg-brand-soft"
                              : "border-line bg-surface hover:border-brand-border hover:bg-surface-warm"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-black leading-6 text-ink">
                                {
                                  service.title
                                }
                              </p>

                              <p className="mt-2 text-xs leading-6 text-ink-muted">
                                {
                                  service.description
                                }
                              </p>
                            </div>

                            <div
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                                selected
                                  ? "border-brand bg-brand text-on-brand"
                                  : "border-line-strong bg-surface"
                              }`}
                            >
                              {selected && (
                                <Check
                                  size={
                                    14
                                  }
                                  strokeWidth={
                                    2.5
                                  }
                                />
                              )}
                            </div>
                          </div>

                          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-ink-secondary">
                            <Clock3
                              size={
                                15
                              }
                            />

                            {
                              service.duration
                            }
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              </FormSection>

              {/* Date */}
              <FormSection
                number="۲"
                title="تاریخ مراجعه"
                description="روز مناسب برای مراجعه را انتخاب کنید."
              >
                <div className="-mx-1 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-3">
                  {dateOptions.map(
                    (
                      option,
                    ) => {
                      const selected =
                        form.date ===
                        option.iso;

                      return (
                        <button
                          key={
                            option.iso
                          }
                          type="button"
                          onClick={() =>
                            void selectDate(
                              option.iso,
                            )
                          }
                          className={`relative min-w-[88px] shrink-0 snap-start rounded-2xl border px-3 py-4 text-center transition-all sm:min-w-[96px] ${
                            selected
                              ? "border-brand bg-brand-soft"
                              : "border-line bg-surface hover:border-brand-border hover:bg-surface-warm"
                          }`}
                        >
                          {option.isToday && (
                            <span className="absolute inset-x-2 -top-2 mx-auto w-fit rounded-full bg-brand px-2 py-0.5 text-[10px] font-black text-on-brand">
                              امروز
                            </span>
                          )}

                          <span className="block text-xs font-bold text-ink-muted">
                            {
                              option.weekday
                            }
                          </span>

                          <span className="mt-2 block text-2xl font-black text-ink">
                            {
                              option.day
                            }
                          </span>

                          <span className="mt-1 block text-xs font-bold text-ink-secondary">
                            {
                              option.month
                            }
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>

                {form.date && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-brand-soft px-4 py-3 text-sm font-bold text-ink">
                    <CalendarDays
                      size={
                        18
                      }
                      className="shrink-0 text-brand-active"
                    />

                    {formatPersianDate(
                      form.date,
                    )}
                  </div>
                )}
              </FormSection>

              {/* Time */}
              <FormSection
                number="۳"
                title="ساعت مراجعه"
                description={
                  form.date
                    ? "نوبت‌ها هر نیم ساعت از ساعت ۸ صبح تا ۲۱ ارائه می‌شوند."
                    : "ابتدا تاریخ مراجعه را انتخاب کنید."
                }
              >
                {availabilityLoading &&
                  form.date && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl bg-surface-muted px-4 py-3 text-xs font-bold text-ink-secondary">
                      <Loader2
                        size={
                          16
                        }
                        className="animate-spin"
                      />

                      در حال بررسی ساعت‌های
                      آزاد...
                    </div>
                  )}

                <div className="grid grid-cols-3 gap-2 min-[430px]:grid-cols-4 sm:grid-cols-5 md:grid-cols-4 xl:grid-cols-5">
                  {availableTimes.map(
                    (
                      time,
                    ) => {
                      const selected =
                        form.time ===
                        time;

                      const past =
                        isPastTimeSlot(
                          time,
                        );

                      const full =
                        unavailableTimes.includes(
                          time,
                        );

                      const disabled =
                        !form.date ||
                        past ||
                        full ||
                        availabilityLoading;

                      return (
                        <button
                          key={
                            time
                          }
                          type="button"
                          disabled={
                            disabled
                          }
                          onClick={() =>
                            updateField(
                              "time",
                              time,
                            )
                          }
                          className={`relative h-12 rounded-xl border text-sm font-black transition-colors ${
                            selected
                              ? "border-brand bg-brand text-on-brand"
                              : "border-line bg-surface text-ink hover:border-brand-border hover:bg-brand-soft"
                          } disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:bg-surface`}
                        >
                          {formatTime(
                            time,
                          )}

                          {full && (
                            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-danger-soft px-1.5 py-0.5 text-[8px] font-black text-danger">
                              پر
                            </span>
                          )}
                        </button>
                      );
                    },
                  )}
                </div>

                {form.date ===
                  todayISO && (
                  <p className="mt-3 text-xs leading-6 text-ink-muted">
                    ساعت‌های گذشته امروز
                    به‌صورت خودکار غیرفعال
                    شده‌اند.
                  </p>
                )}
              </FormSection>

              {/* Vehicle */}
              <FormSection
                number="۴"
                title="مشخصات خودرو"
                description="اطلاعات خودروی مورد کارشناسی را وارد کنید."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="برند خودرو"
                    required
                  >
                    <div className="relative">
                      <CarFront
                        size={
                          19
                        }
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted"
                      />

                      <input
                        type="text"
                        value={
                          form.carBrand
                        }
                        onChange={(
                          event,
                        ) =>
                          updateField(
                            "carBrand",
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder="مثلاً BMW"
                        className={`${inputClassName} pr-12`}
                      />
                    </div>
                  </Field>

                  <Field
                    label="مدل خودرو"
                    required
                  >
                    <input
                      type="text"
                      value={
                        form.carModel
                      }
                      onChange={(
                        event,
                      ) =>
                        updateField(
                          "carModel",
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="مثلاً 530i"
                      className={
                        inputClassName
                      }
                    />
                  </Field>

                  <Field label="سال ساخت">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={
                        form.carYear
                      }
                      onChange={(
                        event,
                      ) => {
                        const value =
                          normalizeDigits(
                            event
                              .target
                              .value,
                          )
                            .replace(
                              /\D/g,
                              "",
                            )
                            .slice(
                              0,
                              4,
                            );

                        updateField(
                          "carYear",
                          value,
                        );
                      }}
                      placeholder="مثلاً 1402"
                      className={
                        inputClassName
                      }
                    />
                  </Field>
                </div>
              </FormSection>

              {/* Customer */}
              <FormSection
                number="۵"
                title="اطلاعات مراجعه‌کننده"
                description="برای هر نوبت، مشخصات فرد مراجعه‌کننده را وارد کنید."
              >
                <div className="mb-5 rounded-2xl border border-brand-border bg-brand-soft p-4">
                  <p className="text-sm font-black text-ink">
                    ثبت چند نوبت
                  </p>

                  <p className="mt-2 text-xs font-bold leading-6 text-ink-secondary">
                    می‌توانید برای چند نفر
                    مختلف پشت سر هم نوبت ثبت
                    کنید. هر نوبت کد پیگیری
                    مستقل خواهد داشت.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="نام و نام خانوادگی"
                    required
                  >
                    <div className="relative">
                      <UserRound
                        size={
                          19
                        }
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted"
                      />

                      <input
                        type="text"
                        autoComplete="name"
                        value={
                          form.fullName
                        }
                        onChange={(
                          event,
                        ) => {
                          updateField(
                            "fullName",
                            sanitizeFullName(
                              event
                                .target
                                .value,
                            ),
                          );

                          setTouchedFields(
                            (
                              current,
                            ) => ({
                              ...current,

                              fullName:
                                true,
                            }),
                          );
                        }}
                        onBlur={() =>
                          setTouchedFields(
                            (
                              current,
                            ) => ({
                              ...current,

                              fullName:
                                true,
                            }),
                          )
                        }
                        placeholder="مثلاً علی رضایی"
                        className={`${inputClassName} pr-12 ${
                          showFullNameError
                            ? "border-danger focus:border-danger focus:ring-danger-soft"
                            : ""
                        }`}
                      />
                    </div>

                    {showFullNameError && (
                      <p className="mt-2 text-xs font-bold leading-6 text-danger">
                        {
                          fullNameError
                        }
                      </p>
                    )}
                  </Field>

                  <Field
                    label="شماره موبایل"
                    required
                  >
                    <div className="relative">
                      <Phone
                        size={
                          19
                        }
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted"
                      />

                      <input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        dir="ltr"
                        maxLength={
                          11
                        }
                        value={
                          form.phone
                        }
                        onChange={(
                          event,
                        ) => {
                          updateField(
                            "phone",
                            sanitizePhone(
                              event
                                .target
                                .value,
                            ),
                          );

                          setTouchedFields(
                            (
                              current,
                            ) => ({
                              ...current,

                              phone:
                                true,
                            }),
                          );
                        }}
                        onBlur={() =>
                          setTouchedFields(
                            (
                              current,
                            ) => ({
                              ...current,

                              phone:
                                true,
                            }),
                          )
                        }
                        placeholder="09123456789"
                        className={`${inputClassName} pr-12 text-left ${
                          showPhoneError
                            ? "border-danger focus:border-danger focus:ring-danger-soft"
                            : ""
                        }`}
                      />
                    </div>

                    {showPhoneError && (
                      <p className="mt-2 text-right text-xs font-bold leading-6 text-danger">
                        {
                          phoneError
                        }
                      </p>
                    )}
                  </Field>
                </div>

                <Field
                  label="توضیحات تکمیلی"
                  className="mt-4"
                >
                  <textarea
                    rows={
                      4
                    }
                    value={
                      form.note
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "note",
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="اگر توضیح خاصی درباره خودرو یا نوبت دارید، اینجا بنویسید..."
                    className="w-full min-w-0 resize-none rounded-xl border border-line bg-input px-4 py-3 text-base leading-8 text-ink outline-none transition-colors placeholder:text-placeholder hover:bg-input-hover focus:border-focus focus:ring-4 focus:ring-brand-soft"
                  />
                </Field>
              </FormSection>

              {/* Wash */}
              <div className="mt-7 rounded-[1.5rem] border border-warning bg-warning-soft p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <TriangleAlert
                    size={
                      22
                    }
                    className="mt-0.5 shrink-0 text-warning"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="font-black text-ink">
                      نکته بسیار مهم قبل از
                      مراجعه
                    </p>

                    <p className="mt-2 text-sm font-black leading-8 text-ink">
                      قبل از کارشناسی حتماً
                      حتماً بدنه خودرو شستشو
                      یا کارواش بشود.
                    </p>

                    <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface p-3">
                      <input
                        type="checkbox"
                        checked={
                          washConfirmed
                        }
                        onChange={(
                          event,
                        ) => {
                          setWashConfirmed(
                            event
                              .target
                              .checked,
                          );

                          setBookingError(
                            "",
                          );
                        }}
                        className="mt-0.5 h-5 w-5 shrink-0 accent-brand"
                      />

                      <span className="text-xs font-bold leading-6 text-ink-secondary sm:text-sm">
                        تأیید می‌کنم که قبل
                        از مراجعه، بدنه خودرو
                        شسته یا کارواش خواهد
                        شد.
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Error */}
              {bookingError && (
                <div
                  role="alert"
                  className="mt-5 rounded-2xl border border-danger bg-danger-soft p-4"
                >
                  <div className="flex items-start gap-3">
                    <TriangleAlert
                      size={
                        20
                      }
                      className="mt-0.5 shrink-0 text-danger"
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-black text-ink">
                        امکان ثبت نوبت وجود
                        ندارد
                      </p>

                      <p className="mt-1 text-sm leading-7 text-ink-secondary">
                        {
                          bookingError
                        }
                      </p>

                      {duplicateTrackingCode && (
                        <p className="mt-3 text-xs font-bold leading-6 text-ink-secondary">
                          کد پیگیری نوبت قبلی:
                          {" "}

                          <span
                            dir="ltr"
                            className="inline-block font-black text-ink"
                          >
                            {
                              duplicateTrackingCode
                            }
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={
                    !isReady ||
                    submitting ||
                    availabilityLoading
                  }
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 text-sm font-black text-on-brand transition-colors hover:bg-brand-hover active:bg-brand-active disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:text-base"
                >
                  {submitting ? (
                    <>
                      <Loader2
                        size={
                          20
                        }
                        className="animate-spin"
                      />

                      در حال ثبت نوبت...
                    </>
                  ) : (
                    <>
                      <CalendarDays
                        size={
                          20
                        }
                      />

                      ثبت نوبت
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Summary */}
            <aside className="min-w-0 rounded-[1.75rem] border border-brand-border bg-surface-warm p-5 shadow-card sm:p-7 lg:sticky lg:top-28">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-active">
                <ShieldCheck
                  size={
                    24
                  }
                />
              </div>

              <h3 className="mt-5 text-xl font-black text-ink sm:text-2xl">
                خلاصه نوبت
              </h3>

              <p className="mt-2 text-sm leading-7 text-ink-secondary">
                قبل از ثبت نهایی اطلاعات
                انتخاب‌شده را بررسی کنید.
              </p>

              <div className="mt-6 space-y-3">
                <SummaryItem
                  icon={
                    <CarFront
                      size={
                        18
                      }
                    />
                  }
                  label="نوع کارشناسی"
                  value={
                    selectedService
                      ?.title ??
                    "انتخاب نشده"
                  }
                />

                <SummaryItem
                  icon={
                    <CalendarDays
                      size={
                        18
                      }
                    />
                  }
                  label="تاریخ مراجعه"
                  value={formatPersianDate(
                    form.date,
                  )}
                />

                <SummaryItem
                  icon={
                    <Clock3
                      size={
                        18
                      }
                    />
                  }
                  label="ساعت مراجعه"
                  value={formatTime(
                    form.time,
                  )}
                />

                <SummaryItem
                  icon={
                    <UserRound
                      size={
                        18
                      }
                    />
                  }
                  label="مراجعه‌کننده"
                  value={
                    form.fullName.trim() ||
                    "وارد نشده"
                  }
                />

                <SummaryItem
                  icon={
                    <Phone
                      size={
                        18
                      }
                    />
                  }
                  label="شماره موبایل"
                  value={
                    form.phone ||
                    "وارد نشده"
                  }
                />

                <SummaryItem
                  icon={
                    <CarFront
                      size={
                        18
                      }
                    />
                  }
                  label="خودرو"
                  value={
                    form.carBrand ||
                    form.carModel
                      ? `${form.carBrand} ${form.carModel}`.trim()
                      : "وارد نشده"
                  }
                />
              </div>

              <div className="mt-6 rounded-2xl border border-warning bg-warning-soft p-4">
                <div className="flex items-start gap-3">
                  <TriangleAlert
                    size={
                      19
                    }
                    className="mt-0.5 shrink-0 text-warning"
                  />

                  <p className="text-xs font-bold leading-6 text-ink-secondary">
                    قبل از کارشناسی، بدنه
                    خودرو حتماً شسته یا
                    کارواش شود.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {successModalOpen &&
        createdAppointment && (
          <BookingSuccessModal
            key={
              createdAppointment.trackingCode
            }
            appointment={
              createdAppointment
            }
            onClose={
              closeSuccessModal
            }
          />
        )}
    </>
  );
}

/*
 * ============================================================
 * SUCCESS MODAL
 * ============================================================
 *
 * Important:
 * این کامپوننت فقط زمانی Mount می‌شود که مودال باز است.
 *
 * بنابراین copied همیشه در Mount جدید false است
 * و نیازی به setCopied(false) داخل useEffect نداریم.
 */

function BookingSuccessModal({
  appointment,
  onClose,
}: {
  appointment:
    CreatedAppointment;

  onClose:
    () => void;
}) {
  const [
    copied,
    setCopied,
  ] =
    useState(
      false,
    );

  const service =
    services.find(
      (
        item,
      ) =>
        item.id ===
        appointment.serviceId,
    );

  async function copyTrackingCode() {
    const code =
      appointment.trackingCode;

    try {
      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(
          code,
        );

        setCopied(
          true,
        );

        return;
      }

      /*
       * Clipboard fallback.
       */
      const textarea =
        document.createElement(
          "textarea",
        );

      textarea.value =
        code;

      textarea.style.position =
        "fixed";

      textarea.style.opacity =
        "0";

      textarea.style.pointerEvents =
        "none";

      document.body.appendChild(
        textarea,
      );

      textarea.focus();

      textarea.select();

      const copiedSuccessfully =
        document.execCommand(
          "copy",
        );

      document.body.removeChild(
        textarea,
      );

      if (
        copiedSuccessfully
      ) {
        setCopied(
          true,
        );
      }
    } catch (
      error
    ) {
      console.error(
        "COPY_TRACKING_CODE_ERROR",
        error,
      );
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-success-title"
      className="fixed inset-0 z-[150] flex items-center justify-center bg-overlay p-4"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="بستن پنجره"
        onClick={
          onClose
        }
        className="absolute inset-0 cursor-default"
      />

      {/* Modal */}
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-line bg-surface p-5 shadow-float sm:p-7">
        <button
          type="button"
          onClick={
            onClose
          }
          aria-label="بستن مودال"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink transition-colors hover:bg-surface-hover"
        >
          <X
            size={
              18
            }
          />
        </button>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-soft text-success">
          <CheckCircle2
            size={
              28
            }
          />
        </div>

        <h3
          id="booking-success-title"
          className="mt-5 text-2xl font-black text-ink"
        >
          نوبت با موفقیت ثبت شد
        </h3>

        <p className="mt-2 text-sm leading-7 text-ink-secondary">
          اطلاعات نوبت را بررسی کنید. این
          نوبت تا زمان انجام یا لغو در بخش
          «نوبت‌های فعال من» باقی می‌ماند.
        </p>

        {/* Tracking Code */}
        <div className="mt-6 rounded-2xl border border-brand-border bg-brand-soft p-4">
          <p className="text-xs font-bold text-ink-secondary">
            کد پیگیری
          </p>

          <div className="mt-2 flex gap-2">
            <div
              dir="ltr"
              className="flex h-12 min-w-0 flex-1 items-center justify-center rounded-xl bg-surface px-3 text-base font-black tracking-wider text-ink sm:text-lg"
            >
              {
                appointment.trackingCode
              }
            </div>

            <button
              type="button"
              onClick={() =>
                void copyTrackingCode()
              }
              className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-black text-ink transition-colors hover:bg-surface-hover"
            >
              {copied ? (
                <>
                  <Check
                    size={
                      16
                    }
                  />

                  کپی شد
                </>
              ) : (
                <>
                  <Copy
                    size={
                      16
                    }
                  />

                  کپی
                </>
              )}
            </button>
          </div>
        </div>

        {/* Appointment Info */}
        <div className="mt-4 space-y-3">
          <ModalInfo
            icon={
              <UserRound
                size={
                  18
                }
              />
            }
            label="نام مراجعه‌کننده"
            value={
              appointment.fullName
            }
          />

          <ModalInfo
            icon={
              <CalendarDays
                size={
                  18
                }
              />
            }
            label="روز و تاریخ"
            value={formatPersianDate(
              appointment.date,
            )}
          />

          <ModalInfo
            icon={
              <Clock3
                size={
                  18
                }
              />
            }
            label="ساعت مراجعه"
            value={formatTime(
              appointment.time,
            )}
          />

          <ModalInfo
            icon={
              <Phone
                size={
                  18
                }
              />
            }
            label="شماره موبایل"
            value={
              appointment.phone
            }
          />

          <ModalInfo
            icon={
              <CarFront
                size={
                  18
                }
              />
            }
            label="خودرو"
            value={[
              appointment.carBrand,

              appointment.carModel,

              appointment.carYear,
            ]
              .filter(
                Boolean,
              )
              .join(
                " ",
              )}
          />

          <ModalInfo
            icon={
              <ShieldCheck
                size={
                  18
                }
              />
            }
            label="نوع کارشناسی"
            value={
              service
                ?.title ??
              "کارشناسی خودرو"
            }
          />
        </div>

        {/* Reminder */}
        <div className="mt-4 rounded-xl border border-warning bg-warning-soft p-4">
          <div className="flex items-start gap-3">
            <TriangleAlert
              size={
                18
              }
              className="mt-0.5 shrink-0 text-warning"
            />

            <p className="text-xs font-bold leading-6 text-ink-secondary">
              قبل از کارشناسی حتماً حتماً
              بدنه خودرو شستشو یا کارواش
              بشود.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={
            onClose
          }
          className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-brand px-5 text-sm font-black text-on-brand transition-colors hover:bg-brand-hover active:bg-brand-active"
        >
          متوجه شدم
        </button>
      </div>
    </div>
  );
}

/*
 * ============================================================
 * FORM SECTION
 * ============================================================
 */

function FormSection({
  number,
  title,
  description,
  children,
}: {
  number:
    string;

  title:
    string;

  description:
    string;

  children:
    ReactNode;
}) {
  return (
    <section className="border-b border-line py-7 first:pt-0 last:border-b-0">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-sm font-black text-brand-active">
          {
            number
          }
        </div>

        <div className="min-w-0">
          <h3 className="font-black text-ink">
            {
              title
            }
          </h3>

          <p className="mt-1 text-xs leading-6 text-ink-muted">
            {
              description
            }
          </p>
        </div>
      </div>

      {
        children
      }
    </section>
  );
}

/*
 * ============================================================
 * FIELD
 * ============================================================
 */

function Field({
  label,
  required = false,
  className = "",
  children,
}: {
  label:
    string;

  required?:
    boolean;

  className?:
    string;

  children:
    ReactNode;
}) {
  return (
    <label
      className={`block min-w-0 ${className}`}
    >
      <span className="mb-2 block text-xs font-bold text-ink-secondary">
        {
          label
        }

        {required && (
          <span className="mr-1 text-danger">
            *
          </span>
        )}
      </span>

      {
        children
      }
    </label>
  );
}

/*
 * ============================================================
 * SUMMARY ITEM
 * ============================================================
 */

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon:
    ReactNode;

  label:
    string;

  value:
    string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl bg-surface p-4">
      <div className="mt-0.5 shrink-0 text-brand-active">
        {
          icon
        }
      </div>

      <div className="min-w-0">
        <p className="text-xs text-ink-muted">
          {
            label
          }
        </p>

        <p className="mt-1 break-words text-sm font-black leading-7 text-ink">
          {
            value
          }
        </p>
      </div>
    </div>
  );
}

/*
 * ============================================================
 * MODAL INFO
 * ============================================================
 */

function ModalInfo({
  icon,
  label,
  value,
}: {
  icon:
    ReactNode;

  label:
    string;

  value:
    string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-line bg-surface-muted p-3">
      <div className="mt-0.5 shrink-0 text-brand-active">
        {
          icon
        }
      </div>

      <div className="min-w-0">
        <p className="text-xs text-ink-muted">
          {
            label
          }
        </p>

        <p className="mt-1 break-words text-sm font-black leading-6 text-ink">
          {
            value
          }
        </p>
      </div>
    </div>
  );
}