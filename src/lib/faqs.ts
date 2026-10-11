import {
  prisma,
} from "@/lib/prisma";

export async function getPublicFaqs() {
  return prisma.faq.findMany({
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
          "asc",
      },
    ],

    select: {
      id:
        true,

      question:
        true,

      answer:
        true,
    },
  });
}