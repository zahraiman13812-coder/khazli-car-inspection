import {
  NextResponse,
} from "next/server";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  prisma,
} from "@/lib/prisma";

import {
  isTrustedMutationRequest,
} from "@/lib/request-security";

export const runtime =
  "nodejs";

function jsonResponse(
  body: Record<
    string,
    unknown
  >,
  status = 200,
) {
  return NextResponse.json(
    body,
    {
      status,

      headers: {
        "Cache-Control":
          "no-store",
      },
    },
  );
}

function parseBoolean(
  value: unknown,
  fallback = true,
) {
  return typeof value ===
    "boolean"
    ? value
    : fallback;
}

function parseSortOrder(
  value: unknown,
) {
  const number =
    Number(
      value,
    );

  return Number.isFinite(
    number,
  )
    ? Math.trunc(
        number,
      )
    : 0;
}

export async function GET() {
  if (
    !await isAdminAuthenticated()
  ) {
    return jsonResponse(
      {
        ok: false,
        message:
          "دسترسی غیرمجاز است.",
      },
      401,
    );
  }

  const items =
    await prisma.equipmentItem.findMany({
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

  return jsonResponse({
    ok: true,

    items:
      items.map(
        (
          item,
        ) => ({
          ...item,

          createdAt:
            item.createdAt.toISOString(),

          updatedAt:
            item.updatedAt.toISOString(),
        }),
      ),
  });
}

export async function POST(
  request: Request,
) {
  try {
    if (
      !await isAdminAuthenticated()
    ) {
      return jsonResponse(
        {
          ok: false,
          message:
            "دسترسی غیرمجاز است.",
        },
        401,
      );
    }

    if (
      !isTrustedMutationRequest(
        request,
      )
    ) {
      return jsonResponse(
        {
          ok: false,
          message:
            "درخواست معتبر نیست.",
        },
        403,
      );
    }

    const body =
      await request.json() as {
        name?: unknown;
        description?: unknown;
        imageUrl?: unknown;
        altText?: unknown;
        isActive?: unknown;
        sortOrder?: unknown;
      };

    const name =
      typeof body.name ===
      "string"
        ? body.name.trim()
        : "";

    const description =
      typeof body.description ===
      "string"
        ? body.description.trim()
        : "";

    const imageUrl =
      typeof body.imageUrl ===
      "string"
        ? body.imageUrl.trim()
        : "";

    const altText =
      typeof body.altText ===
      "string"
        ? body.altText.trim()
        : "";

    if (
      name.length <
      2
    ) {
      return jsonResponse(
        {
          ok: false,
          message:
            "نام تجهیز الزامی است.",
        },
        400,
      );
    }

    if (
      name.length >
      120
    ) {
      return jsonResponse(
        {
          ok: false,
          message:
            "نام تجهیز بیش از حد طولانی است.",
        },
        400,
      );
    }

    if (
      description.length <
      2
    ) {
      return jsonResponse(
        {
          ok: false,
          message:
            "توضیحات تجهیز الزامی است.",
        },
        400,
      );
    }

    if (
      description.length >
      3000
    ) {
      return jsonResponse(
        {
          ok: false,
          message:
            "توضیحات بیش از حد طولانی است.",
        },
        400,
      );
    }

    if (
      !imageUrl.startsWith(
        "/uploads/equipment/",
      )
    ) {
      return jsonResponse(
        {
          ok: false,
          message:
            "تصویر تجهیز معتبر نیست.",
        },
        400,
      );
    }

    const item =
      await prisma.equipmentItem.create({
        data: {
          name,
          description,
          imageUrl,

          altText:
            altText ||
            null,

          isActive:
            parseBoolean(
              body.isActive,
            ),

          sortOrder:
            parseSortOrder(
              body.sortOrder,
            ),
        },
      });

    return jsonResponse(
      {
        ok: true,

        item: {
          ...item,

          createdAt:
            item.createdAt.toISOString(),

          updatedAt:
            item.updatedAt.toISOString(),
        },
      },
      201,
    );
  } catch (error) {
    console.error(
      "ADMIN_EQUIPMENT_CREATE_ERROR",
      error,
    );

    return jsonResponse(
      {
        ok: false,
        message:
          "ثبت تجهیز انجام نشد.",
      },
      500,
    );
  }
}