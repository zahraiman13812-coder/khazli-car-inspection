"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  UserRound,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

type Appointment = {
  trackingCode: string;

  fullName: string;

  phone: string;

  date: string;

  time: string;

  carBrand: string;

  carModel: string;

  carYear?: string | null;
};

type Props = {
  appointment:
    | Appointment
    | null;

  open: boolean;

  onClose: () => void;

  formatDate: (
    date: string,
  ) => string;

  formatTime: (
    time: string,
  ) => string;
};

export default function BookingSuccessModal({
  appointment,
  open,
  onClose,
  formatDate,
  formatTime,
}: Props) {
  const [
    copied,
    setCopied,
  ] = useState(false);

  if (
    !open ||
    !appointment
  ) {
    return null;
  }

async function copyCode() {
  if (!appointment) {
    return;
  }

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

      setCopied(true);

      return;
    }

    /*
     * Fallback for HTTP / unsupported browsers.
     * روش جایگزین برای مرورگرهایی که Clipboard API ندارند.
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

    document.body.appendChild(
      textarea,
    );

    textarea.focus();
    textarea.select();

    document.execCommand(
      "copy",
    );

    document.body.removeChild(
      textarea,
    );

    setCopied(true);
  } catch {
    setCopied(false);
  }
}

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="بستن"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 w-full max-w-lg rounded-[2rem] border border-line bg-surface p-5 shadow-float sm:p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن مودال"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink transition-colors hover:bg-surface-hover"
        >
          <X
            size={18}
          />
        </button>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-soft text-success">
          <CheckCircle2
            size={28}
          />
        </div>

        <h3 className="mt-5 text-2xl font-black text-ink">
          نوبت با موفقیت ثبت شد
        </h3>

        <p className="mt-2 text-sm leading-7 text-ink-secondary">
          اطلاعات نوبت را بررسی کنید و کد
          پیگیری را نزد خود نگه دارید.
        </p>

        <div className="mt-6 rounded-2xl border border-brand-border bg-brand-soft p-4">
          <p className="text-xs font-bold text-ink-secondary">
            کد پیگیری
          </p>

          <div className="mt-2 flex items-center gap-2">
            <div
              dir="ltr"
              className="flex h-12 min-w-0 flex-1 items-center justify-center rounded-xl bg-surface px-3 text-lg font-black tracking-wider text-ink"
            >
              {
                appointment.trackingCode
              }
            </div>

            <button
              type="button"
              onClick={
                copyCode
              }
              className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-black text-ink"
            >
              <Copy
                size={16}
              />

              {copied
                ? "کپی شد"
                : "کپی"}
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <Info
            icon={
              <UserRound
                size={18}
              />
            }
            label="نام"
            value={
              appointment.fullName
            }
          />

          <Info
            icon={
              <CalendarDays
                size={18}
              />
            }
            label="روز و تاریخ"
            value={formatDate(
              appointment.date,
            )}
          />

          <Info
            icon={
              <Clock3
                size={18}
              />
            }
            label="ساعت"
            value={formatTime(
              appointment.time,
            )}
          />

          <Info
            label="خودرو"
            value={`${appointment.carBrand} ${appointment.carModel}${
              appointment.carYear
                ? ` - ${appointment.carYear}`
                : ""
            }`}
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 flex h-13 w-full items-center justify-center rounded-xl bg-brand px-5 text-sm font-black text-on-brand transition-colors hover:bg-brand-hover"
        >
          متوجه شدم
        </button>
      </div>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-line bg-surface-muted p-3">
      {icon && (
        <div className="mt-0.5 shrink-0 text-brand-active">
          {icon}
        </div>
      )}

      <div>
        <p className="text-xs text-ink-muted">
          {label}
        </p>

        <p className="mt-1 text-sm font-black leading-6 text-ink">
          {value}
        </p>
      </div>
    </div>
  );
}