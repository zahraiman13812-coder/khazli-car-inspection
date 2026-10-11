import {
  CarFront,
  Images,
  Play,
} from "lucide-react";

import Image from "next/image";

import type {
  Metadata,
} from "next";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

import {
  getBodyInspectionPage,
} from "@/lib/body-inspection";

import {
  getSiteSettings,
} from "@/lib/site-settings";

export const dynamic =
  "force-dynamic";

export const metadata: Metadata = {
  title:
    "بررسی بدنه خودرو",

  description:
    "بررسی تخصصی رنگ، بدنه، شاسی و قطعات خودرو در کارشناسی خودرو خزلی.",

  alternates: {
    canonical:
      "/body-inspection",
  },

  openGraph: {
    type:
      "website",
    locale:
      "fa_IR",
    url:
      "/body-inspection",
    title:
      "بررسی بدنه خودرو",
    description:
      "بررسی تخصصی رنگ، بدنه، شاسی و قطعات خودرو در کارشناسی خودرو خزلی.",
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
      "بررسی بدنه خودرو",
    description:
      "بررسی تخصصی رنگ، بدنه، شاسی و قطعات خودرو در کارشناسی خودرو خزلی.",
    images: [
      "/brand/logo.png",
    ],
  },
};

function getVideoSource(
  value: string,
) {
  const url =
    value.trim();

  if (
    !url
  ) {
    return null;
  }

  if (
    /\.(mp4|webm|ogg)(\?.*)?$/i.test(
      url,
    )
  ) {
    return {
      type:
        "video" as const,

      url,
    };
  }

  try {
    const parsed =
      new URL(
        url,
      );

    if (
      parsed.hostname ===
        "youtu.be" ||
      parsed.hostname.endsWith(
        ".youtu.be",
      )
    ) {
      const id =
        parsed.pathname
          .split("/")
          .filter(Boolean)[0];

      if (
        id
      ) {
        return {
          type:
            "iframe" as const,

          url:
            `https://www.youtube.com/embed/${id}`,
        };
      }
    }

    if (
      parsed.hostname.includes(
        "youtube.com",
      )
    ) {
      const id =
        parsed.searchParams.get(
          "v",
        );

      if (
        id
      ) {
        return {
          type:
            "iframe" as const,

          url:
            `https://www.youtube.com/embed/${id}`,
        };
      }
    }

    if (
      parsed.hostname.includes(
        "aparat.com",
      )
    ) {
      const parts =
        parsed.pathname
          .split("/")
          .filter(Boolean);

      const index =
        parts.indexOf(
          "v",
        );

      if (
        index >=
          0 &&
        parts[index + 1]
      ) {
        return {
          type:
            "iframe" as const,

          url:
            `https://www.aparat.com/video/video/embed/videohash/${parts[index + 1]}/vt/frame`,
        };
      }
    }

    return {
      type:
        "iframe" as const,

      url,
    };
  } catch {
    return null;
  }
}

export default async function BodyInspectionPage() {
  const [
    settings,
    page,
  ] =
    await Promise.all([
      getSiteSettings(),
      getBodyInspectionPage(),
    ]);

  const video =
    page.videoUrl
      ? getVideoSource(
          page.videoUrl,
        )
      : null;

  return (
    <>
      <Header
        settings={
          settings
        }
      />

      <main className="min-h-screen bg-page">
        <section className="border-b border-line bg-surface">
          <div className="site-container py-12 sm:py-16 lg:py-20">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-active">
                <CarFront
                  size={23}
                />
              </div>

              <p className="mt-5 text-sm font-black text-brand-active">
                کارشناسی تخصصی بدنه
              </p>

              <h1 className="mt-3 text-3xl font-black leading-[1.5] text-ink sm:text-4xl lg:text-5xl">
                {
                  page.title
                }
              </h1>

              <p className="mx-auto mt-5 max-w-3xl whitespace-pre-line text-sm leading-8 text-ink-secondary sm:text-base sm:leading-9">
                {
                  page.description
                }
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14 lg:py-16">
          <div className="site-container">
            <div className="mx-auto max-w-5xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-active">
                  <Play
                    size={18}
                  />
                </div>

                <h2 className="text-xl font-black text-ink sm:text-2xl">
                  {
                    page.videoTitle
                  }
                </h2>
              </div>

              {video ? (
                <div className="overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-card">
                  <div className="aspect-video bg-surface-muted">
                    {video.type ===
                    "video" ? (
                      <video
                        src={
                          video.url
                        }
                        controls
                        playsInline
                        preload="metadata"
                        className="h-full w-full bg-ink object-contain"
                      />
                    ) : (
                      <iframe
                        src={
                          video.url
                        }
                        title={
                          page.videoTitle
                        }
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                        className="h-full w-full border-0"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-[1.5rem] border border-line bg-surface-muted">
                  <div className="text-center">
                    <Play
                      size={30}
                      className="mx-auto text-ink-muted"
                    />

                    <p className="mt-3 text-sm font-bold text-ink-muted">
                      ویدیوی بررسی بدنه به‌زودی اضافه می‌شود.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="border-t border-line bg-surface-muted py-10 sm:py-14 lg:py-16">
          <div className="site-container">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-active">
                <Images
                  size={19}
                />
              </div>

              <h2 className="mt-4 text-2xl font-black text-ink sm:text-3xl">
                {
                  page.galleryTitle
                }
              </h2>

              <p className="mt-2 text-sm leading-7 text-ink-muted">
                نمونه‌هایی از بررسی رنگ،
                شاسی و بخش‌های مختلف بدنه.
              </p>
            </div>

            {page.images.length >
            0 ? (
              <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {page.images.map(
                  (
                    item,
                  ) => (
                    <article
                      key={
                        item.id
                      }
                      className="overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-card"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
                        <Image
                          src={
                            item.imageUrl
                          }
                          alt={
                            item.altText ||
                            item.title ||
                            "تصویر بررسی بدنه خودرو"
                          }
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>

                      {(item.title ||
                        item.caption) && (
                        <div className="p-5">
                          {item.title && (
                            <h3 className="font-black text-ink">
                              {
                                item.title
                              }
                            </h3>
                          )}

                          {item.caption && (
                            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-ink-secondary">
                              {
                                item.caption
                              }
                            </p>
                          )}
                        </div>
                      )}
                    </article>
                  ),
                )}
              </div>
            ) : (
              <div className="mt-7 rounded-[1.5rem] border border-line bg-surface p-8 text-center">
                <CarFront
                  size={30}
                  className="mx-auto text-ink-muted"
                />

                <p className="mt-4 font-black text-ink">
                  هنوز تصویری ثبت نشده است.
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