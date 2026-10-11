"use client";

import {
  CalendarDays,
  CarFront,
  Check,
  CheckCircle2,
  Clock3,
  Filter,
  Loader2,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  X,
  XCircle,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
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
  APPOINTMENT_END_HOUR,
  APPOINTMENT_INTERVAL_MINUTES,
  APPOINTMENT_START_HOUR,
} from "@/config/appointments";

type AppointmentStatus =
  | "pending"
  | "completed"
  | "cancelled";

type Appointment = {
  id: string;
  trackingCode: string;
  fullName: string;
  phone: string;
  serviceId: string;
  date: string;
  time: string;
  carBrand: string;
  carModel: string;
  carYear: string | null;
  note: string | null;
  washConfirmed: boolean;
  status: AppointmentStatus;
  source: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  completedAt: string | null;
};

type AppointmentBlock = {
  id: string;
  blockKey: string;
  dateKey: string;
  time: string | null;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
};

type AppointmentsResponse = {
  ok: boolean;
  message?: string;
  appointments?: Appointment[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type StatusResponse = {
  ok: boolean;
  message?: string;
  appointment?: Partial<Appointment> & {
    dateKey?: string;
  };
};

type DeleteResponse = {
  ok: boolean;
  code?: string;
  message?: string;
  remainingAttempts?: number;
};

type ManualCreateResponse = {
  ok: boolean;
  code?: string;
  message?: string;
  appointment?: Partial<Appointment> & {
    id?: string;
    dateKey?: string;
  };
};

type BlocksResponse = {
  ok: boolean;
  message?: string;
  blocks?: AppointmentBlock[];
  block?: AppointmentBlock;
};

type AvailabilityResponse = {
  ok: boolean;
  message?: string;
  dayBlocked?: boolean;
  dayBlockReason?: string | null;
  bookedTimes?: string[];
  blockedTimes?: string[];
  fullTimes?: string[];
};

type PendingAction = {
  appointment: Appointment;
  status: AppointmentStatus;
};

type ViewMode =
  | "appointments"
  | "manual"
  | "schedule";

type PersianDateParts = {
  year: number;
  month: number;
  day: number;
};

const PAGE_SIZE = 30;

const services = [
  {
    id: "paint",
    title: "کارشناسی رنگ و بدنه",
  },
  {
    id: "body",
    title: "کارشناسی بدنه و شاسی",
  },
  {
    id: "full",
    title: "کارشناسی کامل خودرو",
  },
] as const;

const persianMonths = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

function readApiResponse<T>(
  response: Response,
): Promise<T> {
  return (async () => {
    const contentType =
      response.headers.get("content-type") ?? "";

    const raw =
      await response.text();

    if (
      !contentType.includes("application/json")
    ) {
      console.error(
        "ADMIN_APPOINTMENTS_NON_JSON_RESPONSE",
        {
          status: response.status,
          body: raw.slice(0, 1000),
        },
      );

      throw new Error(
        `پاسخ نامعتبر از سرور دریافت شد. HTTP ${response.status}`,
      );
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      throw new Error(
        "پاسخ سرور قابل پردازش نیست.",
      );
    }
  })();
}

function toPersianDigits(
  value: string,
) {
  const digits =
    "۰۱۲۳۴۵۶۷۸۹";

  return value.replace(
    /\d/g,
    (digit) =>
      digits[Number(digit)],
  );
}

function normalizeDigits(
  value: string,
) {
  return value
    .replace(
      /[۰-۹]/g,
      (digit) =>
        String(
          "۰۱۲۳۴۵۶۷۸۹".indexOf(digit),
        ),
    )
    .replace(
      /[٠-٩]/g,
      (digit) =>
        String(
          "٠١٢٣٤٥٦٧٨٩".indexOf(digit),
        ),
    );
}

function sanitizePhone(
  value: string,
) {
  return normalizeDigits(value)
    .replace(/\D/g, "")
    .slice(0, 11);
}

function addDaysISO(
  iso: string,
  amount: number,
) {
  const [
    year,
    month,
    day,
  ] = iso.split("-").map(Number);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day + amount,
      12,
    ),
  );

  return date
    .toISOString()
    .slice(0, 10);
}

function getPersianDateParts(
  date: Date,
): PersianDateParts {
  const parts =
    new Intl.DateTimeFormat(
      "en-US-u-ca-persian-nu-latn",
      {
        timeZone: "Asia/Tehran",
        year: "numeric",
        month: "numeric",
        day: "numeric",
      },
    ).formatToParts(date);

  return {
    year: Number(
      parts.find(
        (part) => part.type === "year",
      )?.value ?? 0,
    ),
    month: Number(
      parts.find(
        (part) => part.type === "month",
      )?.value ?? 0,
    ),
    day: Number(
      parts.find(
        (part) => part.type === "day",
      )?.value ?? 0,
    ),
  };
}

function isoToPersianParts(
  iso: string,
): PersianDateParts | null {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(iso)
  ) {
    return null;
  }

  const [
    year,
    month,
    day,
  ] = iso.split("-").map(Number);

  return getPersianDateParts(
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        12,
      ),
    ),
  );
}

function persianToISODate(
  persianYear: number,
  persianMonth: number,
  persianDay: number,
) {
  const approximateYear =
    persianYear + 621;

  const start = new Date(
    Date.UTC(
      approximateYear,
      0,
      1,
      12,
    ),
  );

  const end = new Date(
    Date.UTC(
      approximateYear + 1,
      3,
      15,
      12,
    ),
  );

  const current =
    new Date(start);

  while (
    current <= end
  ) {
    const parts =
      getPersianDateParts(current);

    if (
      parts.year === persianYear &&
      parts.month === persianMonth &&
      parts.day === persianDay
    ) {
      const year =
        current.getUTCFullYear();

      const month =
        String(
          current.getUTCMonth() + 1,
        ).padStart(2, "0");

      const day =
        String(
          current.getUTCDate(),
        ).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    current.setUTCDate(
      current.getUTCDate() + 1,
    );
  }

  return "";
}

function getPersianMonthDays(
  year: number,
  month: number,
) {
  if (
    month >= 1 &&
    month <= 6
  ) {
    return 31;
  }

  if (
    month >= 7 &&
    month <= 11
  ) {
    return 30;
  }

  if (
    month === 12
  ) {
    return persianToISODate(
      year,
      12,
      30,
    )
      ? 30
      : 29;
  }

  return 31;
}

function formatPersianDate(
  value: string,
) {
  const [
    year,
    month,
    day,
  ] = value.split("-").map(Number);

  if (
    !year ||
    !month ||
    !day
  ) {
    return value;
  }

  const date = new Date(
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
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Tehran",
    },
  ).format(date);
}

function formatPersianDateShort(
  value: string,
) {
  const [
    year,
    month,
    day,
  ] = value.split("-").map(Number);

  const date = new Date(
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
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Tehran",
    },
  ).format(date);
}

function formatPersianDateTime(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "fa-IR-u-ca-persian",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Tehran",
    },
  ).format(date);
}

function getServiceLabel(
  serviceId: string,
) {
  return services.find(
    (service) =>
      service.id === serviceId,
  )?.title ??
    "کارشناسی خودرو";
}

function getStatusLabel(
  status: AppointmentStatus,
) {
  switch (status) {
    case "pending":
      return "در انتظار";

    case "completed":
      return "انجام‌شده";

    case "cancelled":
      return "لغوشده";
  }
}

function getStatusClasses(
  status: AppointmentStatus,
) {
  switch (status) {
    case "completed":
      return "bg-success-soft text-success";

    case "cancelled":
      return "bg-danger-soft text-danger";

    case "pending":
      return "bg-warning-soft text-warning";
  }
}

function getSourceLabel(
  source: string,
) {
  return source === "admin"
    ? "ثبت مدیر"
    : "ثبت مشتری";
}

function generateAppointmentTimes() {
  const result: string[] = [];

  const start =
    APPOINTMENT_START_HOUR * 60;

  const end =
    APPOINTMENT_END_HOUR * 60;

  for (
    let minutes = start;
    minutes <= end;
    minutes += APPOINTMENT_INTERVAL_MINUTES
  ) {
    const hour =
      Math.floor(minutes / 60);

    const minute =
      minutes % 60;

    result.push(
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    );
  }

  return result;
}

function getTehranCurrentMinutes() {
  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone: "Asia/Tehran",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      },
    ).formatToParts(new Date());

  const hour = Number(
    parts.find(
      (part) => part.type === "hour",
    )?.value ?? 0,
  );

  const minute = Number(
    parts.find(
      (part) => part.type === "minute",
    )?.value ?? 0,
  );

  return hour * 60 + minute;
}

