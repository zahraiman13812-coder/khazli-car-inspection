import PortfolioManager from "@/components/admin/PortfolioManager";

import {
  prisma,
} from "@/lib/prisma";

export default async function AdminPortfolioPage() {
  const items =
    await prisma.portfolioItem.findMany({
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
    });

  const initialItems =
    items.map(
      (item) => ({
        id:
          item.id,

        title:
          item.title,

        vehicle:
          item.vehicle,

        category:
          item.category,

        description:
          item.description,

        beforeImageUrl:
          item.beforeImageUrl,

        afterImageUrl:
          item.afterImageUrl,

        isActive:
          item.isActive,

        sortOrder:
          item.sortOrder,

        createdAt:
          item.createdAt.toISOString(),

        updatedAt:
          item.updatedAt.toISOString(),
      }),
    );

  return (
    <PortfolioManager
      initialItems={
        initialItems
      }
    />
  );
}