"use client";

import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { FormEvent } from "react";

type ApiResponse = {
  ok: boolean;
  code?: string;
  message?: string;
};

async function readApiResponse<T>(
  response: Response,
): Promise<T> {
  const contentType =
    response.headers.get(
      "content-type",
    ) ?? "";

  const raw =
    await response.text();

  if (
    contentType.includes(
      "application/json",
    )
  ) {
    try {
      return JSON.parse(raw) as T;
    } catch {
      throw new Error(
        "پاسخ سرور معتبر نیست.",
      );
    }
  }

  console.error(
    "ADMIN_SECURITY_NON_JSON_RESPONSE",
    {
      status: response.status,
      body: raw.slice(0, 1000),
    },
  );

  throw new Error(
    `پاسخ نامعتبر از سرور دریافت شد. HTTP ${response.status}`,
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

function sanitizePin(
  value: string,
) {
  return normalizeDigits(value)
    .replace(/\D/g, "")
    .slice(0, 4);
}

export default function SecurityManager() {
  const router = useRouter();

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showCurrent,
    setShowCurrent,
  ] = useState(false);

  const [
    showNew,
    setShowNew,
  ] = useState(false);

  const [
    showConfirm,
    setShowConfirm,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    currentDeletePin,
    setCurrentDeletePin,
  ] = useState("");

  const [
    deletePin,
    setDeletePin,
  ] = useState("");

  const [
    confirmDeletePin,
    setConfirmDeletePin,
  ] = useState("");

  const [
    savingPin,
    setSavingPin,
  ] = useState(false);

  const [
    pinError,
    setPinError,
  ] = useState("");

  const [
    pinSuccess,
    setPinSuccess,
  ] = useState("");

  const newPasswordLength =
    newPassword.length;

  const passwordStrongEnough =
    newPasswordLength >= 12;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setError("");
    setSuccess("");

    if (!currentPassword) {
      setError(
        "رمز عبور فعلی را وارد کنید.",
      );
      return;
    }

    if (newPassword.length < 12) {
      setError(
        "رمز جدید باید حداقل ۱۲ کاراکتر باشد.",
      );
      return;
    }

    if (newPassword.length > 128) {
      setError(
        "رمز جدید بیش از حد طولانی است.",
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "تکرار رمز جدید با رمز جدید مطابقت ندارد.",
      );
      return;
    }

    if (
      currentPassword ===
      newPassword
    ) {
      setError(
        "رمز جدید باید با رمز فعلی متفاوت باشد.",
      );
      return;
    }

    setSaving(true);

    try {
      const response =
        await fetch(
          "/api/admin/change-password",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              currentPassword,
              newPassword,
            }),
          },
        );

      const data =
        await readApiResponse<ApiResponse>(
          response,
        );

      if (
        response.status === 401 &&
        data.message ===
          "نشست مدیریت معتبر نیست."
      ) {
        router.replace(
          "/admin/login",
        );
        router.refresh();
        return;
      }

      if (
        !response.ok ||
        !data.ok
      ) {
        setError(
          data.message ??
            "تغییر رمز عبور انجام نشد.",
        );
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSuccess(
        data.message ??
          "رمز عبور با موفقیت تغییر کرد.",
      );

      router.refresh();
    } catch (requestError) {
      console.error(
        "CHANGE_PASSWORD_ERROR",
        requestError,
      );

      setError(
        requestError instanceof Error
          ? requestError.message
          : "ارتباط با سرور برقرار نشد.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePinSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (savingPin) {
      return;
    }

    setPinError("");
    setPinSuccess("");

    if (!/^\d{4}$/.test(currentDeletePin)) {
      setPinError(
        "کد ۴ رقمی فعلی را درست وارد کنید.",
      );
      return;
    }

    if (!/^\d{4}$/.test(deletePin)) {
      setPinError(
        "کد امنیتی حذف باید دقیقاً ۴ رقم باشد.",
      );
      return;
    }

    if (
      deletePin !==
      confirmDeletePin
    ) {
      setPinError(
        "تکرار کد ۴ رقمی با کد جدید مطابقت ندارد.",
      );
      return;
    }

    if (
      currentDeletePin ===
      deletePin
    ) {
      setPinError(
        "کد ۴ رقمی جدید باید با کد فعلی متفاوت باشد.",
      );
      return;
    }

    setSavingPin(true);

    try {
      const response =
        await fetch(
          "/api/admin/security/delete-pin",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              currentPin:
                currentDeletePin,
              newPin: deletePin,
            }),
          },
        );

      const data =
        await readApiResponse<ApiResponse>(
          response,
        );

      if (
        response.status === 401 &&
        data.code === "UNAUTHORIZED"
      ) {
        router.replace(
          "/admin/login",
        );
        router.refresh();
        return;
      }

      if (
        !response.ok ||
        !data.ok
      ) {
        setPinError(
          data.message ??
            "ذخیره کد امنیتی حذف انجام نشد.",
        );
        return;
      }

      setCurrentDeletePin("");
      setDeletePin("");
      setConfirmDeletePin("");

      setPinSuccess(
        data.message ??
          "کد امنیتی حذف نوبت با موفقیت ذخیره شد.",
      );
    } catch (requestError) {
      console.error(
        "DELETE_PIN_UPDATE_ERROR",
        requestError,
      );

      setPinError(
        requestError instanceof Error
          ? requestError.message
          : "ارتباط با سرور برقرار نشد.",
      );
    } finally {
      setSavingPin(false);
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div>
        <span className="text-sm font-black text-brand-active">
          تنظیمات حساب
        </span>

        <h1 className="mt-2 text-3xl font-black text-ink">
          امنیت و رمز عبور
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-secondary">
          رمز ورود پنل و کد امنیتی عملیات حساس را از این بخش مدیریت کنید.
        </p>
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <form
            onSubmit={handleSubmit}
            className="rounded-[1.5rem] border border-line bg-surface p-5 shadow-card sm:p-6"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-active">
                <KeyRound size={20} />
              </div>

              <div>
                <h2 className="font-black text-ink">
                  تغییر رمز عبور
                </h2>

                <p className="mt-1 text-xs leading-6 text-ink-muted">
                  برای تأیید هویت، ابتدا رمز فعلی را وارد کنید.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <PasswordField
                label="رمز عبور فعلی"
                value={currentPassword}
                visible={showCurrent}
                disabled={saving}
                autoComplete="current-password"
                onChange={setCurrentPassword}
                onToggle={() =>
                  setShowCurrent(
                    (current) =>
                      !current,
                  )
                }
              />

              <PasswordField
                label="رمز عبور جدید"
                value={newPassword}
                visible={showNew}
                disabled={saving}
                autoComplete="new-password"
                onChange={setNewPassword}
                onToggle={() =>
                  setShowNew(
                    (current) =>
                      !current,
                  )
                }
              />

              <div>
                <div className="flex items-center justify-between gap-3 text-[10px] font-bold">
                  <span className="text-ink-muted">
                    حداقل ۱۲ کاراکتر
                  </span>

                  <span
                    className={
                      passwordStrongEnough
                        ? "text-success"
                        : "text-ink-muted"
                    }
                  >
                    {new Intl.NumberFormat(
                      "fa-IR",
                    ).format(
                      newPasswordLength,
                    )}{" "}
                    کاراکتر
                  </span>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-brand transition-[width]"
                    style={{
                      width: `${Math.min(
                        100,
                        (newPasswordLength /
                          16) *
                          100,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <PasswordField
                label="تکرار رمز عبور جدید"
                value={confirmPassword}
                visible={showConfirm}
                disabled={saving}
                autoComplete="new-password"
                onChange={setConfirmPassword}
                onToggle={() =>
                  setShowConfirm(
                    (current) =>
                      !current,
                  )
                }
              />

              {confirmPassword &&
                newPassword ===
                  confirmPassword && (
                  <div className="flex items-center gap-2 text-xs font-black text-success">
                    <CheckCircle2
                      size={15}
                    />
                    دو رمز جدید با هم مطابقت دارند.
                  </div>
                )}
            </div>

            {error && (
              <AlertBox
                type="error"
                message={error}
              />
            )}

            {success && (
              <AlertBox
                type="success"
                message={success}
              />
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-6 flex h-12 min-w-48 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-black text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-wait disabled:opacity-50"
            >
              {saving ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <KeyRound size={18} />
              )}
              {saving
                ? "در حال تغییر رمز..."
                : "تغییر رمز عبور"}
            </button>
          </form>

          <form
            onSubmit={
              handleDeletePinSubmit
            }
            className="rounded-[1.5rem] border border-line bg-surface p-5 shadow-card sm:p-6"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger-soft text-danger">
                <Trash2 size={20} />
              </div>

              <div>
                <h2 className="font-black text-ink">
                  کد امنیتی حذف نوبت
                </h2>

                <p className="mt-1 text-xs leading-6 text-ink-muted">
                  حذف دائمی هر نوبت فقط با این کد ۴ رقمی انجام می‌شود. برای تغییر کد، ابتدا کد ۴ رقمی فعلی را وارد کنید.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <PinField
                label="کد ۴ رقمی فعلی"
                value={currentDeletePin}
                disabled={savingPin}
                onChange={(value) =>
                  setCurrentDeletePin(
                    sanitizePin(value),
                  )
                }
              />

              <PinField
                label="کد ۴ رقمی جدید"
                value={deletePin}
                disabled={savingPin}
                onChange={(value) =>
                  setDeletePin(
                    sanitizePin(value),
                  )
                }
              />

              <PinField
                label="تکرار کد ۴ رقمی"
                value={confirmDeletePin}
                disabled={savingPin}
                onChange={(value) =>
                  setConfirmDeletePin(
                    sanitizePin(value),
                  )
                }
              />
            </div>

            {pinError && (
              <AlertBox
                type="error"
                message={pinError}
              />
            )}

            {pinSuccess && (
              <AlertBox
                type="success"
                message={pinSuccess}
              />
            )}

            <button
              type="submit"
              disabled={savingPin}
              className="mt-6 flex h-12 min-w-48 items-center justify-center gap-2 rounded-xl bg-danger px-6 text-sm font-black text-on-brand transition-opacity disabled:cursor-wait disabled:opacity-50"
            >
              {savingPin ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <ShieldCheck size={18} />
              )}
              {savingPin
                ? "در حال ذخیره..."
                : "ذخیره کد حذف"}
            </button>
          </form>
        </div>

        <aside className="h-fit rounded-[1.5rem] border border-line bg-surface p-5 shadow-card sm:p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-soft text-success">
            <ShieldCheck size={21} />
          </div>

          <h2 className="mt-4 font-black text-ink">
            نکات امنیتی
          </h2>

          <div className="mt-4 space-y-3 text-xs leading-7 text-ink-secondary">
            <p>
              رمز عبور جدید حداقل ۱۲ کاراکتر داشته باشد.
            </p>
            <p>
              کد حذف فقط ۴ رقم است و برای حذف دائمی نوبت استفاده می‌شود.
            </p>
            <p>
              کد حذف و رمز عبور به‌صورت خام در دیتابیس ذخیره نمی‌شوند و فقط Hash آن‌ها نگهداری می‌شود.
            </p>
            <p>
              بعد از چند ورود اشتباه کد حذف، عملیات حذف موقتاً مسدود می‌شود.
            </p>
            <p>
              با تغییر رمز عبور، Sessionهای مدیریتی قدیمی نامعتبر می‌شوند.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  visible,
  disabled,
  autoComplete,
  onChange,
  onToggle,
  hideToggle = false,
}: {
  label: string;
  value: string;
  visible: boolean;
  disabled: boolean;
  autoComplete:
    | "current-password"
    | "new-password";
  onChange: (
    value: string,
  ) => void;
  onToggle: () => void;
  hideToggle?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black text-ink-secondary">
        {label}
      </span>

      <div className="relative">
        <input
          type={
            visible
              ? "text"
              : "password"
          }
          value={value}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={128}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className={`h-12 w-full rounded-xl border border-line bg-input pr-4 text-sm text-ink outline-none transition-colors focus:border-focus focus:ring-4 focus:ring-brand-soft disabled:opacity-60 ${
            hideToggle
              ? "pl-4"
              : "pl-12"
          }`}
        />

        {!hideToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={onToggle}
            aria-label={
              visible
                ? "مخفی کردن رمز"
                : "نمایش رمز"
            }
            className="absolute inset-y-0 left-0 flex w-12 items-center justify-center text-ink-muted transition-colors hover:text-ink"
          >
            {visible ? (
              <EyeOff size={17} />
            ) : (
              <Eye size={17} />
            )}
          </button>
        )}
      </div>
    </label>
  );
}

function PinField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black text-ink-secondary">
        {label}
      </span>

      <input
        type="password"
        dir="ltr"
        inputMode="numeric"
        autoComplete="off"
        maxLength={4}
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder="••••"
        className="h-12 w-full rounded-xl border border-line bg-input px-4 text-center text-lg font-black tracking-[0.45em] text-ink outline-none transition-colors placeholder:tracking-normal placeholder:text-placeholder focus:border-focus focus:ring-4 focus:ring-brand-soft disabled:opacity-60"
      />
    </label>
  );
}

function AlertBox({
  type,
  message,
}: {
  type:
    | "error"
    | "success";
  message: string;
}) {
  const success =
    type === "success";

  return (
    <div
      role={
        success
          ? "status"
          : "alert"
      }
      className={`mt-5 flex items-start gap-3 rounded-xl border p-4 ${
        success
          ? "border-success bg-success-soft"
          : "border-danger bg-danger-soft"
      }`}
    >
      {success ? (
        <CheckCircle2
          size={18}
          className="mt-0.5 shrink-0 text-success"
        />
      ) : (
        <TriangleAlert
          size={18}
          className="mt-0.5 shrink-0 text-danger"
        />
      )}

      <p
        className={`text-sm font-bold leading-7 ${
          success
            ? "text-success"
            : "text-ink-secondary"
        }`}
      >
        {message}
      </p>
    </div>
  );
}