function timeToMinutes(
  value: string,
) {
  const [
    hour,
    minute,
  ] = value.split(":").map(Number);

  return hour * 60 + minute;
}

function normalizeAppointment(
  raw:
    Partial<Appointment> & {
      id?: string;
      dateKey?: string;
    },
): Appointment | null {
  if (
    !raw.id ||
    !raw.trackingCode ||
    !raw.fullName ||
    !raw.phone ||
    !raw.serviceId ||
    !(raw.date || raw.dateKey) ||
    !raw.time ||
    !raw.carBrand ||
    !raw.carModel ||
    !raw.status ||
    !raw.createdAt ||
    !raw.updatedAt
  ) {
    return null;
  }

  const status =
    raw.status === "completed" ||
    raw.status === "cancelled"
      ? raw.status
      : "pending";

  return {
    id: raw.id,
    trackingCode: raw.trackingCode,
    fullName: raw.fullName,
    phone: raw.phone,
    serviceId: raw.serviceId,
    date: raw.date ?? raw.dateKey ?? "",
    time: raw.time,
    carBrand: raw.carBrand,
    carModel: raw.carModel,
    carYear: raw.carYear ?? null,
    note: raw.note ?? null,
    washConfirmed:
      raw.washConfirmed ?? true,
    status,
    source: raw.source ?? "customer",
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    cancelledAt:
      raw.cancelledAt ?? null,
    completedAt:
      raw.completedAt ?? null,
  };
}

