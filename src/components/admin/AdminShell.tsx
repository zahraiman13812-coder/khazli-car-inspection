"use client";

import {
  CalendarDays,
  CarFront,
  CircleGauge,
  FileText,
  Home,
  Lock,
  LogOut,
  Menu,
  MessageSquareText,
  Settings,
  Wrench,
  X,
} from "lucide-react";

import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

type NavigationItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

const navigationItems: NavigationItem[] = [
  {
    label: "داشبورد",
    href: "/admin",
    icon: (
      <Home
        size={18}
      />
    ),
  },
  {
    label: "نوبت‌ها",
    href: "/admin/appointments",
    icon: (
      <CalendarDays
        size={18}
      />
    ),
  },
  {
  label:
    "بررسی فنی",

  href:
    "/admin/technical-inspection",

  icon: (
    <CircleGauge
      size={18}
    />
  ),
},

{
  label:
    "بررسی بدنه",

  href:
    "/admin/body-inspection",

  icon: (
    <CarFront
      size={18}
    />
  ),
},
  {
    label: "نمونه‌کارها",
    href: "/admin/portfolio",
    icon: (
      <CarFront
        size={18}
      />
    ),
  },
  {
  label: "تجهیزات",

  href: "/admin/equipment",

  icon: (
    <Wrench
      size={18}
    />
  ),
},
  {
    label: "مقالات",
    href: "/admin/articles",
    icon: (
      <FileText
        size={18}
      />
    ),
  },
  {
    label: "پیام‌ها",
    href: "/admin/feedback",
    icon: (
      <MessageSquareText
        size={18}
      />
    ),
  },
  {
    label: "سوالات متداول",
    href: "/admin/faqs",
    icon: (
      <MessageSquareText
        size={18}
      />
    ),
  },
  {
    label: "تنظیمات سایت",
    href: "/admin/settings",
    icon: (
      <Settings
        size={18}
      />
    ),
  },
  {
    label: "امنیت و رمز عبور",
    href: "/admin/security",
    icon: (
      <Lock
        size={18}
      />
    ),
  },
];

async function readLogoutResponse(
  response: Response,
) {
  const contentType =
    response.headers.get(
      "content-type",
    ) ?? "";

  const raw =
    await response.text();

  if (
    !contentType.includes(
      "application/json",
    )
  ) {
    console.error(
      "ADMIN_LOGOUT_NON_JSON_RESPONSE",
      {
        status:
          response.status,

        body:
          raw.slice(
            0,
            1000,
          ),
      },
    );

    return {
      ok: false,
    };
  }

  try {
    return JSON.parse(
      raw,
    ) as {
      ok?: boolean;
    };
  } catch {
    return {
      ok: false,
    };
  }
}

