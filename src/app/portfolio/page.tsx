import type {
  Metadata,
} from "next";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

import {
  prisma,
} from "@/lib/prisma";

import {
  getSiteSettings,
} from "@/lib/site-settings";

export const dynamic =
  "force-dynamic";

export const metadata: Metadata = {
  title:
    "نمونه کارشناسی‌ها",

  description:
    "مشاهده نمونه خودروهای کارشناسی‌شده، بررسی رنگ، بدنه، شاسی و کارشناسی پیش از خرید خودرو توسط کارشناسی خودرو خزلی.",

  alternates: {
    canonical:
      "/portfolio",
  },

  openGraph: {
    type:
      "website",
    locale:
      "fa_IR",
    url:
      "/portfolio",
    title:
      "نمونه کارشناسی‌ها",
    description:
      "مشاهده نمونه خودروهای کارشناسی‌شده، بررسی رنگ، بدنه، شاسی و کارشناسی پیش از خرید خودرو توسط کارشناسی خودرو خزلی.",
    images: [
      {
        url:
          "/brand/logo.png",
        alt:
          "کارشناسی خودرو خزلی",
      },
    ],
  },

  twitter: {
    card:
      "summary",
    title:
      "نمونه کارشناسی‌ها",
    description:
      "مشاهده نمونه خودروهای کارشناسی‌شده، بررسی رنگ، بدنه، شاسی و کارشناسی پیش از خرید خودرو توسط کارشناسی خودرو خزلی.",
    images: [
      "/brand/logo.png",
    ],
  },
};

function getCategoryLabel(
  value: string,
) {
  switch (
    value
  ) {
    case "paint":
      return "کارشناسی رنگ";

    case "body":
      return "بدنه و شاسی";

    case "technical":
      return "کارشناسی فنی";

    case "full":
    default:
      return "کارشناسی کامل";
  }
}

export default async function PortfolioPage() {
  const [
    settings,
    portfolioItems,
  ] =
    await Promise.all([
      getSiteSettings(),

      prisma.portfolioItem.findMany({
        where: {
          isActive:
            true,
        },

        orderBy: [
          {
            sortOrder:
              "asc",
          },
          {
            createdAt:
              "desc",
          },
        ],
      }),
    ]);

  return (
    <>
      <Header
        settings={
          settings
        }
      />

      <main className="min-h-screen bg-page">
        <section className="bg-page py-10 sm:py-14 md:py-16 lg:py-20 xl:py-24">
          <div className="site-container">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-base font-black text-brand-active sm:text-lg md:text-xl">
                همه نمونه‌کارها
              </p>

              <h1 className="mt-3 text-2xl font-black leading-tight text-ink sm:text-3xl md:text-4xl">
                نمونه خودروهای کارشناسی‌شده
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-ink-muted sm:text-base sm:leading-8">
                بخشی از خودروهایی که از نظر رنگ، بدنه، شاسی و وضعیت
                فنی بررسی شده‌اند.
              </p>
            </div>

            {portfolioItems.length >
            0 ? (
              <div
                className="
                  mt-8
                  grid
                  grid-cols-1
                  gap-5

                  sm:mt-10
                  sm:grid-cols-2

                  lg:grid-cols-3
                  lg:gap-6

                  xl:mt-12
                "
              >
                {portfolioItems.map(
                  (
                    item,
                  ) => (
                    <article
                      key={
                        item.id
                      }
                      className="group overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-card"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            item.afterImageUrl
                          }
                          alt={
                            item.title
                          }
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />

                        <div className="absolute right-3 top-3">
                          <span className="rounded-full bg-surface px-3 py-1.5 text-[11px] font-black text-ink shadow-card">
                            {getCategoryLabel(
                              item.category,
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 sm:p-6">
                        <p className="text-xs font-black text-brand-active">
                          {
                            item.vehicle
                          }
                        </p>

                        <h2 className="mt-2 text-lg font-black leading-8 text-ink">
                          {
                            item.title
                          }
                        </h2>

                        <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm leading-8 text-ink-secondary">
                          {
                            item.description
                          }
                        </p>
                      </div>
                    </article>
                  ),
                )}
              </div>
            ) : (
              <div
                className="
                  mx-auto
                  mt-8
                  max-w-2xl
                  rounded-[1.5rem]
                  border
                  border-line
                  bg-surface-muted
                  px-5
                  py-8
                  text-center

                  sm:mt-10
                  sm:rounded-[1.75rem]
                  sm:px-8
                  sm:py-10

                  lg:px-10
                  lg:py-12
                "
              >
                <p className="text-base font-black text-ink sm:text-lg">
                  هنوز نمونه‌کاری ثبت نشده است.
                </p>

                <p className="mt-2 text-sm leading-7 text-ink-muted sm:text-base sm:leading-8">
                  نمونه کارشناسی‌های جدید به‌زودی در این بخش قرار
                  می‌گیرند.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer
        settings={
          settings
        }
      />
    </>
  );
}