export default function AppointmentsManager({
  initialAppointments,
  initialTotal,
  initialToday,
  initialBlocks,
}: {
  initialAppointments: Appointment[];
  initialTotal: number;
  initialToday: string;
  initialBlocks: AppointmentBlock[];
}) {
  const router =
    useRouter();

  const [
    view,
    setView,
  ] =
    useState<ViewMode>(
      "appointments",
    );

  const [
    appointments,
    setAppointments,
  ] =
    useState<Appointment[]>(
      initialAppointments,
    );

  const [
    blocks,
    setBlocks,
  ] =
    useState<AppointmentBlock[]>(
      initialBlocks,
    );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("");

  const [
    date,
    setDate,
  ] = useState("");

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    totalPages,
    setTotalPages,
  ] = useState(
    Math.max(
      1,
      Math.ceil(
        initialTotal / PAGE_SIZE,
      ),
    ),
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    updatingCode,
    setUpdatingCode,
  ] = useState("");

  const [
    total,
    setTotal,
  ] = useState(
    initialTotal,
  );

  const [
    pendingAction,
    setPendingAction,
  ] =
    useState<PendingAction | null>(
      null,
    );

  const [
    deleteTarget,
    setDeleteTarget,
  ] =
    useState<Appointment | null>(
      null,
    );

  const [
    deletingCode,
    setDeletingCode,
  ] = useState("");

  const [
    deleteError,
    setDeleteError,
  ] = useState("");

  const requestControllerRef =
    useRef<AbortController | null>(
      null,
    );

  function redirectToLogin() {
    router.replace(
      "/admin/login",
    );

    router.refresh();
  }

  async function loadAppointments({
    signal,
    query,
    selectedStatus,
    selectedDate,
    selectedPage,
  }: {
    signal: AbortSignal;
    query: string;
    selectedStatus: string;
    selectedDate: string;
    selectedPage: number;
  }) {
    try {
      const params =
        new URLSearchParams();

      if (
        query.trim()
      ) {
        params.set(
          "q",
          query.trim(),
        );
      }

      if (
        selectedStatus
      ) {
        params.set(
          "status",
          selectedStatus,
        );
      }

      if (
        selectedDate
      ) {
        params.set(
          "date",
          selectedDate,
        );
      }

      params.set(
        "page",
        String(selectedPage),
      );

      params.set(
        "limit",
        String(PAGE_SIZE),
      );

      const response =
        await fetch(
          `/api/admin/appointments?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
            signal,
          },
        );

      if (
        response.status === 401
      ) {
        redirectToLogin();
        return;
      }

      const data =
        await readApiResponse<AppointmentsResponse>(
          response,
        );

      if (
        signal.aborted
      ) {
        return;
      }

      if (
        !response.ok ||
        !data.ok
      ) {
        setError(
          data.message ??
            "دریافت نوبت‌ها انجام نشد.",
        );
        return;
      }

      const result =
        Array.isArray(
          data.appointments,
        )
          ? data.appointments
          : [];

      setAppointments(result);
      setTotal(
        data.pagination?.total ??
          result.length,
      );
      setTotalPages(
        data.pagination?.totalPages ?? 1,
      );
      setPage(
        data.pagination?.page ??
          selectedPage,
      );
      setError("");
    } catch (requestError) {
      if (
        signal.aborted
      ) {
        return;
      }

      console.error(
        "ADMIN_LOAD_APPOINTMENTS_ERROR",
        requestError,
      );

      setError(
        requestError instanceof Error
          ? requestError.message
          : "ارتباط با سرور برقرار نشد.",
      );
    } finally {
      if (
        !signal.aborted
      ) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }

  function performLoad({
    showRefresh = false,
    clearMessages = true,
    query = search,
    selectedStatus = status,
    selectedDate = date,
    selectedPage = page,
  }: {
    showRefresh?: boolean;
    clearMessages?: boolean;
    query?: string;
    selectedStatus?: string;
    selectedDate?: string;
    selectedPage?: number;
  } = {}) {
    requestControllerRef.current?.abort();

    const controller =
      new AbortController();

    requestControllerRef.current =
      controller;

    if (
      showRefresh
    ) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    if (
      clearMessages
    ) {
      setSuccessMessage("");
    }

    void loadAppointments({
      signal: controller.signal,
      query,
      selectedStatus,
      selectedDate,
      selectedPage,
    });
  }

  function handleFilterSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setPage(1);

    performLoad({
      selectedPage: 1,
    });
  }

  function clearFilters() {
    setSearch("");
    setStatus("");
    setDate("");
    setPage(1);
    setError("");
    setSuccessMessage("");

    performLoad({
      query: "",
      selectedStatus: "",
      selectedDate: "",
      selectedPage: 1,
    });
  }

  function showToday() {
    setDate(initialToday);
    setPage(1);

    performLoad({
      selectedDate: initialToday,
      selectedPage: 1,
    });
  }

  function showPending() {
    setStatus("pending");
    setPage(1);

    performLoad({
      selectedStatus: "pending",
      selectedPage: 1,
    });
  }

  function goToPage(
    nextPage: number,
  ) {
    if (
      nextPage < 1 ||
      nextPage > totalPages ||
      loading ||
      refreshing
    ) {
      return;
    }

    setPage(nextPage);

    performLoad({
      selectedPage: nextPage,
    });
  }

  async function confirmStatusChange() {
    if (
      !pendingAction ||
      updatingCode
    ) {
      return;
    }

    const {
      appointment,
      status: nextStatus,
    } = pendingAction;

    setUpdatingCode(
      appointment.trackingCode,
    );
    setError("");
    setSuccessMessage("");

    try {
      const response =
        await fetch(
          `/api/admin/appointments/${encodeURIComponent(
            appointment.trackingCode,
          )}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              status: nextStatus,
            }),
          },
        );

      if (
        response.status === 401
      ) {
        setPendingAction(null);
        redirectToLogin();
        return;
      }

      const data =
        await readApiResponse<StatusResponse>(
          response,
        );

      if (
        !response.ok ||
        !data.ok
      ) {
        setError(
          data.message ??
            "تغییر وضعیت انجام نشد.",
        );
        setPendingAction(null);
        return;
      }

      const updated =
        data.appointment;

      if (
        updated
      ) {
        setAppointments(
          (current) =>
            current.map(
              (item) => {
                if (
                  item.trackingCode !==
                  appointment.trackingCode
                ) {
                  return item;
                }

                return {
                  ...item,
                  ...updated,
                  id: item.id,
                  date:
                    updated.date ??
                    updated.dateKey ??
                    item.date,
                  status:
                    updated.status === "completed" ||
                    updated.status === "cancelled"
                      ? updated.status
                      : "pending",
                };
              },
            ),
        );
      }

      setSuccessMessage(
        data.message ??
          "وضعیت نوبت با موفقیت تغییر کرد.",
      );

      setPendingAction(null);

      performLoad({
        showRefresh: true,
        clearMessages: false,
        selectedPage: page,
      });
    } catch (requestError) {
      console.error(
        "ADMIN_UPDATE_STATUS_ERROR",
        requestError,
      );

      setError(
        requestError instanceof Error
          ? requestError.message
          : "ارتباط با سرور برقرار نشد.",
      );

      setPendingAction(null);
    } finally {
      setUpdatingCode("");
    }
  }

  async function confirmDeleteAppointment(
    pin: string,
  ) {
    if (
      !deleteTarget ||
      deletingCode
    ) {
      return;
    }

    const normalizedPin =
      normalizeDigits(pin)
        .replace(/\D/g, "")
        .slice(0, 4);

    if (
      !/^\d{4}$/.test(
        normalizedPin,
      )
    ) {
      setDeleteError(
        "کد امنیتی حذف باید دقیقاً ۴ رقم باشد.",
      );
      return;
    }

    const target =
      deleteTarget;

    setDeletingCode(
      target.trackingCode,
    );
    setDeleteError("");
    setError("");
    setSuccessMessage("");

    try {
      const response =
        await fetch(
          `/api/admin/appointments/${encodeURIComponent(
            target.trackingCode,
          )}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              pin: normalizedPin,
            }),
          },
        );

      const data =
        await readApiResponse<DeleteResponse>(
          response,
        );

      if (
        response.status === 401 &&
        data.code ===
          "UNAUTHORIZED"
      ) {
        setDeleteTarget(null);
        redirectToLogin();
        return;
      }

      if (
        !response.ok ||
        !data.ok
      ) {
        setDeleteError(
          data.message ??
            "حذف نوبت انجام نشد.",
        );
        return;
      }

      setAppointments(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              target.id,
          ),
      );

      setTotal(
        (current) =>
          Math.max(
            0,
            current - 1,
          ),
      );

      setDeleteTarget(null);
      setDeleteError("");

      setSuccessMessage(
        data.message ??
          "نوبت با موفقیت حذف شد.",
      );

      performLoad({
        showRefresh: true,
        clearMessages: false,
        selectedPage: page,
      });
    } catch (requestError) {
      console.error(
        "ADMIN_DELETE_APPOINTMENT_ERROR",
        requestError,
      );

      setDeleteError(
        requestError instanceof Error
          ? requestError.message
          : "ارتباط با سرور برقرار نشد.",
      );
    } finally {
      setDeletingCode("");
    }
  }

  function handleManualCreated(
    appointment: Appointment,
  ) {
    setSuccessMessage(
      `نوبت دستی ${appointment.fullName} با موفقیت ثبت شد.`,
    );

    setView("appointments");
    setSearch("");
    setStatus("");
    setDate("");
    setPage(1);

    performLoad({
      clearMessages: false,
      query: "",
      selectedStatus: "",
      selectedDate: "",
      selectedPage: 1,
    });
  }

  return (
    <>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-sm font-black text-brand-active">
              مدیریت نوبت‌ها
            </span>

            <h1 className="mt-2 text-3xl font-black text-ink">
              نوبت‌های کارشناسی
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-secondary">
              ثبت و مدیریت نوبت‌ها، کنترل روزها و ساعت‌های قابل رزرو و تغییر وضعیت مراجعه‌ها.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-line bg-surface px-4 py-2.5">
              <p className="text-[10px] font-bold text-ink-muted">
                تعداد نوبت‌ها
              </p>

              <p className="mt-0.5 text-sm font-black text-ink">
                {new Intl.NumberFormat(
                  "fa-IR",
                ).format(total)}
              </p>
            </div>

            <button
              type="button"
              disabled={
                refreshing ||
                loading
              }
              onClick={() =>
                performLoad({
                  showRefresh: true,
                })
              }
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-black text-ink transition-colors hover:bg-surface-hover disabled:cursor-wait disabled:opacity-50"
            >
              <RefreshCw
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
        </div>

        <div className="mt-6 grid gap-2 rounded-[1.5rem] border border-line bg-surface p-2 shadow-card sm:grid-cols-3">
          <ViewButton
            active={
              view === "appointments"
            }
            onClick={() =>
              setView("appointments")
            }
            icon={
              <CalendarDays size={18} />
            }
            title="لیست نوبت‌ها"
            description="مشاهده و تغییر وضعیت"
          />

          <ViewButton
            active={
              view === "manual"
            }
            onClick={() =>
              setView("manual")
            }
            icon={
              <CarFront size={18} />
            }
            title="ثبت نوبت دستی"
            description="ثبت نوبت توسط مدیر"
          />

          <ViewButton
            active={
              view === "schedule"
            }
            onClick={() =>
              setView("schedule")
            }
            icon={
              <Clock3 size={18} />
            }
            title="مدیریت زمان‌ها"
            description="بستن روز یا ساعت"
          />
        </div>

        {successMessage && (
          <div
            role="status"
            className="mt-5 flex items-start gap-3 rounded-xl border border-success bg-success-soft p-4"
          >
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0 text-success"
            />

            <p className="text-sm font-bold leading-7 text-success">
              {successMessage}
            </p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-xl border border-danger bg-danger-soft p-4"
          >
            <TriangleAlert
              size={19}
              className="mt-0.5 shrink-0 text-danger"
            />

            <p className="text-sm font-bold leading-7 text-ink-secondary">
              {error}
            </p>
          </div>
        )}

        {view === "appointments" && (
          <>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={
                  loading ||
                  refreshing
                }
                onClick={showToday}
                className={
                  date === initialToday
                    ? "h-10 rounded-xl bg-brand px-4 text-xs font-black text-on-brand"
                    : "h-10 rounded-xl border border-line bg-surface px-4 text-xs font-black text-ink hover:bg-surface-hover"
                }
              >
                نوبت‌های امروز
              </button>

              <button
                type="button"
                disabled={
                  loading ||
                  refreshing
                }
                onClick={showPending}
                className={
                  status === "pending"
                    ? "h-10 rounded-xl bg-warning px-4 text-xs font-black text-on-brand"
                    : "h-10 rounded-xl border border-line bg-surface px-4 text-xs font-black text-ink hover:bg-surface-hover"
                }
              >
                در انتظار
              </button>

              {(search ||
                status ||
                date) && (
                <button
                  type="button"
                  disabled={
                    loading ||
                    refreshing
                  }
                  onClick={clearFilters}
                  className="h-10 rounded-xl border border-line bg-surface px-4 text-xs font-black text-ink-muted hover:bg-surface-hover hover:text-ink"
                >
                  نمایش همه
                </button>
              )}
            </div>

            <form
              onSubmit={
                handleFilterSubmit
              }
              className="mt-5 rounded-[1.5rem] border border-line bg-surface p-4 shadow-card sm:p-5"
            >
              <div className="flex items-center gap-2">
                <Filter
                  size={18}
                  className="text-brand-active"
                />

                <h2 className="font-black text-ink">
                  جستجو و فیلتر
                </h2>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="flex h-11 items-center overflow-hidden rounded-xl border border-line bg-input transition-colors focus-within:border-focus focus-within:ring-4 focus-within:ring-brand-soft">
                  <div className="pointer-events-none flex w-11 shrink-0 items-center justify-center">
                    <Search
                      size={18}
                      className="text-ink-muted"
                    />
                  </div>

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    placeholder="نام، شماره، کد یا خودرو"
                    className="h-full min-w-0 flex-1 bg-transparent pl-3 text-sm text-ink outline-none placeholder:text-placeholder"
                  />
                </div>

                <select
                  value={status}
                  onChange={(event) => {
                    const nextStatus =
                      event.target.value;

                    setStatus(nextStatus);
                    setPage(1);

                    performLoad({
                      selectedStatus:
                        nextStatus,
                      selectedPage: 1,
                    });
                  }}
                  className="h-11 rounded-xl border border-line bg-input px-4 text-sm font-bold text-ink outline-none focus:border-focus focus:ring-4 focus:ring-brand-soft"
                >
                  <option value="">
                    همه وضعیت‌ها
                  </option>
                  <option value="pending">
                    در انتظار
                  </option>
                  <option value="completed">
                    انجام‌شده
                  </option>
                  <option value="cancelled">
                    لغوشده
                  </option>
                </select>

                <PersianDatePicker
                  key={`${date || "empty-date"}-${initialToday}`}
                  value={date}
                  todayISO={initialToday}
                  onChange={setDate}
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      refreshing
                    }
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-black text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Search size={16} />
                    )}
                    اعمال
                  </button>

                  <button
                    type="button"
                    disabled={
                      loading ||
                      refreshing
                    }
                    onClick={clearFilters}
                    className="h-11 rounded-xl border border-line bg-surface px-4 text-sm font-black text-ink hover:bg-surface-hover disabled:opacity-50"
                  >
                    پاک کردن
                  </button>
                </div>
              </div>
            </form>

            {loading ? (
              <LoadingPanel label="در حال دریافت نوبت‌ها..." />
            ) : appointments.length === 0 ? (
              <EmptyPanel
                icon={
                  <CalendarDays size={30} />
                }
                title="نوبتی پیدا نشد"
                description="فیلترها را تغییر دهید یا نمایش همه را انتخاب کنید."
              />
            ) : (
              <div className="mt-7 space-y-4">
                {appointments.map(
                  (appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      updating={
                        updatingCode ===
                        appointment.trackingCode
                      }
                      deleting={
                        deletingCode ===
                        appointment.trackingCode
                      }
                      onStatusChange={(nextStatus) => {
                        setSuccessMessage("");
                        setError("");

                        setPendingAction({
                          appointment,
                          status: nextStatus,
                        });
                      }}
                      onDelete={() => {
                        setSuccessMessage("");
                        setError("");
                        setDeleteError("");
                        setDeleteTarget(
                          appointment,
                        );
                      }}
                    />
                  ),
                )}
              </div>
            )}

            {!loading &&
              total > 0 && (
                <div className="mt-7 flex flex-col gap-3 rounded-[1.25rem] border border-line bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-center text-xs font-bold text-ink-muted sm:text-right">
                    صفحه{" "}
                    <span className="font-black text-ink">
                      {toPersianDigits(
                        String(page),
                      )}
                    </span>{" "}
                    از{" "}
                    <span className="font-black text-ink">
                      {toPersianDigits(
                        String(totalPages),
                      )}
                    </span>
                  </p>

                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    <button
                      type="button"
                      disabled={
                        page <= 1 ||
                        refreshing
                      }
                      onClick={() =>
                        goToPage(
                          page - 1,
                        )
                      }
                      className="h-10 rounded-xl border border-line bg-surface px-5 text-xs font-black text-ink hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      صفحه قبل
                    </button>

                    <button
                      type="button"
                      disabled={
                        page >= totalPages ||
                        refreshing
                      }
                      onClick={() =>
                        goToPage(
                          page + 1,
                        )
                      }
                      className="h-10 rounded-xl bg-brand px-5 text-xs font-black text-on-brand hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      صفحه بعد
                    </button>
                  </div>
                </div>
              )}
          </>
        )}

        {view === "manual" && (
          <ManualAppointmentForm
            todayISO={initialToday}
            onCreated={
              handleManualCreated
            }
            onUnauthorized={
              redirectToLogin
            }
          />
        )}

        {view === "schedule" && (
          <ScheduleManager
            todayISO={initialToday}
            blocks={blocks}
            setBlocks={setBlocks}
            onUnauthorized={
              redirectToLogin
            }
          />
        )}
      </div>

      {pendingAction && (
        <StatusConfirmationModal
          key={`${pendingAction.appointment.trackingCode}-${pendingAction.status}`}
          action={pendingAction}
          loading={
            updatingCode ===
            pendingAction.appointment.trackingCode
          }
          onClose={() => {
            if (
              updatingCode
            ) {
              return;
            }

            setPendingAction(null);
          }}
          onConfirm={() =>
            void confirmStatusChange()
          }
        />
      )}

      {deleteTarget && (
        <DeleteAppointmentModal
          key={
            deleteTarget.trackingCode
          }
          appointment={
            deleteTarget
          }
          loading={
            deletingCode ===
            deleteTarget.trackingCode
          }
          error={deleteError}
          onClose={() => {
            if (deletingCode) {
              return;
            }

            setDeleteTarget(null);
            setDeleteError("");
          }}
          onConfirm={(pin) =>
            void confirmDeleteAppointment(
              pin,
            )
          }
        />
      )}
    </>
  );
}

function ViewButton({
  active,
  onClick,
  icon,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-[1.2rem] p-4 text-right transition-colors ${
        active
          ? "bg-brand text-on-brand"
          : "bg-surface text-ink hover:bg-surface-hover"
      }`}
    >
      <span
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          active
            ? "bg-surface text-brand-active"
            : "bg-brand-soft text-brand-active"
        }`}
      >
        {icon}
      </span>

      <span>
        <span className="block text-sm font-black">
          {title}
        </span>
        <span
          className={`mt-1 block text-xs leading-5 ${
            active
              ? "text-on-brand"
              : "text-ink-muted"
          }`}
        >
          {description}
        </span>
      </span>
    </button>
  );
}

function ManualAppointmentForm({
  todayISO,
  onCreated,
  onUnauthorized,
}: {
  todayISO: string;
  onCreated: (
    appointment: Appointment,
  ) => void;
  onUnauthorized: () => void;
}) {
  const dateOptions =
    useMemo(
      () =>
        Array.from(
          {
            length:
              APPOINTMENT_BOOKING_DAYS,
          },
          (_, index) =>
            addDaysISO(
              todayISO,
              index,
            ),
        ),
      [todayISO],
    );

  const times =
    useMemo(
      () =>
        generateAppointmentTimes(),
      [],
    );

  const [
    form,
    setForm,
  ] = useState({
    fullName: "",
    phone: "",
    serviceId: "full",
    dateKey: "",
    time: "",
    carBrand: "",
    carModel: "",
    carYear: "",
    note: "",
  });

  const [
    availability,
    setAvailability,
  ] = useState<AvailabilityResponse | null>(
    null,
  );

  const [
    loadingAvailability,
    setLoadingAvailability,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  async function selectDate(
    dateKey: string,
  ) {
    setForm(
      (current) => ({
        ...current,
        dateKey,
        time: "",
      }),
    );

    setAvailability(null);
    setLoadingAvailability(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/appointments/availability?date=${encodeURIComponent(
            dateKey,
          )}`,
          {
            cache: "no-store",
          },
        );

      const data =
        await readApiResponse<AvailabilityResponse>(
          response,
        );

      if (
        !response.ok ||
        !data.ok
      ) {
        setError(
          data.message ??
            "دریافت ساعت‌های آزاد انجام نشد.",
        );
        return;
      }

      setAvailability(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "ارتباط با سرور برقرار نشد.",
      );
    } finally {
      setLoadingAvailability(false);
    }
  }

  function isPastSlot(
    time: string,
  ) {
    if (
      form.dateKey !== todayISO
    ) {
      return false;
    }

    return (
      timeToMinutes(time) <=
      getTehranCurrentMinutes()
    );
  }

  const ready =
    Boolean(
      form.fullName.trim().length >= 2 &&
      /^09\d{9}$/.test(form.phone) &&
      form.serviceId &&
      form.dateKey &&
      form.time &&
      form.carBrand.trim() &&
      form.carModel.trim() &&
      !availability?.dayBlocked &&
      !availability?.fullTimes?.includes(
        form.time,
      ) &&
      !isPastSlot(form.time),
    );

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !ready ||
      submitting
    ) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response =
        await fetch(
          "/api/admin/appointments/manual",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(form),
          },
        );

      if (
        response.status === 401
      ) {
        onUnauthorized();
        return;
      }

      const data =
        await readApiResponse<ManualCreateResponse>(
          response,
        );

      if (
        !response.ok ||
        !data.ok ||
        !data.appointment
      ) {
        setError(
          data.message ??
            "ثبت نوبت دستی انجام نشد.",
        );
        return;
      }

      const appointment =
        normalizeAppointment(
          data.appointment,
        );

      if (
        !appointment
      ) {
        setError(
          "اطلاعات نوبت ثبت‌شده از سرور کامل دریافت نشد.",
        );
        return;
      }

      setForm({
        fullName: "",
        phone: "",
        serviceId: "full",
        dateKey: "",
        time: "",
        carBrand: "",
        carModel: "",
        carYear: "",
        note: "",
      });

      setAvailability(null);
      onCreated(appointment);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "ارتباط با سرور برقرار نشد.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-6 rounded-[1.75rem] border border-line bg-surface p-4 shadow-card sm:p-6">
      <div>
        <span className="text-xs font-black text-brand-active">
          ثبت توسط مدیر
        </span>
        <h2 className="mt-2 text-xl font-black text-ink">
          ثبت نوبت دستی
        </h2>
        <p className="mt-2 text-sm leading-7 text-ink-secondary">
          نوبت ثبت‌شده توسط مدیر همان ساعت را برای مشتریان سایت نیز اشغال می‌کند و امکان رزرو هم‌زمان وجود ندارد.
        </p>
      </div>

      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-danger bg-danger-soft p-4">
          <TriangleAlert
            size={18}
            className="mt-0.5 shrink-0 text-danger"
          />
          <p className="text-sm font-bold leading-7 text-ink-secondary">
            {error}
          </p>
        </div>
      )}

      <form
        onSubmit={submit}
        className="mt-6"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AdminField label="نام و نام خانوادگی">
            <input
              value={
                form.fullName
              }
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    fullName:
                      event.target.value,
                  }),
                )
              }
              className={inputClassName}
              placeholder="مثلاً علی رضایی"
            />
          </AdminField>

          <AdminField label="شماره موبایل">
            <input
              dir="ltr"
              value={form.phone}
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    phone: sanitizePhone(
                      event.target.value,
                    ),
                  }),
                )
              }
              className={`${inputClassName} text-left`}
              placeholder="09123456789"
            />
          </AdminField>

          <AdminField label="نوع کارشناسی">
            <select
              value={form.serviceId}
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    serviceId:
                      event.target.value,
                  }),
                )
              }
              className={inputClassName}
            >
              {services.map(
                (service) => (
                  <option
                    key={service.id}
                    value={service.id}
                  >
                    {service.title}
                  </option>
                ),
              )}
            </select>
          </AdminField>

          <AdminField label="برند خودرو">
            <input
              value={form.carBrand}
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    carBrand:
                      event.target.value,
                  }),
                )
              }
              className={inputClassName}
              placeholder="مثلاً پژو"
            />
          </AdminField>

          <AdminField label="مدل خودرو">
            <input
              value={form.carModel}
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    carModel:
                      event.target.value,
                  }),
                )
              }
              className={inputClassName}
              placeholder="مثلاً 207"
            />
          </AdminField>

          <AdminField label="سال خودرو - اختیاری">
            <input
              value={form.carYear}
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    carYear:
                      normalizeDigits(
                        event.target.value,
                      )
                        .replace(/\D/g, "")
                        .slice(0, 4),
                  }),
                )
              }
              className={inputClassName}
              placeholder="1402"
            />
          </AdminField>
        </div>

        <div className="mt-6">
          <p className="text-sm font-black text-ink">
            تاریخ مراجعه
          </p>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {dateOptions.map(
              (dateKey) => {
                const selected =
                  form.dateKey === dateKey;

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() =>
                      void selectDate(dateKey)
                    }
                    className={`min-w-[118px] shrink-0 rounded-xl border px-3 py-3 text-right transition-colors ${
                      selected
                        ? "border-brand bg-brand-soft"
                        : "border-line bg-surface hover:border-brand-border hover:bg-surface-hover"
                    }`}
                  >
                    <span className="block text-xs font-black text-ink">
                      {dateKey === todayISO
                        ? "امروز"
                        : formatPersianDateShort(
                            dateKey,
                          )}
                    </span>
                    <span
                      dir="ltr"
                      className="mt-1 block text-left text-[10px] font-bold text-ink-muted"
                    >
                      {dateKey}
                    </span>
                  </button>
                );
              },
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-black text-ink">
              ساعت مراجعه
            </p>

            {loadingAvailability && (
              <span className="flex items-center gap-2 text-xs font-bold text-ink-muted">
                <Loader2
                  size={14}
                  className="animate-spin"
                />
                در حال بررسی
              </span>
            )}
          </div>

          {availability?.dayBlocked && (
            <div className="mt-3 rounded-xl border border-warning bg-warning-soft p-3 text-xs font-bold leading-6 text-ink-secondary">
              این روز توسط مدیر برای رزرو بسته شده است
              {availability.dayBlockReason
                ? `: ${availability.dayBlockReason}`
                : "."}
            </div>
          )}

          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-9">
            {times.map(
              (time) => {
                const past =
                  isPastSlot(time);

                const unavailable =
                  availability?.fullTimes?.includes(
                    time,
                  ) ?? false;

                const disabled =
                  !form.dateKey ||
                  loadingAvailability ||
                  availability?.dayBlocked ||
                  past ||
                  unavailable;

                const selected =
                  form.time === time;

                return (
                  <button
                    key={time}
                    type="button"
                    disabled={Boolean(disabled)}
                    onClick={() =>
                      setForm(
                        (current) => ({
                          ...current,
                          time,
                        }),
                      )
                    }
                    className={`h-11 rounded-xl border text-xs font-black transition-colors ${
                      selected
                        ? "border-brand bg-brand text-on-brand"
                        : disabled
                          ? "border-line bg-surface-muted text-ink-soft"
                          : "border-line bg-surface text-ink hover:border-brand-border hover:bg-brand-soft"
                    } disabled:cursor-not-allowed`}
                  >
                    {toPersianDigits(time)}
                  </button>
                );
              },
            )}
          </div>
        </div>

        <AdminField
          label="توضیحات - اختیاری"
          className="mt-6"
        >
          <textarea
            rows={4}
            value={form.note}
            onChange={(event) =>
              setForm(
                (current) => ({
                  ...current,
                  note:
                    event.target.value,
                }),
              )
            }
            className="w-full resize-none rounded-xl border border-line bg-input px-4 py-3 text-sm leading-7 text-ink outline-none placeholder:text-placeholder focus:border-focus focus:ring-4 focus:ring-brand-soft"
            placeholder="توضیح داخلی یا اطلاعات تکمیلی نوبت..."
          />
        </AdminField>

        <button
          type="submit"
          disabled={
            !ready ||
            submitting
          }
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-black text-on-brand hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {submitting ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <Check size={17} />
          )}
          ثبت نوبت دستی
        </button>
      </form>
    </section>
  );
}