export default function AdminShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] =
    useState(false);

  const [
    loggingOut,
    setLoggingOut,
  ] =
    useState(false);

  function isActiveRoute(
    href: string,
  ) {
    if (
      href ===
      "/admin"
    ) {
      return pathname ===
        "/admin";
    }

    return (
      pathname ===
        href ||
      pathname.startsWith(
        `${href}/`,
      )
    );
  }

  function closeMobileMenu() {
    setMobileMenuOpen(
      false,
    );
  }

  async function handleLogout() {
    if (
      loggingOut
    ) {
      return;
    }

    setLoggingOut(
      true,
    );

    try {
      const response =
        await fetch(
          "/api/admin/logout",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },
          },
        );

      const data =
        await readLogoutResponse(
          response,
        );

      if (
        !response.ok ||
        !data.ok
      ) {
        console.error(
          "ADMIN_LOGOUT_FAILED",
        );
      }
    } catch (error) {
      console.error(
        "ADMIN_LOGOUT_ERROR",
        error,
      );
    } finally {
      /*
       * حتی اگر API خطا بدهد،
       * کاربر را به Login می‌بریم.
       */
      router.replace(
        "/admin/login",
      );

      router.refresh();

      setLoggingOut(
        false,
      );
    }
  }

  return (
    <div className="min-h-screen bg-page">
      {/* ======================================================
          MOBILE HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
        <div>
          <p className="text-sm font-black text-ink">
            پنل مدیریت
          </p>

          <p className="mt-0.5 text-[10px] font-bold text-ink-muted">
            کارشناسی خودرو خزلی
          </p>
        </div>

        <button
          type="button"
          aria-label={
            mobileMenuOpen
              ? "بستن منو"
              : "باز کردن منو"
          }
          aria-expanded={
            mobileMenuOpen
          }
          onClick={() =>
            setMobileMenuOpen(
              (
                current,
              ) =>
                !current,
            )
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink transition-colors hover:bg-surface-hover"
        >
          {mobileMenuOpen ? (
            <X
              size={20}
            />
          ) : (
            <Menu
              size={20}
            />
          )}
        </button>
      </header>

      {/* ======================================================
          MOBILE OVERLAY
      ====================================================== */}

      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="بستن منو"
          onClick={
            closeMobileMenu
          }
          className="fixed inset-0 z-40 bg-overlay lg:hidden"
        />
      )}

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={[
          "fixed inset-y-0 right-0 z-50 flex w-[285px] flex-col border-l border-line bg-surface transition-transform duration-200",
          "lg:translate-x-0",
          mobileMenuOpen
            ? "translate-x-0"
            : "translate-x-full lg:translate-x-0",
        ].join(
          " ",
        )}
      >
        {/* Sidebar header */}

        <div className="flex h-20 shrink-0 items-center justify-between border-b border-line px-5">
          <Link
            href="/admin"
            onClick={
              closeMobileMenu
            }
            className="min-w-0"
          >
            <p className="truncate text-base font-black text-ink">
              کارشناسی خودرو خزلی
            </p>

            <p className="mt-1 text-[10px] font-bold text-ink-muted">
              پنل مدیریت سایت
            </p>
          </Link>

          <button
            type="button"
            aria-label="بستن منو"
            onClick={
              closeMobileMenu
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-ink lg:hidden"
          >
            <X
              size={18}
            />
          </button>
        </div>

        {/* Navigation */}

        <nav className="min-h-0 flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {navigationItems.map(
              (
                item,
              ) => {
                const active =
                  isActiveRoute(
                    item.href,
                  );

                return (
                  <Link
                    key={
                      item.href
                    }
                    href={
                      item.href
                    }
                    onClick={
                      closeMobileMenu
                    }
                    aria-current={
                      active
                        ? "page"
                        : undefined
                    }
                    className={[
                      "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black transition-colors",
                      active
                        ? "bg-brand-soft text-brand-active"
                        : "text-ink-secondary hover:bg-surface-hover hover:text-ink",
                    ].join(
                      " ",
                    )}
                  >
                    <span
                      className={[
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        active
                          ? "bg-surface text-brand-active"
                          : "bg-surface-muted text-ink-muted",
                      ].join(
                        " ",
                      )}
                    >
                      {
                        item.icon
                      }
                    </span>

                    <span className="min-w-0 truncate">
                      {
                        item.label
                      }
                    </span>
                  </Link>
                );
              },
            )}
          </div>
        </nav>

        {/* Sidebar footer */}

        <div className="shrink-0 border-t border-line p-3">
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-black text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-ink-muted">
              <Home
                size={17}
              />
            </span>

            مشاهده سایت
          </Link>

          <button
            type="button"
            disabled={
              loggingOut
            }
            onClick={() =>
              void handleLogout()
            }
            className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-black text-danger transition-colors hover:bg-danger-soft disabled:cursor-wait disabled:opacity-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger-soft text-danger">
              <LogOut
                size={17}
              />
            </span>

            {loggingOut
              ? "در حال خروج..."
              : "خروج از حساب"}
          </button>
        </div>
      </aside>

      {/* ======================================================
          DESKTOP CONTENT
      ====================================================== */}

      <div className="min-h-screen lg:pr-[285px]">
        {/* Desktop topbar */}

        <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-line bg-surface px-6 lg:flex">
          <div>
            <p className="text-sm font-black text-ink">
              مدیریت سایت
            </p>

            <p className="mt-0.5 text-[10px] font-bold text-ink-muted">
              کارشناسی خودرو خزلی
            </p>
          </div>

          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-xs font-black text-ink transition-colors hover:bg-surface-hover"
          >
            <Home
              size={15}
            />

            مشاهده سایت
          </Link>
        </header>

        {/* Page content */}

        <main className="min-w-0">
          {
            children
          }
        </main>
      </div>
    </div>
  );
}