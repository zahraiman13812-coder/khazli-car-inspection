import {
  NextResponse,
} from "next/server";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  deleteManagedPortfolioImage,
} from "@/lib/portfolio-image-storage";

import {
  prisma,
} from "@/lib/prisma";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateBody = {
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

async function deleteImageIfUnused(
  imageUrl:
    string,
) {
  const usedElsewhere =
    await prisma.portfolioItem.count({
      where: {
        OR: [
          {
            beforeImageUrl:
              imageUrl,
          },
          {
            afterImageUrl:
              imageUrl,
          },
        ],
      },
    });

  if (
    usedElsewhere >
    0
  ) {
    return;
  }

  try {
    await deleteManagedPortfolioImage(
      imageUrl,
    );
  } catch (
    error
  ) {
    console.warn(
      "PORTFOLIO_IMAGE_CLEANUP_WARNING",
      {
        imageUrl,
        error,
      },
    );
  }
}

export async function PATCH(
  request: Request,
  {
    params,
  }: RouteContext,
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

    const {
      id,
    } =
      await params;

    const existing =
      await prisma.portfolioItem.findUnique({
        where: {
          id,
        },
      });

    if (
      !existing
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "نمونه‌کار پیدا نشد.",
        },
        {
          status:
            404,
        },
      );
    }

    const body =
      (await request.json()) as UpdateBody;

    const data: {
      title?:
        string;

      vehicle?:
        string;

      category?:
        string;

      description?:
        string;

      beforeImageUrl?:
        null;

      afterImageUrl?:
        string;

      isActive?:
        boolean;
    } = {};

    if (
      body.title !==
      undefined
    ) {
      const value =
        String(
          body.title,
        ).trim();

      if (
        value.length <
          3 ||
        value.length >
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

      data.title =
        value;
    }

    if (
      body.vehicle !==
      undefined
    ) {
      const value =
        String(
          body.vehicle,
        ).trim();

      if (
        value.length <
          2 ||
        value.length >
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

      data.vehicle =
        value;
    }

    if (
      body.category !==
      undefined
    ) {
      const value =
        String(
          body.category,
        ).trim();

      if (
        !allowedCategories.includes(
          value as
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

      data.category =
        value;
    }

    if (
      body.description !==
      undefined
    ) {
      const value =
        String(
          body.description,
        ).trim();

      if (
        value.length <
          5 ||
        value.length >
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

      data.description =
        value;
    }

    const sentImage =
      body.imageUrl !==
        undefined ||
      body.afterImageUrl !==
        undefined;

    if (
      sentImage
    ) {
      const value =
        String(
          body.imageUrl ??
            body.afterImageUrl ??
            "",
        ).trim();

      if (
        !value ||
        !isValidImageSource(
          value,
        )
      ) {
        console.error(
          "ADMIN_PORTFOLIO_INVALID_IMAGE",
          {
            imageUrl:
              value,
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

      data.afterImageUrl =
        value;

      data.beforeImageUrl =
        null;
    }

    if (
      typeof body.isActive ===
      "boolean"
    ) {
      data.isActive =
        body.isActive;
    }

    if (
      Object.keys(
        data,
      ).length ===
      0
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "هیچ تغییری برای ذخیره ارسال نشده است.",
        },
        {
          status:
            400,
        },
      );
    }

    const item =
      await prisma.portfolioItem.update({
        where: {
          id,
        },

        data,
      });

    const oldImages =
      new Set(
        [
          existing.beforeImageUrl,
          existing.afterImageUrl,
        ].filter(
          (
            value,
          ): value is string =>
            Boolean(
              value,
            ),
        ),
      );

    const currentImages =
      new Set(
        [
          item.afterImageUrl,
        ],
      );

    for (
      const oldImage
      of oldImages
    ) {
      if (
        !currentImages.has(
          oldImage,
        )
      ) {
        await deleteImageIfUnused(
          oldImage,
        );
      }
    }

    return NextResponse.json({
      ok:
        true,

      message:
        "تغییرات نمونه‌کار با موفقیت ذخیره شد.",

      item,
    });
  } catch (
    error
  ) {
    console.error(
      "ADMIN_PORTFOLIO_PATCH_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,

        message:
          "ویرایش نمونه‌کار با خطا مواجه شد.",
      },
      {
        status:
          500,
      },
    );
  }
}