function ScheduleManager({
  todayISO,
  blocks,
  setBlocks,
  onUnauthorized,
}: {
  todayISO: string;
  blocks: AppointmentBlock[];
  setBlocks: (
    value:
      | AppointmentBlock[]
      | ((
          current: AppointmentBlock[],
        ) => AppointmentBlock[]),
  ) => void;
  onUnauthorized: () => void;
}) {
  const dateOptions =
    useMemo(
      () =>
        Array.from(
          {
            length:
              APPOINTMENT_BOOKING_DAYS,
          },
          (_, index) =>
            addDaysISO(
              todayISO,
              index,
            ),
        ),
      [todayISO],
    );

  const times =
    useMemo(
      () =>
        generateAppointmentTimes(),
      [],
    );

  const [
    selectedDate,
    setSelectedDate,
  ] = useState("");

  const [
    availability,
    setAvailability,
  ] = useState<AvailabilityResponse | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    mutating,
    setMutating,
  ] = useState("");

  const [
    reason,
    setReason,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const selectedBlocks =
    blocks.filter(
      (block) =>
        block.dateKey ===
        selectedDate,
    );

  const dayBlock =
    selectedBlocks.find(
      (block) =>
        block.time === null,
    );

  function getTimeBlock(
    time: string,
  ) {
    return selectedBlocks.find(
      (block) =>
        block.time === time,
    );
  }

  async function loadAvailability(
    dateKey: string,
  ) {
    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/appointments/availability?date=${encodeURIComponent(
            dateKey,
          )}`,
          {
            cache: "no-store",
          },
        );

      const data =
        await readApiResponse<AvailabilityResponse>(
          response,
        );

      if (
        !response.ok ||
        !data.ok
      ) {
        setError(
          data.message ??
            "دریافت وضعیت روز انجام نشد.",
        );
        return;
      }

      setAvailability(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "ارتباط با سرور برقرار نشد.",
      );
    } finally {
      setLoading(false);
    }
  }

  function selectDate(
    dateKey: string,
  ) {
    setSelectedDate(dateKey);
    setAvailability(null);
    setError("");
    setSuccess("");
    void loadAvailability(dateKey);
  }

  function isPastSlot(
    time: string,
  ) {
    if (
      selectedDate !== todayISO
    ) {
      return false;
    }

    return (
      timeToMinutes(time) <=
      getTehranCurrentMinutes()
    );
  }

  async function createBlock(
    time: string | null,
  ) {
    if (
      !selectedDate ||
      mutating
    ) {
      return;
    }

    const mutationKey =
      time ?? "ALL";

    setMutating(mutationKey);
    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          "/api/admin/appointment-blocks",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              dateKey: selectedDate,
              time:
                time ?? "",
              reason,
            }),
          },
        );

      if (
        response.status === 401
      ) {
        onUnauthorized();
        return;
      }

      const data =
        await readApiResponse<BlocksResponse>(
          response,
        );

      if (
        !response.ok ||
        !data.ok ||
        !data.block
      ) {
        setError(
          data.message ??
            "بستن زمان انجام نشد.",
        );
        return;
      }

      setBlocks(
        (current) => [
          ...current.filter(
            (item) =>
              item.id !==
              data.block!.id &&
              item.blockKey !==
              data.block!.blockKey,
          ),
          data.block!,
        ],
      );

      setSuccess(
        data.message ??
          "زمان موردنظر بسته شد.",
      );

      await loadAvailability(
        selectedDate,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "ارتباط با سرور برقرار نشد.",
      );
    } finally {
      setMutating("");
    }
  }

  async function deleteBlock(
    block: AppointmentBlock,
  ) {
    if (
      mutating
    ) {
      return;
    }

    setMutating(block.id);
    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          `/api/admin/appointment-blocks/${encodeURIComponent(
            block.id,
          )}`,
          {
            method: "DELETE",
          },
        );

      if (
        response.status === 401
      ) {
        onUnauthorized();
        return;
      }

      const data =
        await readApiResponse<BlocksResponse>(
          response,
        );

      if (
        !response.ok ||
        !data.ok
      ) {
        setError(
          data.message ??
            "باز کردن زمان انجام نشد.",
        );
        return;
      }

      setBlocks(
        (current) =>
          current.filter(
            (item) =>
              item.id !== block.id,
          ),
      );

      setSuccess(
        data.message ??
          "زمان دوباره باز شد.",
      );

      if (
        selectedDate
      ) {
        await loadAvailability(
          selectedDate,
        );
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "ارتباط با سرور برقرار نشد.",
      );
    } finally {
      setMutating("");
    }
  }

  return (
    <section className="mt-6 rounded-[1.75rem] border border-line bg-surface p-4 shadow-card sm:p-6">
      <div>
        <span className="text-xs font-black text-brand-active">
          کنترل ظرفیت
        </span>
        <h2 className="mt-2 text-xl font-black text-ink">
          مدیریت روزها و ساعت‌های رزرو
        </h2>
        <p className="mt-2 text-sm leading-7 text-ink-secondary">
          می‌توانید هر روز از بازه ۱۴ روز آینده را کامل ببندید یا فقط ساعت‌های مشخصی از آن روز را غیرفعال کنید. نوبت‌های قبلاً ثبت‌شده حذف نمی‌شوند.
        </p>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {dateOptions.map(
          (dateKey) => {
            const dateBlocks =
              blocks.filter(
                (block) =>
                  block.dateKey ===
                  dateKey,
              );

            const isDayBlocked =
              dateBlocks.some(
                (block) =>
                  block.time === null,
              );

            const selected =
              selectedDate === dateKey;

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() =>
                  selectDate(dateKey)
                }
                className={`relative min-w-[128px] shrink-0 rounded-xl border px-3 py-3 text-right transition-colors ${
                  selected
                    ? "border-brand bg-brand-soft"
                    : "border-line bg-surface hover:border-brand-border hover:bg-surface-hover"
                }`}
              >
                <span className="block text-xs font-black text-ink">
                  {dateKey === todayISO
                    ? "امروز"
                    : formatPersianDateShort(
                        dateKey,
                      )}
                </span>

                <span
                  dir="ltr"
                  className="mt-1 block text-left text-[10px] font-bold text-ink-muted"
                >
                  {dateKey}
                </span>

                {isDayBlocked ? (
                  <span className="mt-2 inline-flex rounded-full bg-danger-soft px-2 py-1 text-[9px] font-black text-danger">
                    روز بسته
                  </span>
                ) : dateBlocks.length > 0 ? (
                  <span className="mt-2 inline-flex rounded-full bg-warning-soft px-2 py-1 text-[9px] font-black text-warning">
                    {toPersianDigits(
                      String(
                        dateBlocks.filter(
                          (item) =>
                            item.time,
                        ).length,
                      ),
                    )}{" "}
                    ساعت بسته
                  </span>
                ) : null}
              </button>
            );
          },
        )}
      </div>

      {!selectedDate ? (
        <div className="mt-6 rounded-xl bg-surface-muted p-5 text-center text-sm font-bold text-ink-muted">
          برای مدیریت ظرفیت، ابتدا یک روز را انتخاب کنید.
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <div className="flex flex-col gap-3 rounded-[1.25rem] border border-line bg-surface-muted p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-ink">
                    {formatPersianDate(
                      selectedDate,
                    )}
                  </p>
                  <p className="mt-1 text-xs leading-6 text-ink-muted">
                    وضعیت هر ساعت را می‌توانید جداگانه تغییر دهید.
                  </p>
                </div>

                {dayBlock ? (
                  <button
                    type="button"
                    disabled={Boolean(mutating)}
                    onClick={() =>
                      void deleteBlock(
                        dayBlock,
                      )
                    }
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-success bg-success-soft px-4 text-xs font-black text-success disabled:opacity-50"
                  >
                    {mutating === dayBlock.id ? (
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <Check size={15} />
                    )}
                    باز کردن کل روز
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={Boolean(mutating)}
                    onClick={() =>
                      void createBlock(null)
                    }
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-danger bg-danger-soft px-4 text-xs font-black text-danger disabled:opacity-50"
                  >
                    {mutating === "ALL" ? (
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <XCircle size={15} />
                    )}
                    بستن کل روز
                  </button>
                )}
              </div>

              {loading ? (
                <LoadingPanel label="در حال دریافت وضعیت ساعت‌ها..." compact />
              ) : (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-7">
                  {times.map(
                    (time) => {
                      const block =
                        getTimeBlock(time);

                      const booked =
                        availability?.bookedTimes?.includes(
                          time,
                        ) ?? false;

                      const past =
                        isPastSlot(time);

                      const dayClosed =
                        Boolean(dayBlock);

                      let label =
                        "آزاد";

                      let className =
                        "border-line bg-surface text-ink hover:border-brand-border hover:bg-brand-soft";

                      if (
                        past
                      ) {
                        label = "گذشته";
                        className =
                          "border-line bg-surface-muted text-ink-soft";
                      } else if (
                        booked
                      ) {
                        label = "رزرو شده";
                        className =
                          "border-brand-border bg-brand-soft text-brand-active";
                      } else if (
                        block
                      ) {
                        label = "بسته";
                        className =
                          "border-danger bg-danger-soft text-danger";
                      } else if (
                        dayClosed
                      ) {
                        label = "روز بسته";
                        className =
                          "border-warning bg-warning-soft text-warning";
                      }

                      const disabled =
                        Boolean(mutating) ||
                        past ||
                        booked ||
                        dayClosed;

                      return (
                        <button
                          key={time}
                          type="button"
                          disabled={
                            block
                              ? Boolean(mutating) ||
                                booked ||
                                dayClosed
                              : disabled
                          }
                          onClick={() => {
                            if (
                              block
                            ) {
                              void deleteBlock(
                                block,
                              );
                              return;
                            }

                            void createBlock(time);
                          }}
                          className={`rounded-xl border p-2.5 text-center transition-colors ${className} disabled:cursor-not-allowed`}
                        >
                          <span className="block text-xs font-black">
                            {toPersianDigits(time)}
                          </span>
                          <span className="mt-1 block text-[9px] font-bold">
                            {mutating === time ||
                            mutating === block?.id
                              ? "..."
                              : label}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              )}
            </div>

            <aside className="rounded-[1.25rem] border border-line bg-surface-muted p-4">
              <p className="text-sm font-black text-ink">
                توضیح محدودیت
              </p>
              <p className="mt-1 text-xs leading-6 text-ink-muted">
                اختیاری است و برای یادآوری خود مدیر ذخیره می‌شود.
              </p>

              <textarea
                rows={4}
                value={reason}
                onChange={(event) =>
                  setReason(
                    event.target.value,
                  )
                }
                placeholder="مثلاً تعطیلی، سرویس تجهیزات یا عدم حضور..."
                className="mt-3 w-full resize-none rounded-xl border border-line bg-input px-3 py-3 text-sm leading-7 text-ink outline-none placeholder:text-placeholder focus:border-focus focus:ring-4 focus:ring-brand-soft"
              />

              <div className="mt-4 space-y-2 text-xs leading-6 text-ink-secondary">
                <p>
                  • نوبت‌های رزروشده با بستن کل روز حذف نمی‌شوند.
                </p>
                <p>
                  • ساعت رزروشده را نمی‌توان به‌عنوان ساعت بسته ثبت کرد.
                </p>
                <p>
                  • باز کردن کل روز، محدودیت‌های ساعتی قبلی را حذف نمی‌کند.
                </p>
              </div>
            </aside>
          </div>

          {success && (
            <div className="mt-5 rounded-xl border border-success bg-success-soft p-4 text-sm font-bold text-success">
              {success}
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl border border-danger bg-danger-soft p-4 text-sm font-bold text-ink-secondary">
              {error}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function AppointmentCard({
  appointment,
  updating,
  deleting,
  onStatusChange,
  onDelete,
}: {
  appointment: Appointment;
  updating: boolean;
  deleting: boolean;
  onStatusChange: (
    status: AppointmentStatus,
  ) => void;
  onDelete: () => void;
}) {
  const vehicle = [
    appointment.carBrand,
    appointment.carModel,
    appointment.carYear,
  ]
    .filter(Boolean)
    .join(" ");

  const terminalDate =
    appointment.completedAt
      ? `انجام: ${formatPersianDateTime(
          appointment.completedAt,
        )}`
      : appointment.cancelledAt
        ? `لغو: ${formatPersianDateTime(
            appointment.cancelledAt,
          )}`
        : null;

  return (
    <article className="rounded-[1.5rem] border border-line bg-surface p-5 shadow-card sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-black text-ink">
              {appointment.fullName}
            </h2>

            <span
              className={`rounded-full px-3 py-1.5 text-[11px] font-black ${getStatusClasses(
                appointment.status,
              )}`}
            >
              {getStatusLabel(
                appointment.status,
              )}
            </span>

            <span className="rounded-full bg-surface-muted px-3 py-1.5 text-[10px] font-black text-ink-muted">
              {getSourceLabel(
                appointment.source,
              )}
            </span>
          </div>

          <p className="mt-1 text-sm font-bold text-ink-secondary">
            {getServiceLabel(
              appointment.serviceId,
            )}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              icon={
                <CalendarDays size={18} />
              }
              label="تاریخ مراجعه"
              value={formatPersianDate(
                appointment.date,
              )}
            />

            <InfoItem
              icon={
                <Clock3 size={18} />
              }
              label="ساعت"
              value={toPersianDigits(
                appointment.time,
              )}
            />

            <InfoItem
              icon={
                <Phone size={18} />
              }
              label="شماره موبایل"
              value={appointment.phone}
              ltr
            />

            <InfoItem
              icon={
                <CarFront size={18} />
              }
              label="خودرو"
              value={vehicle || "-"}
            />
          </div>

          {appointment.note && (
            <div className="mt-4 rounded-xl bg-surface-muted p-4">
              <p className="text-[11px] font-bold text-ink-muted">
                توضیحات
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-ink-secondary">
                {appointment.note}
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <div className="rounded-xl border border-brand-border bg-brand-soft px-4 py-3">
              <p className="text-[10px] font-bold text-ink-muted">
                کد پیگیری
              </p>

              <p
                dir="ltr"
                className="mt-1 text-left text-sm font-black tracking-wider text-ink"
              >
                {appointment.trackingCode}
              </p>
            </div>

            <div className="rounded-xl bg-surface-muted px-4 py-3">
              <p className="text-[10px] font-bold text-ink-muted">
                شستشوی خودرو
              </p>

              <div className="mt-1 flex items-center gap-1.5 text-sm font-black text-ink">
                <ShieldCheck
                  size={15}
                  className={
                    appointment.washConfirmed
                      ? "text-success"
                      : "text-warning"
                  }
                />

                {appointment.washConfirmed
                  ? "تأیید شده"
                  : "تأیید نشده"}
              </div>
            </div>

            {terminalDate && (
              <div className="rounded-xl bg-surface-muted px-4 py-3 text-xs font-bold text-ink-secondary">
                {terminalDate}
              </div>
            )}
          </div>
        </div>

        <div className="w-full shrink-0 xl:w-60">
          <p className="mb-3 text-xs font-black text-ink-muted">
            تغییر وضعیت
          </p>

          <div className="grid grid-cols-3 gap-2 xl:grid-cols-1">
            {([
              "pending",
              "completed",
              "cancelled",
            ] as const).map(
              (nextStatus) => {
                const active =
                  appointment.status ===
                  nextStatus;

                const label =
                  getStatusLabel(nextStatus);

                const className =
                  nextStatus === "completed"
                    ? active
                      ? "border-success bg-success text-on-brand"
                      : "border-success bg-success-soft text-success"
                    : nextStatus === "cancelled"
                      ? active
                        ? "border-danger bg-danger text-on-brand"
                        : "border-danger bg-danger-soft text-danger"
                      : active
                        ? "border-warning bg-warning text-on-brand"
                        : "border-warning bg-warning-soft text-warning";

                return (
                  <button
                    key={nextStatus}
                    type="button"
                    disabled={
                      updating ||
                      deleting ||
                      active
                    }
                    onClick={() =>
                      onStatusChange(
                        nextStatus,
                      )
                    }
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-black transition-opacity disabled:cursor-not-allowed ${className} disabled:opacity-60`}
                  >
                    {updating ? (
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                    ) : nextStatus === "completed" ? (
                      <CheckCircle2 size={15} />
                    ) : nextStatus === "cancelled" ? (
                      <XCircle size={15} />
                    ) : (
                      <Clock3 size={15} />
                    )}
                    {label}
                  </button>
                );
              },
            )}
          </div>

          <button
            type="button"
            disabled={
              updating ||
              deleting
            }
            onClick={onDelete}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-danger bg-danger-soft px-3 text-xs font-black text-danger transition-colors hover:bg-danger hover:text-on-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={15} />
            )}
            حذف دائمی نوبت
          </button>

          <p className="mt-3 text-[10px] leading-5 text-ink-muted">
            فقط وضعیت «لغوشده» ساعت رزرو را دوباره آزاد می‌کند. حذف دائمی نیز رکورد نوبت را به‌طور کامل پاک می‌کند.
          </p>
        </div>
      </div>
    </article>
  );
}

