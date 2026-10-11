import type {
  Metadata,
} from "next";

import Link from "next/link";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

import {
  getPublishedArticles,
} from "@/lib/articles";

import {
  getSiteSettings,
} from "@/lib/site-settings";

import type {
  PublicSiteSettings,
} from "@/types/site-settings";

export const dynamic =
  "force-dynamic";

export const metadata: Metadata = {
  title:
    "مقالات کارشناسی خودرو",

  description:
    "آموزش‌ها و نکات تخصصی کارشناسی رنگ، بدنه، شاسی و فنی خودرو پیش از خرید.",

  alternates: {
    canonical:
      "/blog",
  },

  openGraph: {
    type:
      "website",
    locale:
      "fa_IR",
    url:
      "/blog",
    title:
      "مقالات کارشناسی خودرو",
    description:
      "آموزش‌ها و نکات تخصصی کارشناسی رنگ، بدنه، شاسی و فنی خودرو پیش از خرید.",
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
      "مقالات کارشناسی خودرو",
    description:
      "آموزش‌ها و نکات تخصصی کارشناسی رنگ، بدنه، شاسی و فنی خودرو پیش از خرید.",
    images: [
      "/brand/logo.png",
    ],
  },
};

export default async function BlogPage() {
  const [
    settings,
    articles,
  ] =
    await Promise.all([
      getSiteSettings(),
      getPublishedArticles(
        24,
      ),
    ]);

  const publicSettings:
    PublicSiteSettings = {
    businessName:
      settings.businessName,
    description:
      settings.description,
    phone:
      settings.phone,
    whatsappPhone:
      settings.whatsappPhone,
    address:
      settings.address,
    businessHours:
      settings.businessHours,
    instagramUrl:
      settings.instagramUrl,
    logoUrl:
      settings.logoUrl,
    mapUrl:
      settings.mapUrl,
    baladMapUrl:
      settings.baladMapUrl,
    neshanMapUrl:
      settings.neshanMapUrl,
  };

  return (
    <>
      <Header
        settings={
          publicSettings
        }
      />

      <main className="min-h-screen bg-page">
        <section className="section-space">
          <div className="site-container">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-sm font-black text-brand-active">
                آموزش و راهنما
              </span>

              <h1 className="mt-4 text-3xl font-black leading-[1.5] text-ink sm:text-5xl">
                مقالات کارشناسی خودرو
              </h1>

              <p className="mt-4 text-sm leading-8 text-ink-secondary sm:text-base">
                نکات کاربردی برای خرید مطمئن‌تر خودرو و شناخت بهتر
                رنگ، بدنه، شاسی و وضعیت فنی.
              </p>
            </div>

            {articles.length ===
            0 ? (
              <div className="mx-auto mt-12 max-w-xl rounded-[1.5rem] border border-line bg-surface p-10 text-center">
                <p className="font-black text-ink">
                  هنوز مقاله‌ای منتشر نشده.
                </p>

                <p className="mt-2 text-sm leading-7 text-ink-muted">
                  مطالب آموزشی جدید به‌زودی در این بخش منتشر می‌شوند.
                </p>
              </div>
            ) : (
              <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {articles.map(
                  (
                    article,
                  ) => (
                    <Link
                      key={
                        article.id
                      }
                      href={`/blog/${article.slug}`}
                      className="group overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-card transition-transform hover:-translate-y-1"
                    >
                      {article.coverImageUrl ? (
                        <div className="aspect-[16/9] overflow-hidden bg-surface-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              article.coverImageUrl
                            }
                            alt={
                              article.title
                            }
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[16/9] bg-surface-muted" />
                      )}

                      <div className="p-5">
                        <h2 className="text-lg font-black leading-8 text-ink">
                          {
                            article.title
                          }
                        </h2>

                        <p className="mt-3 line-clamp-3 text-sm leading-8 text-ink-secondary">
                          {
                            article.excerpt
                          }
                        </p>

                        <span className="mt-5 inline-block text-xs font-black text-brand-active">
                          مطالعه مقاله ←
                        </span>
                      </div>
                    </Link>
                  ),
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer
        settings={
          publicSettings
        }
      />
    </>
  );
}
