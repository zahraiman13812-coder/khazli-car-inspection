import type {
  MetadataRoute,
} from "next";

import {
  prisma,
} from "@/lib/prisma";

import {
  getSiteUrl,
} from "@/lib/site-url";

export const dynamic =
  "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    getSiteUrl();

  const articles =
    await prisma.article.findMany({
      where: {
        status:
          "published",
      },

      select: {
        slug:
          true,

        updatedAt:
          true,
      },
    });

  const staticPages: MetadataRoute.Sitemap = [
    {
      url:
        siteUrl,
      changeFrequency:
        "weekly",
      priority:
        1,
    },
    {
      url:
        `${siteUrl}/technical-inspection`,
      changeFrequency:
        "monthly",
      priority:
        0.8,
    },
    {
      url:
        `${siteUrl}/body-inspection`,
      changeFrequency:
        "monthly",
      priority:
        0.8,
    },
    {
      url:
        `${siteUrl}/portfolio`,
      changeFrequency:
        "weekly",
      priority:
        0.8,
    },
    {
      url:
        `${siteUrl}/equipment`,
      changeFrequency:
        "monthly",
      priority:
        0.7,
    },
    {
      url:
        `${siteUrl}/blog`,
      changeFrequency:
        "weekly",
      priority:
        0.8,
    },
  ];

  const articlePages: MetadataRoute.Sitemap =
    articles.map(
      (
        article,
      ) => ({
        url:
          `${siteUrl}/blog/${encodeURIComponent(
            article.slug,
          )}`,

        lastModified:
          article.updatedAt,

        changeFrequency:
          "monthly",

        priority:
          0.7,
      }),
    );

  return [
    ...staticPages,
    ...articlePages,
  ];
}