function DeleteAppointmentModal({
  appointment,
  loading,
  error,
  onClose,
  onConfirm,
}: {
  appointment: Appointment;
  loading: boolean;
  error: string;
  onClose: () => void;
  onConfirm: (pin: string) => void;
}) {
  const [
    pin,
    setPin,
  ] = useState("");

  const normalizedPin =
    normalizeDigits(pin)
      .replace(/\D/g, "")
      .slice(0, 4);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-appointment-title"
      className="fixed inset-0 z-[210] flex items-center justify-center bg-overlay p-4"
    >
      <button
        type="button"
        aria-label="بستن"
        disabled={loading}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 w-full max-w-md rounded-[1.75rem] border border-line bg-surface p-5 shadow-float sm:p-6">
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          aria-label="بستن"
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-ink"
        >
          <X size={17} />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-soft text-danger">
          <Trash2 size={23} />
        </div>

        <h3
          id="delete-appointment-title"
          className="mt-5 text-xl font-black text-ink"
        >
          حذف دائمی نوبت
        </h3>

        <p className="mt-3 text-sm leading-7 text-ink-secondary">
          این عملیات قابل بازگشت نیست. برای حذف نوبت، کد امنیتی ۴ رقمی تنظیم‌شده در بخش «امنیت و رمز عبور» را وارد کنید.
        </p>

        <div className="mt-4 rounded-xl bg-surface-muted p-4">
          <p className="font-black text-ink">
            {appointment.fullName}
          </p>

          <p className="mt-1 text-xs leading-6 text-ink-muted">
            {formatPersianDate(
              appointment.date,
            )}{" "}
            · ساعت{" "}
            {toPersianDigits(
              appointment.time,
            )}
          </p>

          <p
            dir="ltr"
            className="mt-2 text-left text-xs font-black tracking-wider text-ink-secondary"
          >
            {appointment.trackingCode}
          </p>
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-xs font-black text-ink-secondary">
            کد امنیتی ۴ رقمی
          </span>

          <input
            type="password"
            dir="ltr"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            autoFocus
            value={normalizedPin}
            disabled={loading}
            onChange={(event) =>
              setPin(
                normalizeDigits(
                  event.target.value,
                )
                  .replace(/\D/g, "")
                  .slice(0, 4),
              )
            }
            placeholder="••••"
            className="h-12 w-full rounded-xl border border-line bg-input px-4 text-center text-lg font-black tracking-[0.45em] text-ink outline-none placeholder:tracking-normal placeholder:text-placeholder focus:border-focus focus:ring-4 focus:ring-brand-soft"
          />
        </label>

        {error && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-danger bg-danger-soft p-3">
            <TriangleAlert
              size={17}
              className="mt-0.5 shrink-0 text-danger"
            />
            <p className="text-xs font-bold leading-6 text-ink-secondary">
              {error}
            </p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="h-11 rounded-xl border border-line bg-surface text-sm font-black text-ink hover:bg-surface-hover disabled:opacity-50"
          >
            انصراف
          </button>

          <button
            type="button"
            disabled={
              loading ||
              !/^\d{4}$/.test(
                normalizedPin,
              )
            }
            onClick={() =>
              onConfirm(
                normalizedPin,
              )
            }
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-danger px-4 text-sm font-black text-on-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={16} />
            )}
            حذف نوبت
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusConfirmationModal({
  action,
  loading,
  onClose,
  onConfirm,
}: {
  action: PendingAction;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const dangerous =
    action.status === "cancelled";

  const title =
    action.status === "completed"
      ? "ثبت انجام کارشناسی"
      : action.status === "cancelled"
        ? "لغو نوبت"
        : "بازگرداندن به در انتظار";

  const description =
    action.status === "completed"
      ? `آیا کارشناسی ${action.appointment.fullName} انجام شده است؟ این ساعت پس از انجام‌شدن همچنان رزروشده باقی می‌ماند.`
      : action.status === "cancelled"
        ? `آیا از لغو نوبت ${action.appointment.fullName} مطمئن هستید؟ پس از لغو، ساعت برای رزرو مجدد آزاد می‌شود.`
        : `نوبت ${action.appointment.fullName} دوباره به وضعیت «در انتظار» منتقل شود؟`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-overlay p-4"
    >
      <button
        type="button"
        aria-label="بستن"
        disabled={loading}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 w-full max-w-md rounded-[1.75rem] border border-line bg-surface p-5 shadow-float sm:p-6">
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          aria-label="بستن"
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-ink"
        >
          <X size={17} />
        </button>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            dangerous
              ? "bg-danger-soft text-danger"
              : "bg-brand-soft text-brand-active"
          }`}
        >
          {dangerous ? (
            <XCircle size={23} />
          ) : (
            <ShieldCheck size={23} />
          )}
        </div>

        <h3 className="mt-5 text-xl font-black text-ink">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-ink-secondary">
          {description}
        </p>

        <div className="mt-4 rounded-xl bg-surface-muted p-4">
          <p className="font-black text-ink">
            {action.appointment.fullName}
          </p>

          <p className="mt-1 text-xs leading-6 text-ink-muted">
            {formatPersianDate(
              action.appointment.date,
            )}{" "}
            · ساعت{" "}
            {toPersianDigits(
              action.appointment.time,
            )}
          </p>

          <p
            dir="ltr"
            className="mt-2 text-left text-xs font-black tracking-wider text-ink-secondary"
          >
            {action.appointment.trackingCode}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="h-11 rounded-xl border border-line bg-surface text-sm font-black text-ink hover:bg-surface-hover disabled:opacity-50"
          >
            انصراف
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black text-on-brand disabled:opacity-50 ${
              dangerous
                ? "bg-danger"
                : "bg-brand"
            }`}
          >
            {loading ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : dangerous ? (
              <XCircle size={17} />
            ) : (
              <Check size={17} />
            )}
            تأیید
          </button>
        </div>
      </div>
    </div>
  );
}

