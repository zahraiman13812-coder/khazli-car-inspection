import FeedbackManager from "@/components/admin/FeedbackManager";

import {
  prisma,
} from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

export default async function AdminFeedbackPage() {
  const [
    items,
    total,
  ] =
    await Promise.all([
      prisma.feedback.findMany({
        take:
          100,

        orderBy: {
          createdAt:
            "desc",
        },
      }),

      prisma.feedback.count(),
    ]);

  const initialItems =
    items.map(
      (
        item,
      ) => ({
        ...item,

        createdAt:
          item.createdAt.toISOString(),

        updatedAt:
          item.updatedAt.toISOString(),
      }),
    );

  return (
    <FeedbackManager
      initialItems={
        initialItems
      }
      initialTotal={
        total
      }
    />
  );
}
