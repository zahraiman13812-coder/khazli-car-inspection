import {
  prisma,
} from "@/lib/prisma";

export async function getPublicPortfolio() {
  return prisma.portfolioItem.findMany({
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

    select: {
      id:
        true,

      title:
        true,

      vehicle:
        true,

      category:
        true,

      description:
        true,

      beforeImageUrl:
        true,

      afterImageUrl:
        true,
    },
  });
}