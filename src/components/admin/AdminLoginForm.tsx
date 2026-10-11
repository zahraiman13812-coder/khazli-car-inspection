"use client";

import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  LogIn,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

type LoginResponse = {
  ok: boolean;

  message?: string;
};

export default function AdminLoginForm() {
  const router =
    useRouter();

  const [
    password,
    setPassword,
  ] =
    useState(
      "",
    );

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(
      false,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      false,
    );

  const [
    error,
    setError,
  ] =
    useState(
      "",
    );

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      loading
    ) {
      return;
    }

    if (
      !password
    ) {
      setError(
        "رمز عبور را وارد کنید.",
      );

      return;
    }

    setLoading(
      true,
    );

    setError(
      "",
    );

    try {
      const response =
        await fetch(
          "/api/admin/login",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                password,
              }),
          },
        );

      const data =
        (await response.json()) as LoginResponse;

      if (
        !response.ok ||
        !data.ok
      ) {
        setError(
          data.message ??
            "ورود انجام نشد.",
        );

        return;
      }

      router.replace(
        "/admin",
      );

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "ADMIN_LOGIN_REQUEST_ERROR",
        requestError,
      );

      setError(
        "ارتباط با سرور برقرار نشد.",
      );
    } finally {
      setLoading(
        false,
      );
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-page p-4">
      <div className="w-full max-w-md rounded-[2rem] border border-line bg-surface p-6 shadow-float sm:p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-active">
          <ShieldCheck
            size={
              28
            }
          />
        </div>

        <h1 className="mt-6 text-2xl font-black text-ink">
          ورود به پنل مدیریت
        </h1>

        <p className="mt-2 text-sm leading-7 text-ink-secondary">
          برای مدیریت نوبت‌ها و محتوای
          سایت وارد شوید.
        </p>

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-7"
        >
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-ink-secondary">
              رمز عبور مدیریت
            </span>

            <div className="relative">
              <LockKeyhole
                size={
                  19
                }
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted"
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="current-password"
                value={
                  password
                }
                onChange={(
                  event,
                ) => {
                  setPassword(
                    event
                      .target
                      .value,
                  );

                  setError(
                    "",
                  );
                }}
                placeholder="رمز عبور"
                className="h-12 w-full rounded-xl border border-line bg-input px-12 text-base text-ink outline-none placeholder:text-placeholder focus:border-focus focus:ring-4 focus:ring-brand-soft"
              />

              <button
                type="button"
                aria-label={
                  showPassword
                    ? "مخفی کردن رمز عبور"
                    : "نمایش رمز عبور"
                }
                aria-pressed={
                  showPassword
                }
                onClick={() =>
                  setShowPassword(
                    (
                      current,
                    ) =>
                      !current,
                  )
                }
                className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink focus:outline-none focus:ring-2 focus:ring-focus"
              >
                {showPassword ? (
                  <EyeOff
                    size={
                      18
                    }
                  />
                ) : (
                  <Eye
                    size={
                      18
                    }
                  />
                )}
              </button>
            </div>
          </label>

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-danger bg-danger-soft p-3">
              <TriangleAlert
                size={
                  18
                }
                className="mt-0.5 shrink-0 text-danger"
              />

              <p className="text-xs font-bold leading-6 text-ink-secondary">
                {
                  error
                }
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading
            }
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-black text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2
                  size={
                    18
                  }
                  className="animate-spin"
                />

                در حال ورود...
              </>
            ) : (
              <>
                <LogIn
                  size={
                    18
                  }
                />

                ورود به پنل
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
