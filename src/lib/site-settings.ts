import {
  prisma,
} from "@/lib/prisma";

import {
  siteDefaults,
} from "@/config/site-defaults";

export async function getSiteSettings() {
  if (process.env.DEMO_MODE === "true") return { ...siteDefaults, instagramUrl: null, logoUrl: "/brand/logo.png", mapUrl: null, baladMapUrl: null, neshanMapUrl: null, createdAt: new Date(0), updatedAt: new Date(0) };
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
