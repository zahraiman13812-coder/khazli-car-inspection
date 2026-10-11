import {
  prisma,
} from "@/lib/prisma";

export async function getPublicEquipmentItems() {
  return prisma.equipmentItem.findMany({
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
  });
}

export async function getAdminEquipmentItems() {
  return prisma.equipmentItem.findMany({
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
}