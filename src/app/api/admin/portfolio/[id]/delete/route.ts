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
    /*
     * DB deletion has already succeeded.
     * Storage cleanup should not turn a successful
     * delete into a false server error.
     */
    console.warn(
      "PORTFOLIO_DELETE_IMAGE_CLEANUP_WARNING",
      {
        imageUrl,
        error,
      },
    );
  }
}

export async function POST(
  _request: Request,
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

    if (
      !id
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "شناسه نمونه‌کار معتبر نیست.",
        },
        {
          status:
            400,
        },
      );
    }

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

    await prisma.portfolioItem.delete({
      where: {
        id,
      },
    });

    /*
     * Keep sortOrder contiguous after deletion.
     */
    const remainingItems =
      await prisma.portfolioItem.findMany({
        orderBy: [
          {
            sortOrder:
              "asc",
          },

          {
            createdAt:
              "asc",
          },
        ],

        select: {
          id:
            true,
        },
      });

    if (
      remainingItems.length >
      0
    ) {
      await prisma.$transaction(
        remainingItems.map(
          (
            item,
            sortOrder,
          ) =>
            prisma.portfolioItem.update({
              where: {
                id:
                  item.id,
              },

              data: {
                sortOrder,
              },
            }),
        ),
      );
    }

    const images =
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

    for (
      const imageUrl
      of images
    ) {
      await deleteImageIfUnused(
        imageUrl,
      );
    }

    return NextResponse.json({
      ok:
        true,

      message:
        "نمونه‌کار با موفقیت حذف شد.",
    });
  } catch (
    error
  ) {
    console.error(
      "ADMIN_PORTFOLIO_POST_DELETE_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,

        message:
          "حذف نمونه‌کار با خطا مواجه شد.",
      },
      {
        status:
          500,
      },
    );
  }
}
