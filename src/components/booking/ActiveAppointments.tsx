"use client";

import {
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  Hash,
  Loader2,
  Phone,
  RefreshCcw,
  Trash2,
  TriangleAlert,
  UserRound,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

type ActiveAppointment = {
  trackingCode: string;

  fullName: string;

  phone: string;

  serviceId: string;

  date: string;

  time: string;

  carBrand: string;

  carModel: string;

  carYear?: string | null;

  status: AppointmentStatus;
};

type ActiveAppointmentsResponse = {
  ok: boolean;

  appointments?: ActiveAppointment[];

  message?: string;
};

type CancelResponse = {
  ok: boolean;

  message?: string;
};

/*
 * ============================================================
 * ACTIVE APPOINTMENTS
 * نوبت‌های فعال من
 * ============================================================
 *
 * Important:
 * مهم:
 *
 * LocalStorage only stores tracking codes.
 * فقط کدهای پیگیری در LocalStorage ذخیره می‌شوند.
 *
 * The actual appointment information always comes
 * from the backend/database.
 *
 * اطلاعات واقعی نوبت همیشه از بک‌اند و دیتابیس می‌آید.
 */

const STORAGE_KEY =
  "khz-active-appointment-codes";

/*
 * Custom browser event.
 *
 * Booking.tsx dispatches this event after
 * successfully creating a new appointment.
 *
 * بعد از ثبت نوبت جدید، Booking این Event
 * را ارسال می‌کند تا این بخش فوراً بروزرسانی شود.
 */
export const APPOINTMENTS_CHANGED_EVENT =
  "khz:appointments-changed";

const serviceLabels: Record<
  string,
  string
> = {
  paint:
    "کارشناسی رنگ و بدنه",

  body:
    "کارشناسی بدنه و شاسی",

  full:
    "کارشناسی کامل خودرو",
};

/*
 * Read tracking codes from localStorage.
 * خواندن کدهای پیگیری ذخیره‌شده.
 */
function getStoredCodes() {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        STORAGE_KEY,
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(
        raw,
      ) as unknown;

    if (
      !Array.isArray(
        parsed,
      )
    ) {
      return [];
    }

    return parsed.filter(
      (
        item,
      ): item is string =>
        typeof item ===
          "string" &&
        item.startsWith(
          "KHZ-",
        ),
    );
  } catch {
    return [];
  }
}

/*
 * Save codes.
 * ذخیره کدها.
 */
function setStoredCodes(
  codes: string[],
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const uniqueCodes =
    Array.from(
      new Set(
        codes,
      ),
    );

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      uniqueCodes,
    ),
  );
}

/*
 * Remove one tracking code.
 * حذف یک کد از دستگاه.
 */
function removeStoredCode(
  trackingCode: string,
) {
  const current =
    getStoredCodes();

  setStoredCodes(
    current.filter(
      (code) =>
        code !==
        trackingCode,
    ),
  );
}

/*
 * Convert date to Jalali/Persian format.
 * تبدیل تاریخ ISO به تاریخ شمسی.
 */
function formatPersianDate(
  value: string,
) {
  if (!value) {
    return "نامشخص";
  }

  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  if (
    !year ||
    !month ||
    !day
  ) {
    return value;
  }

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        12,
      ),
    );

  return new Intl.DateTimeFormat(
    "fa-IR-u-ca-persian",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone:
        "Asia/Tehran",
    },
  ).format(date);
}

/*
 * Convert digits to Persian.
 * تبدیل اعداد به فارسی.
 */
function toPersianDigits(
  value: string,
) {
  const digits =
    "۰۱۲۳۴۵۶۷۸۹";

  return value.replace(
    /\d/g,
    (digit) =>
      digits[
        Number(digit)
      ],
  );
}

function formatTime(
  value: string,
) {
  if (!value) {
    return "نامشخص";
  }

  return toPersianDigits(
    value,
  );
}

/*
 * Status configuration.
 * تنظیمات وضعیت نوبت.
 */