function PersianDatePicker({
  value,
  todayISO,
  onChange,
}: {
  value: string;
  todayISO: string;
  onChange: (
    value: string,
  ) => void;
}) {
  const initial =
    value
      ? isoToPersianParts(value)
      : null;

  const todayPersian =
    isoToPersianParts(todayISO);

  const currentYear =
    todayPersian?.year ?? 1400;

  const [
    year,
    setYear,
  ] = useState(
    initial?.year ?? 0,
  );

  const [
    month,
    setMonth,
  ] = useState(
    initial?.month ?? 0,
  );

  const [
    day,
    setDay,
  ] = useState(
    initial?.day ?? 0,
  );

  const years =
    Array.from(
      {
        length: 13,
      },
      (_, index) =>
        currentYear - 6 + index,
    );

  const maxDays =
    year && month
      ? getPersianMonthDays(
          year,
          month,
        )
      : 31;

  const days =
    Array.from(
      {
        length: maxDays,
      },
      (_, index) =>
        index + 1,
    );

  function applyDate(
    nextYear: number,
    nextMonth: number,
    nextDay: number,
  ) {
    if (
      !nextYear ||
      !nextMonth ||
      !nextDay
    ) {
      return;
    }

    const iso =
      persianToISODate(
        nextYear,
        nextMonth,
        nextDay,
      );

    if (iso) {
      onChange(iso);
    }
  }

  function changeYear(
    nextYear: number,
  ) {
    setYear(nextYear);

    let nextDay =
      day;

    if (
      month &&
      nextDay
    ) {
      const maximum =
        getPersianMonthDays(
          nextYear,
          month,
        );

      if (
        nextDay > maximum
      ) {
        nextDay = maximum;
        setDay(nextDay);
      }
    }

    applyDate(
      nextYear,
      month,
      nextDay,
    );
  }

  function changeMonth(
    nextMonth: number,
  ) {
    setMonth(nextMonth);

    let nextDay =
      day;

    if (
      year &&
      nextDay
    ) {
      const maximum =
        getPersianMonthDays(
          year,
          nextMonth,
        );

      if (
        nextDay > maximum
      ) {
        nextDay = maximum;
        setDay(nextDay);
      }
    }

    applyDate(
      year,
      nextMonth,
      nextDay,
    );
  }

  function changeDay(
    nextDay: number,
  ) {
    setDay(nextDay);

    applyDate(
      year,
      month,
      nextDay,
    );
  }

  function clear() {
    setYear(0);
    setMonth(0);
    setDay(0);
    onChange("");
  }

  return (
    <div className="rounded-xl border border-line bg-input p-2">
      <div className="grid grid-cols-3 gap-2">
        <select
          aria-label="روز"
          value={day || ""}
          onChange={(event) =>
            changeDay(
              Number(
                event.target.value,
              ),
            )
          }
          className="h-9 min-w-0 rounded-lg border border-line bg-surface px-2 text-xs font-bold text-ink outline-none"
        >
          <option value="">
            روز
          </option>

          {days.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {toPersianDigits(
                  String(item),
                )}
              </option>
            ),
          )}
        </select>

        <select
          aria-label="ماه"
          value={month || ""}
          onChange={(event) =>
            changeMonth(
              Number(
                event.target.value,
              ),
            )
          }
          className="h-9 min-w-0 rounded-lg border border-line bg-surface px-2 text-xs font-bold text-ink outline-none"
        >
          <option value="">
            ماه
          </option>

          {persianMonths.map(
            (item, index) => (
              <option
                key={item}
                value={index + 1}
              >
                {item}
              </option>
            ),
          )}
        </select>

        <select
          aria-label="سال"
          value={year || ""}
          onChange={(event) =>
            changeYear(
              Number(
                event.target.value,
              ),
            )
          }
          className="h-9 min-w-0 rounded-lg border border-line bg-surface px-2 text-xs font-bold text-ink outline-none"
        >
          <option value="">
            سال
          </option>

          {years.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {toPersianDigits(
                  String(item),
                )}
              </option>
            ),
          )}
        </select>
      </div>

      {value && (
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-line pt-2">
          <span className="truncate text-[10px] font-black text-ink">
            {formatPersianDate(value)}
          </span>

          <button
            type="button"
            onClick={clear}
            className="shrink-0 text-[10px] font-black text-danger"
          >
            حذف
          </button>
        </div>
      )}
    </div>
  );
}

