import {
  Camera,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import {
  createTelHref,
  createWhatsappHref,
} from "@/lib/contact-links";

import type {
  PublicSiteSettings,
} from "@/types/site-settings";

export default function Footer({
  settings,
}: {
  settings: PublicSiteSettings;
}) {
  const whatsapp =
    settings.whatsappPhone
      ? createWhatsappHref(
          settings.whatsappPhone,
        )
      : null;

  return (
    <footer className="border-t border-line bg-surface">
      <div className="site-container py-10 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.8fr_1fr]">
          <div>
            <Link
              href="/"
              className="inline-flex max-w-full items-center gap-3 text-xl font-black text-ink"
            >
              {settings.logoUrl && (
                <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden">
                  <Image
                    src={settings.logoUrl}
                    alt={`لوگوی ${settings.businessName}`}
                    width={220}
                    height={90}
                    unoptimized
                    className="max-h-14 w-auto max-w-full object-contain"
                  />
                </div>
              )}

              <span className="min-w-0">
                {settings.businessName}
              </span>
            </Link>

            <p className="mt-4 max-w-md text-sm leading-8 text-ink-secondary">
              {settings.description}
            </p>
          </div>

          <div>
            <p className="text-sm font-black text-ink">
              دسترسی سریع
            </p>

            <div className="mt-4 grid gap-3 text-sm font-bold text-ink-secondary">
              <Link href="/#services" className="hover:text-brand-active">
                خدمات
              </Link>
              <Link href="/#portfolio" className="hover:text-brand-active">
                نمونه‌کارها
              </Link>
              <Link href="/#booking" className="hover:text-brand-active">
                رزرو نوبت
              </Link>
              <Link href="/#track-appointment" className="hover:text-brand-active">
                پیگیری نوبت
              </Link>
              <Link href="/#feedback" className="hover:text-brand-active">
                پیشنهادات و انتقادات
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-black text-ink">
              تماس با ما
            </p>

            <div className="mt-4 space-y-3">
              <a
                href={createTelHref(
                  settings.phone,
                )}
                className="flex items-center gap-3 text-sm font-bold text-ink-secondary transition-colors hover:text-brand-active"
              >
                <Phone size={17} />
                <span dir="ltr">
                  {settings.phone}
                </span>
              </a>

              <div className="flex items-start gap-3 text-sm font-bold leading-7 text-ink-secondary">
                <MapPin
                  size={17}
                  className="mt-1 shrink-0"
                />
                <span>
                  {settings.address}
                </span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {whatsapp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="واتساپ"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink transition-colors hover:bg-surface-hover hover:text-brand-active"
                >
                  <MessageCircle size={18} />
                </a>
              )}

              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="اینستاگرام"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink transition-colors hover:bg-surface-hover hover:text-brand-active"
                >
                  <Camera size={18} />
                </a>
              )}

              {settings.mapUrl && (
                <a
                  href={settings.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="موقعیت روی نقشه"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink transition-colors hover:bg-surface-hover hover:text-brand-active"
                >
                  <MapPin size={18} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-5 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.businessName}
          </p>
          <p>تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
}
