import {
  NextResponse,
} from "next/server";

import {
  getSiteSettings,
} from "@/lib/site-settings";

export const dynamic =
  "force-dynamic";

export async function GET() {
  try {
    const settings =
      await getSiteSettings();

    return NextResponse.json(
      {
        ok:
          true,

        settings: {
          businessName:
            settings.businessName,

          description:
            settings.description,

          phone:
            settings.phone,

          whatsappPhone:
            settings.whatsappPhone,

          address:
            settings.address,

          businessHours:
            settings.businessHours,

          instagramUrl:
            settings.instagramUrl,

          logoUrl:
            settings.logoUrl,

          mapUrl:
            settings.mapUrl,

          baladMapUrl:
            settings.baladMapUrl,

          neshanMapUrl:
            settings.neshanMapUrl,
        },
      },
      {
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "PUBLIC_SITE_SETTINGS_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,

        message:
          "دریافت اطلاعات سایت انجام نشد.",
      },
      {
        status:
          500,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  }
}
