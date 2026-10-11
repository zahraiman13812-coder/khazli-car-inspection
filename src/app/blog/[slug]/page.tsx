import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

import {
  getPublishedArticleBySlug,
} from "@/lib/articles";

import {
  sanitizeArticleHtml,
} from "@/lib/article-content";

import {
  getSiteSettings,
} from "@/lib/site-settings";

import {
  getSiteUrl,
} from "@/lib/site-url";

import type {
  PublicSiteSettings,
} from "@/types/site-settings";

export const dynamic =
  "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function normalizeSlug(
  value: string,
) {
  const trimmed =
    value.trim();

  try {
    return decodeURIComponent(
      trimmed,
    );
  } catch {
    return trimmed;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    slug:
      rawSlug,
  } =
    await params;

  const slug =
    normalizeSlug(
      rawSlug,
    );

  const article =
    await getPublishedArticleBySlug(
      slug,
    );

  if (
    !article
  ) {
    return {
      title:
        "مقاله پیدا نشد",

      robots: {
        index:
          false,

        follow:
          false,
      },
    };
  }

  const siteUrl =
    getSiteUrl();

  const canonical =
    `${siteUrl}/blog/${encodeURIComponent(
      article.slug,
    )}`;

  return {
    title:
      article.title,

    description:
      article.excerpt,

    alternates: {
      canonical,
    },

    openGraph: {
      type:
        "article",

      locale:
        "fa_IR",

      url:
        canonical,

      title:
        article.title,

      description:
        article.excerpt,

      publishedTime:
        article.publishedAt?.toISOString(),

      modifiedTime:
        article.updatedAt.toISOString(),

      images:
        article.coverImageUrl
          ? [
              {
                url:
                  article.coverImageUrl,

                alt:
                  article.title,
              },
            ]
          : undefined,
    },

    twitter: {
      card:
        article.coverImageUrl
          ? "summary_large_image"
          : "summary",

      title:
        article.title,

      description:
        article.excerpt,

      images:
        article.coverImageUrl
          ? [
              article.coverImageUrl,
            ]
          : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: PageProps) {
  const {
    slug:
      rawSlug,
  } =
    await params;

  const slug =
    normalizeSlug(
      rawSlug,
    );

  const [
    article,
    settings,
  ] =
    await Promise.all([
      getPublishedArticleBySlug(
        slug,
      ),

      getSiteSettings(),
    ]);

  if (
    !article
  ) {
    notFound();
  }

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

  const siteUrl =
    getSiteUrl();

  const articleUrl =
    `${siteUrl}/blog/${encodeURIComponent(
      article.slug,
    )}`;

  const resolvePublicUrl = (
    value: string,
  ) =>
    new URL(
      value,
      `${siteUrl}/`,
    ).toString();

  const articleJsonLd = {
    "@context":
      "https://schema.org",
    "@type":
      "Article",
    headline:
      article.title,
    description:
      article.excerpt,
    mainEntityOfPage:
      articleUrl,
    datePublished:
      article.publishedAt?.toISOString(),
    dateModified:
      article.updatedAt.toISOString(),
    image:
      article.coverImageUrl
        ? [
            resolvePublicUrl(
              article.coverImageUrl,
            ),
          ]
        : undefined,
    publisher: {
      "@type":
        "Organization",
      name:
        settings.businessName,
      logo:
        settings.logoUrl
          ? {
              "@type":
                "ImageObject",
              url:
                resolvePublicUrl(
                  settings.logoUrl,
                ),
            }
          : undefined,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              articleJsonLd,
            ).replace(
              /</g,
              "\\u003c",
            ),
        }}
      />

      <Header
        settings={
          publicSettings
        }
      />

      <main className="min-h-screen bg-page">
        <article className="section-space">
          <div className="site-container">
            <div className="mx-auto max-w-3xl">
              <Link
                href="/blog"
                className="inline-flex text-sm font-black text-brand-active transition-opacity hover:opacity-75"
              >
                ← بازگشت به مقالات
              </Link>

              <div className="mt-6">
                <span className="text-sm font-black text-brand-active">
                  آموزش و راهنما
                </span>

                <h1 className="mt-3 text-3xl font-black leading-[1.6] text-ink sm:text-5xl">
                  {
                    article.title
                  }
                </h1>

                <p className="mt-5 text-base leading-9 text-ink-secondary">
                  {
                    article.excerpt
                  }
                </p>
              </div>

              {article.coverImageUrl && (
                <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-line bg-surface-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      article.coverImageUrl
                    }
                    alt={
                      article.title
                    }
                    className="aspect-[16/9] w-full object-cover"
                  />
                </div>
              )}

              <div className="mt-10 rounded-[1.5rem] border border-line bg-surface p-5 shadow-card sm:p-8">
                <div
                  className="article-content"
                  dangerouslySetInnerHTML={{
                    __html:
                      sanitizeArticleHtml(
                        article.content,
                      ),
                  }}
                />
              </div>
            </div>
          </div>
        </article>
      </main>

      <Footer
        settings={
          publicSettings
        }
      />
    </>
  );
}
