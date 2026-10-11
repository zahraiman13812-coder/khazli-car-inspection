import {
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import type {
  ReactNode,
} from "react";

import MapNavigationButton from "@/components/home/MapNavigationButton";

import {
  createTelHref,
  createWhatsappHref,
} from "@/lib/contact-links";

import {
  getSiteSettings,
} from "@/lib/site-settings";

import type {
  PublicSiteSettings,
} from "@/types/site-settings";

export default async function Contact({
  settings,
}: {
  settings:
    PublicSiteSettings;
}) {
  const fullSettings =
    await getSiteSettings();

  const whatsapp =
    settings.whatsappPhone
      ? createWhatsappHref(
          settings.whatsappPhone,
        )
      : null;

  return (
    <section
      id="contact"
      className="section-space scroll-mt-24 bg-surface-muted"
    >
      <div className="site-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-black text-brand-active">
            ارتباط با ما
          </span>

          <h2 className="mt-4 text-3xl font-black leading-[1.5] text-ink sm:text-4xl">
            برای کارشناسی خودرو آماده‌ای؟
          </h2>

          <p className="mt-4 text-sm leading-8 text-ink-secondary sm:text-base">
            قبل از خرید خودرو، برای بررسی
            تخصصی رنگ، بدنه و وضعیت فنی
            نوبت خود را ثبت کنید یا با ما
            تماس بگیرید.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ContactCard
            icon={
              <Phone
                size={
                  21
                }
              />
            }
            title="شماره تماس"
          >
            <a
              dir="ltr"
              href={createTelHref(
                settings.phone,
              )}
              className="inline-block text-lg font-black text-ink transition-colors hover:text-brand-active"
            >
              {
                settings.phone
              }
            </a>
          </ContactCard>

          <ContactCard
            icon={
              <Clock3
                size={
                  21
                }
              />
            }
            title="ساعات کاری"
          >
            <p className="text-sm font-bold leading-7 text-ink">
              {
                settings.businessHours
              }
            </p>
          </ContactCard>

          <ContactCard
            icon={
              <MapPin
                size={
                  21
                }
              />
            }
            title="آدرس"
          >
            <p className="text-sm font-bold leading-7 text-ink">
              {
                settings.address
              }
            </p>
          </ContactCard>
        </div>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={createTelHref(
              settings.phone,
            )}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-black text-on-brand transition-colors hover:bg-brand-hover"
          >
            <Phone
              size={
                18
              }
            />

            تماس مستقیم
          </a>

          {whatsapp && (
            <a
              href={
                whatsapp
              }
              target="_blank"
              rel="noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-6 text-sm font-black text-ink transition-colors hover:bg-surface-hover"
            >
              <MessageCircle
                size={
                  18
                }
              />

              واتساپ
            </a>
          )}

          <MapNavigationButton
            googleMapsUrl={
              fullSettings.mapUrl
            }
            baladMapUrl={
              fullSettings.baladMapUrl
            }
            neshanMapUrl={
              fullSettings.neshanMapUrl
            }
          />
        </div>
      </div>
    </section>
  );
}

function ContactCard({
  icon,
  title,
  children,
}: {
  icon:
    ReactNode;

  title:
    string;

  children:
    ReactNode;
}) {
  return (
    <article className="rounded-[1.5rem] border border-line bg-surface p-5 shadow-card sm:p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-active">
        {
          icon
        }
      </div>

      <p className="mt-5 text-xs font-bold text-ink-muted">
        {
          title
        }
      </p>

      <div className="mt-2">
        {
          children
        }
      </div>
    </article>
  );
}