function AdminField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`block ${className}`}
    >
      <span className="mb-2 block text-xs font-black text-ink-secondary">
        {label}
      </span>
      {children}
    </label>
  );
}

function LoadingPanel({
  label,
  compact = false,
}: {
  label: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`mt-6 flex items-center justify-center rounded-[1.5rem] border border-line bg-surface ${
        compact
          ? "min-h-28"
          : "min-h-48"
      }`}
    >
      <div className="text-center">
        <Loader2
          size={26}
          className="mx-auto animate-spin text-brand-active"
        />
        <p className="mt-3 text-sm font-bold text-ink-secondary">
          {label}
        </p>
      </div>
    </div>
  );
}

function EmptyPanel({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mt-8 rounded-[1.5rem] border border-line bg-surface p-8 text-center">
      <div className="mx-auto w-fit text-ink-muted">
        {icon}
      </div>
      <p className="mt-4 font-black text-ink">
        {title}
      </p>
      <p className="mt-2 text-sm text-ink-muted">
        {description}
      </p>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
  ltr = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl bg-surface-muted p-3">
      <div className="mt-0.5 shrink-0 text-brand-active">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold text-ink-muted">
          {label}
        </p>

        <p
          dir={ltr ? "ltr" : undefined}
          className={`mt-1 break-words text-sm font-black leading-6 text-ink ${
            ltr
              ? "text-left"
              : ""
          }`}
        >
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

const inputClassName =
  "h-11 w-full rounded-xl border border-line bg-input px-4 text-sm text-ink outline-none placeholder:text-placeholder focus:border-focus focus:ring-4 focus:ring-brand-soft";
