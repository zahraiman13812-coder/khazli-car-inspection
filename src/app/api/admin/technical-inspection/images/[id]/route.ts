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

import {
  deleteTechnicalInspectionImage,
} from "@/lib/technical-inspection-image-storage";

type RouteContext = {
  params:
    Promise<{
      id: string;
    }>;
};

export const runtime =
  "nodejs";

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    if (
      !await isAdminAuthenticated()
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "دسترسی غیرمجاز است.",
        },
        {
          status: 401,
        },
      );
    }

    if (
      !isTrustedMutationRequest(
        request,
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "درخواست معتبر نیست.",
        },
        {
          status: 403,
        },
      );
    }

    const {
      id,
    } =
      await context.params;

    const existing =
      await prisma.technicalInspectionImage.findUnique({
        where: {
          id,
        },
      });

    if (
      !existing
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "تصویر پیدا نشد.",
        },
        {
          status: 404,
        },
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
        "/uploads/technical-inspection/",
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "تصویر معتبر نیست.",
        },
        {
          status: 400,
        },
      );
    }

    const updated =
      await prisma.technicalInspectionImage.update({
        where: {
          id,
        },

        data: {
          imageUrl,

          title:
            typeof body.title ===
            "string"
              ? body.title.trim() ||
                null
              : existing.title,

          caption:
            typeof body.caption ===
            "string"
              ? body.caption.trim() ||
                null
              : existing.caption,

          altText:
            typeof body.altText ===
            "string"
              ? body.altText.trim() ||
                null
              : existing.altText,

          sortOrder:
            Number.isFinite(
              Number(
                body.sortOrder,
              ),
            )
              ? Math.trunc(
                  Number(
                    body.sortOrder,
                  ),
                )
              : existing.sortOrder,

          isActive:
            typeof body.isActive ===
            "boolean"
              ? body.isActive
              : existing.isActive,
        },
      });

    if (
      existing.imageUrl !==
      imageUrl
    ) {
      try {
        await deleteTechnicalInspectionImage(
          existing.imageUrl,
        );
      } catch (error) {
        console.error(
          "OLD_TECHNICAL_IMAGE_DELETE_ERROR",
          error,
        );
      }
    }

    return NextResponse.json({
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
      "TECHNICAL_IMAGE_UPDATE_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "ویرایش تصویر انجام نشد.",
      },
      {
        status: 500,
      },
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
      return NextResponse.json(
        {
          ok: false,
          message:
            "دسترسی غیرمجاز است.",
        },
        {
          status: 401,
        },
      );
    }

    if (
      !isTrustedMutationRequest(
        request,
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "درخواست معتبر نیست.",
        },
        {
          status: 403,
        },
      );
    }

    const {
      id,
    } =
      await context.params;

    const existing =
      await prisma.technicalInspectionImage.findUnique({
        where: {
          id,
        },
      });

    if (
      !existing
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "تصویر پیدا نشد.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.technicalInspectionImage.delete({
      where: {
        id,
      },
    });

    try {
      await deleteTechnicalInspectionImage(
        existing.imageUrl,
      );
    } catch (error) {
      console.error(
        "TECHNICAL_IMAGE_DELETE_ERROR",
        error,
      );
    }

    return NextResponse.json({
      ok: true,
      message:
        "تصویر حذف شد.",
    });
  } catch (error) {
    console.error(
      "TECHNICAL_IMAGE_DELETE_ROUTE_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "حذف تصویر انجام نشد.",
      },
      {
        status: 500,
      },
    );
  }
}