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

type ReorderBody = {
  orderedIds?:
    unknown;
};

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
      (await request.json()) as ReorderBody;

    if (
      !Array.isArray(
        body.orderedIds,
      )
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "ترتیب نمونه‌کارها معتبر نیست.",
        },
        {
          status:
            400,
        },
      );
    }

    const orderedIds =
      body.orderedIds.map(
        (
          value,
        ) =>
          String(
            value,
          ).trim(),
      );

    if (
      orderedIds.length ===
        0 ||
      orderedIds.some(
        (
          id,
        ) =>
          !id,
      )
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "لیست ترتیب نمونه‌کارها خالی یا نامعتبر است.",
        },
        {
          status:
            400,
        },
      );
    }

    const uniqueIds =
      new Set(
        orderedIds,
      );

    if (
      uniqueIds.size !==
      orderedIds.length
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "شناسه تکراری در ترتیب نمونه‌کارها وجود دارد.",
        },
        {
          status:
            400,
        },
      );
    }

    const allItems =
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

    const allIdSet =
      new Set(
        allItems.map(
          (
            item,
          ) =>
            item.id,
        ),
      );

    const hasUnknownId =
      orderedIds.some(
        (
          id,
        ) =>
          !allIdSet.has(
            id,
          ),
      );

    if (
      hasUnknownId
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "حداقل یکی از نمونه‌کارها پیدا نشد.",
        },
        {
          status:
            404,
        },
      );
    }

    /*
     * If the UI ever sends a partial list,
     * keep omitted records after the supplied order.
     */
    const orderedIdSet =
      new Set(
        orderedIds,
      );

    const finalOrder = [
      ...orderedIds,

      ...allItems
        .map(
          (
            item,
          ) =>
            item.id,
        )
        .filter(
          (
            id,
          ) =>
            !orderedIdSet.has(
              id,
            ),
        ),
    ];

    await prisma.$transaction(
      finalOrder.map(
        (
          id,
          sortOrder,
        ) =>
          prisma.portfolioItem.update({
            where: {
              id,
            },

            data: {
              sortOrder,
            },
          }),
      ),
    );

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

      message:
        "ترتیب نمونه‌کارها ذخیره شد.",

      items,
    });
  } catch (
    error
  ) {
    console.error(
      "ADMIN_PORTFOLIO_REORDER_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,

        message:
          "ذخیره ترتیب نمونه‌کارها با خطا مواجه شد.",
      },
      {
        status:
          500,
      },
    );
  }
}
