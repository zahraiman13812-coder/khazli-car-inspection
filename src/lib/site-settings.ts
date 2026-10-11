import {
  prisma,
} from "@/lib/prisma";

import {
  siteDefaults,
} from "@/config/site-defaults";

export async function getSiteSettings() {
  const settings =
    await prisma.siteSetting.findUnique({
      where: {
        id:
          siteDefaults.id,
      },
    });

  if (
    settings
  ) {
    return settings;
  }

  return prisma.siteSetting.create({
    data: {
      id:
        siteDefaults.id,

      businessName:
        siteDefaults.businessName,

      description:
        siteDefaults.description,

      phone:
        siteDefaults.phone,

      whatsappPhone:
        siteDefaults.whatsappPhone,

      address:
        siteDefaults.address,

      businessHours:
        siteDefaults.businessHours,

      instagramUrl:
        siteDefaults.instagramUrl ||
        null,

      logoUrl:
        siteDefaults.logoUrl ||
        null,

      mapUrl:
        siteDefaults.mapUrl ||
        null,

      baladMapUrl:
        siteDefaults.baladMapUrl ||
        null,

      neshanMapUrl:
        siteDefaults.neshanMapUrl ||
        null,
    },
  });
}
