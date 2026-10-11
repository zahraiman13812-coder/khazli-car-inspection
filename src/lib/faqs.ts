import {
  prisma,
} from "@/lib/prisma";

export async function getPublicFaqs() {
  if (process.env.DEMO_MODE === "true") return [];
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