import FaqManager from "@/components/admin/FaqManager";

import {
  prisma,
} from "@/lib/prisma";

export default async function AdminFaqsPage() {
  const items =
    await prisma.faq.findMany({
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
    });

  const initialItems =
    items.map(
      (
        item,
      ) => ({
        id:
          item.id,

        question:
          item.question,

        answer:
          item.answer,

        sortOrder:
          item.sortOrder,

        isActive:
          item.isActive,

        createdAt:
          item.createdAt.toISOString(),

        updatedAt:
          item.updatedAt.toISOString(),
      }),
    );

  return (
    <FaqManager
      initialItems={
        initialItems
      }
    />
  );
}