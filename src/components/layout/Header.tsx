"use client";

import {
  Menu,
  Phone,
  X,
} from "lucide-react";

import Image from "next/image";

import Link from "next/link";

import {
  useState,
} from "react";

import {
  createTelHref,
} from "@/lib/contact-links";

import type {
  PublicSiteSettings,
} from "@/types/site-settings";

const navigation = [
  { label: "خدمات", href: "/#services" },
  { label: "بررسی فنی", href: "/technical-inspection" },
  { label: "بررسی بدنه", href: "/body-inspection" },
  { label: "نمونه‌کارها", href: "/#portfolio" },
  { label: "تجهیزات", href: "/equipment" },
  { label: "آموزش", href: "/#education" },
  { label: "پیگیری نوبت", href: "/#track-appointment" },
];

export default function Header({
  settings,
}: {
  settings: PublicSiteSettings;
}) {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface">
      <div className="site-container">
        <div className="flex h-20 items-center justify-between gap-3">
          <Link
            href="/"
            onClick={() =>
              setMobileOpen(false)
            }
            className="flex min-w-0 flex-1 items-center gap-3 xl:flex-none"
          >
            {settings.logoUrl && (
              <div className="flex h-12 w-14 shrink-0 items-center justify-center overflow-hidden sm:w-16 xl:w-20">
                <Image
                  src={settings.logoUrl}
                  alt={`لوگوی ${settings.businessName}`}
                  width={200}
                  height={80}
                  priority
                  unoptimized
                  className="max-h-12 w-auto max-w-full object-contain"
                />
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-ink sm:text-base xl:text-lg">
                {settings.businessName}
              </p>

              <p className="mt-0.5 hidden text-[10px] font-bold text-ink-muted sm:block">
                کارشناسی تخصصی خودرو
              </p>
            </div>
          </Link>

          <nav className="hidden min-w-0 items-center gap-0.5 xl:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-xl px-2.5 py-2 text-[11px] font-bold text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink 2xl:px-3 2xl:text-xs"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 xl:flex">
            <a
              href={createTelHref(
                settings.phone,
              )}
              className="flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-black text-ink transition-colors hover:bg-surface-hover 2xl:px-4 2xl:text-sm"
            >
              <Phone size={17} />
              تماس
            </a>

            <Link
              href="/#booking"
              className="flex h-11 items-center justify-center whitespace-nowrap rounded-xl bg-brand px-4 text-xs font-black text-on-brand transition-colors hover:bg-brand-hover 2xl:px-5 2xl:text-sm"
            >
              رزرو نوبت
            </Link>
          </div>

          <button
            type="button"
            aria-label={
              mobileOpen
                ? "بستن منو"
                : "باز کردن منو"
            }
            aria-expanded={mobileOpen}
            onClick={() =>
              setMobileOpen(
                (current) => !current,
              )
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink transition-colors hover:bg-surface-hover xl:hidden"
          >
            {mobileOpen ? (
              <X size={21} />
            ) : (
              <Menu size={21} />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-line bg-surface xl:hidden">
          <div className="site-container py-4">
            <nav className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="rounded-xl px-4 py-3 text-sm font-black text-ink transition-colors hover:bg-surface-hover"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4">
              <a
                href={createTelHref(
                  settings.phone,
                )}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface text-sm font-black text-ink transition-colors hover:bg-surface-hover"
              >
                <Phone size={16} />
                تماس
              </a>

              <Link
                href="/#booking"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="flex h-11 items-center justify-center rounded-xl bg-brand px-4 text-sm font-black text-on-brand transition-colors hover:bg-brand-hover"
              >
                رزرو نوبت
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
