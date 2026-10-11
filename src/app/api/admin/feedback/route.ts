import {
  NextResponse,
} from "next/server";

import type {
  Prisma,
} from "@/generated/prisma/client";

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

const ALLOWED_STATUSES =
  new Set([
    "new",
    "read",
    "archived",
  ]);

const ALLOWED_TYPES =
  new Set([
    "feedback",
    "suggestion",
    "complaint",
  ]);

function normalizeDigits(
  value: string,
) {
  return value
    .replace(
      /[۰-۹]/g,
      (
        digit,
      ) =>
        String(
          "۰۱۲۳۴۵۶۷۸۹".indexOf(
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
          "٠١٢٣٤٥٦٧٨٩".indexOf(
            digit,
          ),
        ),
    );
}

function createTextVariants(
  value: string,
) {
  const variants =
    new Set<string>();

  const trimmed =
    value.trim();

  if (
    !trimmed
  ) {
    return [];
  }

  variants.add(
    trimmed,
  );

  variants.add(
    trimmed
      .replace(
        /ي/g,
        "ی",
      )
      .replace(
        /ك/g,
        "ک",
      ),
  );

  variants.add(
    trimmed
      .replace(
        /ی/g,
        "ي",
      )
      .replace(
        /ک/g,
        "ك",
      ),
  );

  variants.add(
    normalizeDigits(
      trimmed,
    ),
  );

  return Array.from(
    variants,
  ).filter(Boolean);
}

export async function GET(
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

    const url =
      new URL(
        request.url,
      );

    const search =
      String(
        url.searchParams.get(
          "q",
        ) ??
          "",
      ).trim();

    const status =
      String(
        url.searchParams.get(
          "status",
        ) ??
          "",
      ).trim();

    const type =
      String(
        url.searchParams.get(
          "type",
        ) ??
          "",
      ).trim();

    const where:
      Prisma.FeedbackWhereInput =
      {};

    if (
      ALLOWED_STATUSES.has(
        status,
      )
    ) {
      where.status =
        status;
    }

    if (
      ALLOWED_TYPES.has(
        type,
      )
    ) {
      where.type =
        type;
    }

    if (
      search
    ) {
      const variants =
        createTextVariants(
          search,
        );

      const orConditions:
        Prisma.FeedbackWhereInput[] =
        [];

      for (
        const variant
        of variants
      ) {
        orConditions.push(
          {
            fullName: {
              contains:
                variant,
            },
          },

          {
            phone: {
              contains:
                variant,
            },
          },

          {
            message: {
              contains:
                variant,
            },
          },
        );
      }

      where.OR =
        orConditions;
    }

    const [
      items,
      total,
    ] =
      await Promise.all([
        prisma.feedback.findMany({
          where,

          take:
            100,

          orderBy: {
            createdAt:
              "desc",
          },
        }),

        prisma.feedback.count({
          where,
        }),
      ]);

    return NextResponse.json(
      {
        ok:
          true,

        items,

        total,
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
      "ADMIN_FEEDBACK_GET_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,

        message:
          "دریافت پیام‌ها با خطا مواجه شد.",
      },
      {
        status:
          500,
      },
    );
  }
}