function getStatusData(
  status: AppointmentStatus,
) {
  switch (status) {
    case "confirmed":
      return {
        label:
          "تأیید شده",

        className:
          "border-success bg-success-soft text-success",
      };

    case "pending":
      return {
        label:
          "در انتظار تأیید",

        className:
          "border-warning bg-warning-soft text-warning",
      };

    case "completed":
      return {
        label:
          "انجام شده",

        className:
          "border-line bg-surface-muted text-ink-secondary",
      };

    case "cancelled":
      return {
        label:
          "لغو شده",

        className:
          "border-danger bg-danger-soft text-danger",
      };

    default:
      return {
        label:
          "نامشخص",

        className:
          "border-line bg-surface-muted text-ink-secondary",
      };
  }
}

export default function ActiveAppointments() {
  const [
    appointments,
    setAppointments,
  ] = useState<
    ActiveAppointment[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    cancellingCode,
    setCancellingCode,
  ] = useState<
    string | null
  >(null);

  const [
    appointmentToCancel,
    setAppointmentToCancel,
  ] = useState<
    ActiveAppointment | null
  >(null);

  const [
    cancelError,
    setCancelError,
  ] = useState("");

  /*
   * ==========================================================
   * Load active appointments from backend.
   * دریافت نوبت‌های فعال از بک‌اند.
   * ==========================================================
   */
  const loadAppointments =
    useCallback(
      async (
        manualRefresh = false,
      ) => {
        const codes =
          getStoredCodes();

        if (
          codes.length === 0
        ) {
          setAppointments(
            [],
          );

          setLoading(
            false,
          );

          setRefreshing(
            false,
          );

          setError("");

          return;
        }

        if (
          manualRefresh
        ) {
          setRefreshing(
            true,
          );
        } else {
          setLoading(
            true,
          );
        }

        setError("");

        /*
         * AbortController prevents updating state
         * after component unmount.
         *
         * برای جلوگیری از setState بعد از Unmount.
         */
        const controller =
          new AbortController();

        try {
          const response =
            await fetch(
              "/api/appointments/active",
              {
                method:
                  "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify(
                    {
                      codes,
                    },
                  ),

                signal:
                  controller.signal,

                cache:
                  "no-store",
              },
            );

          const data =
            (await response.json()) as ActiveAppointmentsResponse;

          if (
            !response.ok
          ) {
            throw new Error(
              data.message ??
                "دریافت نوبت‌ها با خطا مواجه شد.",
            );
          }

          const received =
            data.appointments ??
            [];

          /*
           * Only pending/confirmed appointments
           * are active.
           *
           * فقط نوبت‌های فعال نمایش داده می‌شوند.
           */
          const active =
            received.filter(
              (
                appointment,
              ) =>
                appointment.status ===
                  "pending" ||
                appointment.status ===
                  "confirmed",
            );

          setAppointments(
            active,
          );

          /*
           * Remove stale, cancelled and completed
           * codes from localStorage.
           *
           * حذف کدهای منقضی‌شده از LocalStorage.
           */
          setStoredCodes(
            active.map(
              (
                appointment,
              ) =>
                appointment.trackingCode,
            ),
          );
        } catch (
          requestError
        ) {
          if (
            requestError instanceof
              DOMException &&
            requestError.name ===
              "AbortError"
          ) {
            return;
          }

          setError(
            requestError instanceof
              Error
              ? requestError.message
              : "دریافت نوبت‌ها با خطا مواجه شد.",
          );
        } finally {
          setLoading(
            false,
          );

          setRefreshing(
            false,
          );
        }

        return () => {
          controller.abort();
        };
      },
      [],
    );

  /*
   * Initial load.
   * بارگذاری اولیه.
   */
  useEffect(() => {
    let active =
      true;

    const controller =
      new AbortController();

    async function load() {
      const codes =
        getStoredCodes();

      if (
        codes.length === 0
      ) {
        if (active) {
          setAppointments(
            [],
          );

          setLoading(
            false,
          );
        }

        return;
      }

      try {
        const response =
          await fetch(
            "/api/appointments/active",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    codes,
                  },
                ),

              signal:
                controller.signal,

              cache:
                "no-store",
            },
          );

        const data =
          (await response.json()) as ActiveAppointmentsResponse;

        if (!active) {
          return;
        }

        if (
          !response.ok
        ) {
          throw new Error(
            data.message ??
              "دریافت نوبت‌ها با خطا مواجه شد.",
          );
        }

        const received =
          data.appointments ??
          [];

        const activeItems =
          received.filter(
            (
              appointment,
            ) =>
              appointment.status ===
                "pending" ||
              appointment.status ===
                "confirmed",
          );

        setAppointments(
          activeItems,
        );

        setStoredCodes(
          activeItems.map(
            (
              appointment,
            ) =>
              appointment.trackingCode,
          ),
        );
      } catch (
        requestError
      ) {
        if (
          !active ||
          controller.signal
            .aborted
        ) {
          return;
        }

        setError(
          requestError instanceof
            Error
            ? requestError.message
            : "دریافت نوبت‌ها با خطا مواجه شد.",
        );
      } finally {
        if (active) {
          setLoading(
            false,
          );
        }
      }
    }

    void load();

    return () => {
      active = false;

      controller.abort();
    };
  }, []);

  /*
   * Listen for newly created appointments.
   * دریافت Event بعد از ثبت نوبت جدید.
   */
  useEffect(() => {
    function handleAppointmentsChanged() {
      void loadAppointments();
    }

    window.addEventListener(
      APPOINTMENTS_CHANGED_EVENT,
      handleAppointmentsChanged,
    );

    return () => {
      window.removeEventListener(
        APPOINTMENTS_CHANGED_EVENT,
        handleAppointmentsChanged,
      );
    };
  }, [
    loadAppointments,
  ]);

  /*
   * ==========================================================
   * Cancel appointment.
   * لغو نوبت.
   * ==========================================================
   */
  async function handleCancelAppointment() {
    if (
      !appointmentToCancel ||
      cancellingCode
    ) {
      return;
    }

    setCancellingCode(
      appointmentToCancel.trackingCode,
    );

    setCancelError(
      "",
    );

    try {
      const response =
        await fetch(
          `/api/appointments/${encodeURIComponent(
            appointmentToCancel.trackingCode,
          )}/cancel`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            /*
             * Tracking code alone should not authorize
             * cancellation.
             *
             * کد پیگیری به‌تنهایی برای لغو کافی نیست.
             */
            body:
              JSON.stringify(
                {
                  phone:
                    appointmentToCancel.phone,
                },
              ),
          },
        );

      const data =
        (await response.json()) as CancelResponse;

      if (
        !response.ok
      ) {
        throw new Error(
          data.message ??
            "لغو نوبت انجام نشد.",
        );
      }

      /*
       * Remove from UI.
       * حذف از رابط کاربری.
       */
      setAppointments(
        (
          current,
        ) =>
          current.filter(
            (
              appointment,
            ) =>
              appointment.trackingCode !==
              appointmentToCancel.trackingCode,
          ),
      );

      /*
       * Remove from localStorage.
       * حذف کد از دستگاه.
       */
      removeStoredCode(
        appointmentToCancel.trackingCode,
      );

      setAppointmentToCancel(
        null,
      );

      /*
       * Notify other components.
       * اطلاع به سایر کامپوننت‌ها.
       */
      window.dispatchEvent(
        new Event(
          APPOINTMENTS_CHANGED_EVENT,
        ),
      );
    } catch (
      requestError
    ) {
      setCancelError(
        requestError instanceof
          Error
          ? requestError.message
          : "لغو نوبت انجام نشد.",
      );
    } finally {
      setCancellingCode(
        null,
      );
    }
  }

  /*
   * ==========================================================
   * Loading
   * ==========================================================
   */
  if (loading) {
    return (
      <section
        id="active-appointments"
        className="pb-16 sm:pb-20 lg:pb-24"
      >
        <div className="site-container">
          <div className="rounded-[1.75rem] border border-line bg-surface p-6 shadow-card sm:p-7">
            <div className="flex min-h-40 items-center justify-center">
              <div className="text-center">
                <Loader2
                  size={28}
                  className="mx-auto animate-spin text-brand-active"
                />

                <p className="mt-3 text-sm font-bold text-ink-secondary">
                  در حال دریافت
                  نوبت‌های فعال...
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /*
   * If user has no stored appointments,
   * we don't need a large empty section.
   *
   * اگر هیچ نوبتی وجود ندارد،
   * سکشن اصلاً نمایش داده نمی‌شود.
   */
  if (
    appointments.length ===
      0 &&
    !error
  ) {
    return null;
  }

  return (
    <>
      <section
        id="active-appointments"
        className="pb-16 sm:pb-20 lg:pb-24"
      >
        <div className="site-container">
          <div className="rounded-[1.75rem] border border-line bg-surface p-5 shadow-card sm:p-7 lg:p-8">
            {/* =================================================
             * Header
             * ================================================= */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-sm font-black text-brand-active">
                  نوبت‌های شما
                </span>

                <h2 className="mt-2 text-2xl font-black text-ink sm:text-3xl">
                  نوبت‌های فعال من
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-secondary">
                  نوبت‌های ثبت‌شده شما
                  تا زمان انجام یا لغو
                  در این قسمت نمایش
                  داده می‌شوند.
                </p>
              </div>

              <button
                type="button"
                disabled={
                  refreshing
                }
                onClick={() =>
                  void loadAppointments(
                    true,
                  )
                }
                className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-black text-ink transition-colors hover:border-brand-border hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCcw
                  size={17}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                بروزرسانی
              </button>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mt-6 rounded-2xl border border-danger bg-danger-soft p-4"
              >
                <div className="flex items-start gap-3">
                  <TriangleAlert
                    size={20}
                    className="mt-0.5 shrink-0 text-danger"
                  />

                  <div>
                    <p className="text-sm font-black text-ink">
                      دریافت نوبت‌ها
                      انجام نشد
                    </p>

                    <p className="mt-1 text-xs leading-6 text-ink-secondary">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
             * Cards
             * ================================================= */}
            {appointments.length >
              0 && (
              <div className="mt-7 grid gap-4 lg:grid-cols-2">
                {appointments.map(
                  (
                    appointment,
                  ) => (
                    <AppointmentCard
                      key={
                        appointment.trackingCode
                      }
                      appointment={
                        appointment
                      }
                      onCancel={() => {
                        setCancelError(
                          "",
                        );

                        setAppointmentToCancel(
                          appointment,
                        );
                      }}
                    />
                  ),
                )}
              </div>
            )}

            {/* Count */}
            {appointments.length >
              0 && (
              <div className="mt-6 border-t border-line pt-5">
                <p className="text-xs leading-6 text-ink-muted">
                  شما در حال حاضر{" "}
                  <strong className="font-black text-ink">
                    {toPersianDigits(
                      String(
                        appointments.length,
                      ),
                    )}
                  </strong>{" "}
                  نوبت فعال روی این
                  دستگاه دارید.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
       * Cancel confirmation modal
       * مودال تأیید لغو
       * ===================================================== */}
      {appointmentToCancel && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-overlay p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-appointment-title"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="بستن"
            onClick={() => {
              if (
                cancellingCode
              ) {
                return;
              }

              setAppointmentToCancel(
                null,
              );

              setCancelError(
                "",
              );
            }}
            className="absolute inset-0 cursor-default"
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md rounded-[1.75rem] border border-line bg-surface p-5 shadow-float sm:p-6">
            <button
              type="button"
              disabled={Boolean(
                cancellingCode,
              )}
              onClick={() => {
                setAppointmentToCancel(
                  null,
                );

                setCancelError(
                  "",
                );
              }}
              aria-label="بستن مودال"
              className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink transition-colors hover:bg-surface-hover disabled:opacity-50"
            >
              <X
                size={18}
              />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-soft text-danger">
              <Trash2
                size={22}
              />
            </div>

            <h3
              id="cancel-appointment-title"
              className="mt-5 text-xl font-black text-ink"
            >
              لغو نوبت؟
            </h3>

            <p className="mt-2 text-sm leading-7 text-ink-secondary">
              آیا مطمئن هستید که
              می‌خواهید این نوبت را
              لغو کنید؟
            </p>

            <div className="mt-5 rounded-2xl border border-line bg-surface-muted p-4">
              <p className="text-sm font-black text-ink">
                {
                  appointmentToCancel.fullName
                }
              </p>

              <p className="mt-2 text-xs leading-6 text-ink-secondary">
                {formatPersianDate(
                  appointmentToCancel.date,
                )}
                {" — "}
                ساعت{" "}
                {formatTime(
                  appointmentToCancel.time,
                )}
              </p>

              <p
                dir="ltr"
                className="mt-2 text-right text-xs font-black tracking-wider text-ink-muted"
              >
                {
                  appointmentToCancel.trackingCode
                }
              </p>
            </div>

            {cancelError && (
              <div className="mt-4 rounded-xl border border-danger bg-danger-soft p-3">
                <p className="text-xs font-bold leading-6 text-danger">
                  {cancelError}
                </p>
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={Boolean(
                  cancellingCode,
                )}
                onClick={() => {
                  setAppointmentToCancel(
                    null,
                  );

                  setCancelError(
                    "",
                  );
                }}
                className="flex h-12 items-center justify-center rounded-xl border border-line bg-surface px-4 text-sm font-black text-ink transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                انصراف
              </button>

              <button
                type="button"
                disabled={Boolean(
                  cancellingCode,
                )}
                onClick={() =>
                  void handleCancelAppointment()
                }
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-danger bg-danger-soft px-4 text-sm font-black text-danger transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancellingCode ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    در حال لغو
                  </>
                ) : (
                  <>
                    <Trash2
                      size={17}
                    />

                    بله، لغو شود
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/*
 * ============================================================
 * APPOINTMENT CARD
 * کارت نوبت
 * ============================================================
 */
function AppointmentCard({
  appointment,
  onCancel,
}: {
  appointment: ActiveAppointment;

  onCancel: () => void;
}) {
  const status =
    getStatusData(
      appointment.status,
    );

  const serviceName =
    serviceLabels[
      appointment.serviceId
    ] ??
    "کارشناسی خودرو";

  const carName = [
    appointment.carBrand,
    appointment.carModel,
    appointment.carYear,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-line bg-surface-muted">
      {/* Top */}
      <div className="border-b border-line p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black ${status.className}`}
            >
              {status.label}
            </span>

            <h3 className="mt-3 truncate text-lg font-black text-ink">
              {
                appointment.fullName
              }
            </h3>

            <p className="mt-1 text-xs leading-6 text-ink-muted">
              {serviceName}
            </p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-active">
            <CheckCircle2
              size={21}
            />
          </div>
        </div>
      </div>

      {/* Main information */}
      <div className="p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <AppointmentInfo
            icon={
              <CalendarDays
                size={17}
              />
            }
            label="روز و تاریخ"
            value={formatPersianDate(
              appointment.date,
            )}
          />

          <AppointmentInfo
            icon={
              <Clock3
                size={17}
              />
            }
            label="ساعت مراجعه"
            value={formatTime(
              appointment.time,
            )}
          />

          <AppointmentInfo
            icon={
              <Phone
                size={17}
              />
            }
            label="شماره موبایل"
            value={
              appointment.phone
            }
            ltr
          />

          <AppointmentInfo
            icon={
              <CarFront
                size={17}
              />
            }
            label="خودرو"
            value={
              carName ||
              "ثبت نشده"
            }
          />

          <AppointmentInfo
            icon={
              <UserRound
                size={17}
              />
            }
            label="نام مراجعه‌کننده"
            value={
              appointment.fullName
            }
          />

          <AppointmentInfo
            icon={
              <Hash
                size={17}
              />
            }
            label="کد پیگیری"
            value={
              appointment.trackingCode
            }
            ltr
          />
        </div>

        {/* Important reminder */}
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-warning bg-warning-soft p-3">
          <TriangleAlert
            size={18}
            className="mt-0.5 shrink-0 text-warning"
          />

          <p className="text-xs font-bold leading-6 text-ink-secondary">
            قبل از مراجعه، بدنه
            خودرو حتماً شستشو یا
            کارواش شود.
          </p>
        </div>

        {/* Cancel */}
        <button
          type="button"
          onClick={onCancel}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-danger bg-danger-soft px-4 text-sm font-black text-danger transition-colors"
        >
          <Trash2
            size={17}
          />

          لغو نوبت
        </button>
      </div>
    </article>
  );
}

/*
 * ============================================================
 * APPOINTMENT INFO
 * ============================================================
 */
function AppointmentInfo({
  icon,
  label,
  value,
  ltr = false,
}: {
  icon:
    React.ReactNode;

  label: string;

  value: string;

  ltr?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-line bg-surface p-3">
      <div className="mt-0.5 shrink-0 text-brand-active">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] text-ink-muted">
          {label}
        </p>

        <p
          dir={
            ltr
              ? "ltr"
              : undefined
          }
          className={`mt-1 break-words text-sm font-black leading-6 text-ink ${
            ltr
              ? "text-right"
              : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}