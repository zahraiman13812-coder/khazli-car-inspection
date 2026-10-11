import {
  prisma,
} from "@/lib/prisma";

export async function getPublishedArticles(
  take = 12,
) {
  return prisma.article.findMany({
    where: {
      status:
        "published",
    },

    orderBy: [
      {
        publishedAt:
          "desc",
      },

      {
        createdAt:
          "desc",
      },
    ],

    take,

    select: {
      id:
        true,

      title:
        true,

      slug:
        true,

      excerpt:
        true,

      coverImageUrl:
        true,

      publishedAt:
        true,

      createdAt:
        true,
    },
  });
}

export async function getFeaturedArticles(
  take = 3,
) {
  return prisma.article.findMany({
    where: {
      status:
        "published",

      isFeatured:
        true,
    },

    orderBy: [
      {
        publishedAt:
          "desc",
      },

      {
        createdAt:
          "desc",
      },
    ],

    take,

    select: {
      id:
        true,

      title:
        true,

      slug:
        true,

      excerpt:
        true,

      coverImageUrl:
        true,

      publishedAt:
        true,

      createdAt:
        true,
    },
  });
}

export async function getPublishedArticleBySlug(
  slug: string,
) {
  return prisma.article.findFirst({
    where: {
      slug,

      status:
        "published",
    },
  });
}
export async function getHomeArticles() {
  const featured =
    await prisma.article.findMany({
      where: {
        status:
          "published",

        isFeatured:
          true,
      },

      orderBy: [
        {
          publishedAt:
            "desc",
        },

        {
          createdAt:
            "desc",
        },
      ],

      take:
        3,

      select: {
        id:
          true,

        title:
          true,

        slug:
          true,

        excerpt:
          true,

        coverImageUrl:
          true,

        publishedAt:
          true,

        createdAt:
          true,
      },
    });

  if (
    featured.length >
    0
  ) {
    return featured;
  }

  return prisma.article.findMany({
    where: {
      status:
        "published",
    },

    orderBy: [
      {
        publishedAt:
          "desc",
      },

      {
        createdAt:
          "desc",
      },
    ],

    take:
      3,

    select: {
      id:
        true,

      title:
        true,

      slug:
        true,

      excerpt:
        true,

      coverImageUrl:
        true,

      publishedAt:
        true,

      createdAt:
        true,
    },
  });
}