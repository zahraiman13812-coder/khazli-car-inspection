import {
  NextResponse,
} from "next/server";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  prisma,
} from "@/lib/prisma";

type ReorderBody = {
  orderedIds?: unknown;
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
          ok: false,
          message: "دسترسی غیرمجاز است.",
        },
        {
          status: 401,
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
          ok: false,
          message:
            "ترتیب ارسال‌شده معتبر نیست.",
        },
        {
          status: 400,
        },
      );
    }

    const orderedIds =
      body.orderedIds
        .map(
          (
            id,
          ) =>
            String(
              id,
            ),
        )
        .filter(
          Boolean,
        );

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
          ok: false,
          message:
            "ترتیب سوالات معتبر نیست.",
        },
        {
          status: 400,
        },
      );
    }

    const existingCount =
      await prisma.faq.count({
        where: {
          id: {
            in:
              orderedIds,
          },
        },
      });

    if (
      existingCount !==
      orderedIds.length
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "یک یا چند سوال پیدا نشد.",
        },
        {
          status: 400,
        },
      );
    }

    await prisma.$transaction(
      orderedIds.map(
        (
          id,
          index,
        ) =>
          prisma.faq.update({
            where: {
              id,
            },

            data: {
              sortOrder:
                index,
            },
          }),
      ),
    );

    return NextResponse.json({
      ok: true,

      message:
        "ترتیب سوالات ذخیره شد.",
    });
  } catch (error) {
    console.error(
      "ADMIN_FAQS_REORDER_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "ذخیره ترتیب با خطا مواجه شد.",
      },
      {
        status: 500,
      },
    );
  }
}