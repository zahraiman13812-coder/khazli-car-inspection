import EquipmentManager from "@/components/admin/EquipmentManager";

import {
  getAdminEquipmentItems,
} from "@/lib/equipment";

export const dynamic =
  "force-dynamic";

export default async function AdminEquipmentPage() {
  const equipment =
    await getAdminEquipmentItems();

  const initialItems =
    equipment.map(
      (
        item,
      ) => ({
        id:
          item.id,

        name:
          item.name,

        description:
          item.description,

        imageUrl:
          item.imageUrl,

        altText:
          item.altText,

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
    <EquipmentManager
      initialItems={
        initialItems
      }
    />
  );
}