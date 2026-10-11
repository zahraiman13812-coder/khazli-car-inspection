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
  TECHNICAL_INSPECTION_PAGE_ID,
  technicalInspectionDefaults,
} from "@/lib/technical-inspection";

export const runtime =
  "nodejs";

export async function POST(
  request: Request,
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
        : "";

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

    await prisma.technicalInspectionPage.upsert({
      where: {
        id:
          TECHNICAL_INSPECTION_PAGE_ID,
      },

      update:
        {},

      create: {
        id:
          TECHNICAL_INSPECTION_PAGE_ID,

        title:
          technicalInspectionDefaults.title,

        description:
          technicalInspectionDefaults.description,

        videoTitle:
          technicalInspectionDefaults.videoTitle,

        galleryTitle:
          technicalInspectionDefaults.galleryTitle,
      },
    });

    const image =
      await prisma.technicalInspectionImage.create({
        data: {
          pageId:
            TECHNICAL_INSPECTION_PAGE_ID,

          imageUrl,

          title:
            typeof body.title ===
              "string" &&
            body.title.trim()
              ? body.title.trim()
              : null,

          caption:
            typeof body.caption ===
              "string" &&
            body.caption.trim()
              ? body.caption.trim()
              : null,

          altText:
            typeof body.altText ===
              "string" &&
            body.altText.trim()
              ? body.altText.trim()
              : null,

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
              : 0,

          isActive:
            typeof body.isActive ===
            "boolean"
              ? body.isActive
              : true,
        },
      });

    return NextResponse.json(
      {
        ok: true,

        image: {
          ...image,

          createdAt:
            image.createdAt.toISOString(),

          updatedAt:
            image.updatedAt.toISOString(),
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "TECHNICAL_IMAGE_CREATE_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "ثبت تصویر انجام نشد.",
      },
      {
        status: 500,
      },
    );
  }
}