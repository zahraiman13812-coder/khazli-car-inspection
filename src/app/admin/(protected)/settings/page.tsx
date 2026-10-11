import SiteSettingsManager from "@/components/admin/SiteSettingsManager";

import {
  getSiteSettings,
} from "@/lib/site-settings";

export const dynamic =
  "force-dynamic";

export default async function AdminSettingsPage() {
  const settings =
    await getSiteSettings();

  return (
    <SiteSettingsManager
      initialSettings={{
        businessName:
          settings.businessName,

        description:
          settings.description,

        phone:
          settings.phone,

        whatsappPhone:
          settings.whatsappPhone ??
          "",

        address:
          settings.address,

        businessHours:
          settings.businessHours,

        instagramUrl:
          settings.instagramUrl ??
          "",

        logoUrl:
          settings.logoUrl ??
          "",

        mapUrl:
          settings.mapUrl ??
          "",

        baladMapUrl:
          settings.baladMapUrl ??
          "",

        neshanMapUrl:
          settings.neshanMapUrl ??
          "",
      }}
    />
  );
}
