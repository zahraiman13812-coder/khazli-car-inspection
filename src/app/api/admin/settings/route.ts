import {
  NextResponse,
} from "next/server";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  getSiteSettings,
} from "@/lib/site-settings";

import {
  prisma,
} from "@/lib/prisma";

import {
  siteDefaults,
} from "@/config/site-defaults";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

type SettingsBody = {
  businessName?:
    unknown;

  description?:
    unknown;

  phone?:
    unknown;

  whatsappPhone?:
    unknown;

  address?:
    unknown;

  businessHours?:
    unknown;

  instagramUrl?:
    unknown;

  logoUrl?:
    unknown;

  mapUrl?:
    unknown;

  baladMapUrl?:
    unknown;

  neshanMapUrl?:
    unknown;
};

function normalizeDigits(
  value: string,
) {
  const persian =
    "۰۱۲۳۴۵۶۷۸۹";

  const arabic =
    "٠١٢٣٤٥٦٧٨٩";

  return value
    .replace(
      /[۰-۹]/g,
      (
        digit,
      ) =>
        String(
          persian.indexOf(
            digit,
          ),
        ),
    )
    .replace(
      /[٠-٩]/g,
      (
        digit,
      ) =>
        String(
          arabic.indexOf(
            digit,
          ),
        ),
    );
}

function normalizePhone(
  value: string,
) {
  return normalizeDigits(
    value,
  )
    .replace(
      /\D/g,
      "",
    )
    .slice(
      0,
      11,
    );
}

function isValidOptionalUrl(
  value: string,
) {
  if (
    !value
  ) {
    return true;
  }

  try {
    const url =
      new URL(
        value,
      );

    return (
      url.protocol ===
        "https:" ||
      url.protocol ===
        "http:"
    );
  } catch {
    return false;
  }
}

function isValidLogoUrl(
  value: string,
) {
  if (
    !value
  ) {
    return true;
  }

  if (
    value.startsWith(
      "/uploads/site-logo/",
    )
  ) {
    return true;
  }

  try {
    const url =
      new URL(
        value,
      );

    return (
      url.protocol ===
        "https:" ||
      url.protocol ===
        "http:"
    );
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const authenticated =
      await isAdminAuthenticated();

    if (
      !authenticated
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "دسترسی غیرمجاز است.",
        },
        {
          status:
            401,
        },
      );
    }

    const settings =
      await getSiteSettings();

    return NextResponse.json(
      {
        ok:
          true,

        settings,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (
    error
  ) {
    console.error(
      "ADMIN_SETTINGS_GET_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,

        message:
          "دریافت تنظیمات با خطا مواجه شد.",
      },
      {
        status:
          500,
      },
    );
  }
}

export async function PATCH(
  request: Request,
) {
  try {
    const authenticated =
      await isAdminAuthenticated();

    if (
      !authenticated
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "دسترسی غیرمجاز است.",
        },
        {
          status:
            401,
        },
      );
    }

    const body =
      (await request.json()) as SettingsBody;

    const businessName =
      String(
        body.businessName ??
          "",
      ).trim();

    const description =
      String(
        body.description ??
          "",
      ).trim();

    const phone =
      normalizePhone(
        String(
          body.phone ??
            "",
        ),
      );

    const whatsappPhone =
      normalizePhone(
        String(
          body.whatsappPhone ??
            "",
        ),
      );

    const address =
      String(
        body.address ??
          "",
      ).trim();

    const businessHours =
      String(
        body.businessHours ??
          "",
      ).trim();

    const instagramUrl =
      String(
        body.instagramUrl ??
          "",
      ).trim();

    const logoUrl =
      String(
        body.logoUrl ??
          "",
      ).trim();

    const mapUrl =
      String(
        body.mapUrl ??
          "",
      ).trim();

    const baladMapUrl =
      String(
        body.baladMapUrl ??
          "",
      ).trim();

    const neshanMapUrl =
      String(
        body.neshanMapUrl ??
          "",
      ).trim();

    if (
      businessName.length <
        2 ||
      businessName.length >
        120
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "نام مجموعه معتبر نیست.",
        },
        {
          status:
            400,
        },
      );
    }

    if (
      description.length <
        10 ||
      description.length >
        500
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "توضیحات مجموعه باید بین ۱۰ تا ۵۰۰ کاراکتر باشد.",
        },
        {
          status:
            400,
        },
      );
    }

    if (
      !/^09\d{9}$/.test(
        phone,
      )
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "شماره تماس باید ۱۱ رقم و با 09 شروع شود.",
        },
        {
          status:
            400,
        },
      );
    }

    if (
      whatsappPhone &&
      !/^09\d{9}$/.test(
        whatsappPhone,
      )
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "شماره واتساپ معتبر نیست.",
        },
        {
          status:
            400,
        },
      );
    }

    if (
      address.length <
        5 ||
      address.length >
        500
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "آدرس واردشده معتبر نیست.",
        },
        {
          status:
            400,
        },
      );
    }

    if (
      businessHours.length <
        3 ||
      businessHours.length >
        200
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "ساعات کاری معتبر نیست.",
        },
        {
          status:
            400,
        },
      );
    }

    if (
      !isValidLogoUrl(
        logoUrl,
      )
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "آدرس فایل لوگو معتبر نیست.",
        },
        {
          status:
            400,
        },
      );
    }

    const links = [
      {
        value:
          instagramUrl,

        label:
          "لینک اینستاگرام",
      },
      {
        value:
          mapUrl,

        label:
          "لینک Google Maps",
      },
      {
        value:
          baladMapUrl,

        label:
          "لینک بلد",
      },
      {
        value:
          neshanMapUrl,

        label:
          "لینک نشان",
      },
    ];

    for (
      const link
      of links
    ) {
      if (
        !isValidOptionalUrl(
          link.value,
        )
      ) {
        return NextResponse.json(
          {
            ok:
              false,

            message:
              `${link.label} معتبر نیست.`,
          },
          {
            status:
              400,
          },
        );
      }
    }

    const settings =
      await prisma.siteSetting.upsert({
        where: {
          id:
            siteDefaults.id,
        },

        update: {
          businessName,

          description,

          phone,

          whatsappPhone:
            whatsappPhone ||
            null,

          address,

          businessHours,

          instagramUrl:
            instagramUrl ||
            null,

          logoUrl:
            logoUrl ||
            null,

          mapUrl:
            mapUrl ||
            null,

          baladMapUrl:
            baladMapUrl ||
            null,

          neshanMapUrl:
            neshanMapUrl ||
            null,
        },

        create: {
          id:
            siteDefaults.id,

          businessName,

          description,

          phone,

          whatsappPhone:
            whatsappPhone ||
            null,

          address,

          businessHours,

          instagramUrl:
            instagramUrl ||
            null,

          logoUrl:
            logoUrl ||
            null,

          mapUrl:
            mapUrl ||
            null,

          baladMapUrl:
            baladMapUrl ||
            null,

          neshanMapUrl:
            neshanMapUrl ||
            null,
        },
      });

    return NextResponse.json({
      ok:
        true,

      message:
        "تنظیمات سایت با موفقیت ذخیره شد.",

      settings,
    });
  } catch (
    error
  ) {
    console.error(
      "ADMIN_SETTINGS_PATCH_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,

        message:
          "ذخیره تنظیمات با خطا مواجه شد.",
      },
      {
        status:
          500,
      },
    );
  }
}
