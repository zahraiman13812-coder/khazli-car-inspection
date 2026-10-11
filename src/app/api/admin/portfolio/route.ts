import {
  NextResponse,
} from "next/server";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  prisma,
} from "@/lib/prisma";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

type CreateBody = {
  title?:
    unknown;

  vehicle?:
    unknown;

  category?:
    unknown;

  description?:
    unknown;

  imageUrl?:
    unknown;

  /*
   * Legacy compatibility.
   * Older PortfolioManager versions sent afterImageUrl.
   */
  afterImageUrl?:
    unknown;

  isActive?:
    unknown;
};

const allowedCategories = [
  "paint",
  "body",
  "technical",
  "full",
] as const;

function isValidImageSource(
  value: string,
) {
  /*
   * Accept any same-origin absolute path returned by our uploader.
   * Reject protocol-relative URLs such as //example.com/file.jpg.
   */
  if (
    value.startsWith(
      "/",
    ) &&
    !value.startsWith(
      "//",
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

    return NextResponse.json({
      ok:
        true,

      items,
    });
  } catch (
    error
  ) {
    console.error(
      "ADMIN_PORTFOLIO_GET_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,

        message:
          "دریافت نمونه‌کارها با خطا مواجه شد.",
      },
      {
        status:
          500,
      },
    );
  }
}

export async function POST(
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
      (await request.json()) as CreateBody;

    const title =
      String(
        body.title ??
          "",
      ).trim();

    const vehicle =
      String(
        body.vehicle ??
          "",
      ).trim();

    const category =
      String(
        body.category ??
          "",
      ).trim();

    const description =
      String(
        body.description ??
          "",
      ).trim();

    /*
     * New UI sends imageUrl.
     * Legacy UI may still send afterImageUrl.
     */
    const imageUrl =
      String(
        body.imageUrl ??
          body.afterImageUrl ??
          "",
      ).trim();

    if (
      title.length <
        3 ||
      title.length >
        150
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "عنوان نمونه‌کار معتبر نیست.",
        },
        {
          status:
            400,
        },
      );
    }

    if (
      vehicle.length <
        2 ||
      vehicle.length >
        120
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "نام خودرو معتبر نیست.",
        },
        {
          status:
            400,
        },
      );
    }

    if (
      !allowedCategories.includes(
        category as
          (typeof allowedCategories)[number],
      )
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "دسته‌بندی نمونه‌کار معتبر نیست.",
        },
        {
          status:
            400,
        },
      );
    }

    if (
      description.length <
        5 ||
      description.length >
        2000
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "توضیحات نمونه‌کار معتبر نیست.",
        },
        {
          status:
            400,
        },
      );
    }

    if (
      !imageUrl ||
      !isValidImageSource(
        imageUrl,
      )
    ) {
      console.error(
        "ADMIN_PORTFOLIO_INVALID_IMAGE",
        {
          imageUrl,
        },
      );

      return NextResponse.json(
        {
          ok:
            false,

          message:
            "تصویر نمونه‌کار معتبر نیست.",
        },
        {
          status:
            400,
        },
      );
    }

    const lastItem =
      await prisma.portfolioItem.findFirst({
        orderBy: {
          sortOrder:
            "desc",
        },

        select: {
          sortOrder:
            true,
        },
      });

    const item =
      await prisma.portfolioItem.create({
        data: {
          title,
          vehicle,
          category,
          description,

          /*
           * DB compatibility:
           * afterImageUrl is now the single main image.
           */
          beforeImageUrl:
            null,

          afterImageUrl:
            imageUrl,

          isActive:
            typeof body.isActive ===
              "boolean"
              ? body.isActive
              : true,

          sortOrder:
            (lastItem?.sortOrder ??
              -1) +
            1,
        },
      });

    return NextResponse.json(
      {
        ok:
          true,

        message:
          "نمونه‌کار با موفقیت ثبت شد.",

        item,
      },
      {
        status:
          201,
      },
    );
  } catch (
    error
  ) {
    console.error(
      "ADMIN_PORTFOLIO_POST_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,

        message:
          "ثبت نمونه‌کار با خطا مواجه شد.",
      },
      {
        status:
          500,
      },
    );
  }
}
