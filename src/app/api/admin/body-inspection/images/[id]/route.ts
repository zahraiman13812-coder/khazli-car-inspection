import {
  NextResponse,
} from "next/server";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  deleteBodyInspectionImage,
} from "@/lib/body-inspection-image-storage";

import {
  prisma,
} from "@/lib/prisma";

import {
  isTrustedMutationRequest,
} from "@/lib/request-security";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

type RouteContext = {
  params:
    Promise<{
      id: string;
    }>;
};

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

function parseNullableText(
  value: unknown,
  current:
    string | null,
  maxLength: number,
) {
  if (
    typeof value !==
    "string"
  ) {
    return current;
  }

  const text =
    value
      .trim()
      .slice(
        0,
        maxLength,
      );

  return text ||
    null;
}

export async function PATCH(
  request: Request,
  context: RouteContext,
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

    const {
      id,
    } =
      await context.params;

    const existing =
      await prisma.bodyInspectionImage.findUnique({
        where: {
          id,
        },
      });

    if (
      !existing
    ) {
      return jsonResponse(
        {
          ok: false,
          message:
            "تصویر پیدا نشد.",
        },
        404,
      );
    }

    const body =
      await request.json() as {
        imageUrl?: unknown;
        title?: unknown;
        caption?: unknown;
        altText?: unknown;
        sortOrder?: unknown;
        isActive?: unknown;
      };

    const imageUrl =
      typeof body.imageUrl ===
      "string"
        ? body.imageUrl.trim()
        : existing.imageUrl;

    if (
      !imageUrl.startsWith(
        "/uploads/body-inspection/",
      )
    ) {
      return jsonResponse(
        {
          ok: false,
          message:
            "تصویر معتبر نیست.",
        },
        400,
      );
    }

    const parsedSortOrder =
      Number(
        body.sortOrder,
      );

    const sortOrder =
      Number.isFinite(
        parsedSortOrder,
      )
        ? Math.trunc(
            parsedSortOrder,
          )
        : existing.sortOrder;

    const updated =
      await prisma.bodyInspectionImage.update({
        where: {
          id,
        },

        data: {
          imageUrl,

          title:
            parseNullableText(
              body.title,
              existing.title,
              160,
            ),

          caption:
            parseNullableText(
              body.caption,
              existing.caption,
              1500,
            ),

          altText:
            parseNullableText(
              body.altText,
              existing.altText,
              250,
            ),

          sortOrder,

          isActive:
            typeof body.isActive ===
            "boolean"
              ? body.isActive
              : existing.isActive,
        },
      });

    /*
     * Remove the old local image only after
     * the database update succeeds.
     */
    if (
      existing.imageUrl !==
      imageUrl
    ) {
      try {
        await deleteBodyInspectionImage(
          existing.imageUrl,
        );
      } catch (error) {
        console.error(
          "OLD_BODY_INSPECTION_IMAGE_DELETE_ERROR",
          error,
        );
      }
    }

    return jsonResponse({
      ok: true,

      image: {
        ...updated,

        createdAt:
          updated.createdAt.toISOString(),

        updatedAt:
          updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error(
      "BODY_INSPECTION_IMAGE_UPDATE_ERROR",
      error,
    );

    return jsonResponse(
      {
        ok: false,
        message:
          "ویرایش تصویر انجام نشد.",
      },
      500,
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext,
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

    const {
      id,
    } =
      await context.params;

    const existing =
      await prisma.bodyInspectionImage.findUnique({
        where: {
          id,
        },
      });

    if (
      !existing
    ) {
      return jsonResponse(
        {
          ok: false,
          message:
            "تصویر پیدا نشد.",
        },
        404,
      );
    }

    await prisma.bodyInspectionImage.delete({
      where: {
        id,
      },
    });

    try {
      await deleteBodyInspectionImage(
        existing.imageUrl,
      );
    } catch (error) {
      console.error(
        "BODY_INSPECTION_IMAGE_FILE_DELETE_ERROR",
        error,
      );
    }

    return jsonResponse({
      ok: true,
      message:
        "تصویر با موفقیت حذف شد.",
    });
  } catch (error) {
    console.error(
      "BODY_INSPECTION_IMAGE_DELETE_ERROR",
      error,
    );

    return jsonResponse(
      {
        ok: false,
        message:
          "حذف تصویر انجام نشد.",
      },
      500,
    );
  }
}