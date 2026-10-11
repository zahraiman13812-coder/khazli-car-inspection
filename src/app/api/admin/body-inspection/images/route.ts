import {
  NextResponse,
} from "next/server";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  BODY_INSPECTION_PAGE_ID,
  bodyInspectionDefaults,
} from "@/lib/body-inspection";

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

function nullableText(
  value: unknown,
  maxLength: number,
) {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const result =
    value
      .trim()
      .slice(
        0,
        maxLength,
      );

  return result ||
    null;
}

function parseSortOrder(
  value: unknown,
) {
  const number =
    Number(
      value,
    );

  if (
    !Number.isFinite(
      number,
    )
  ) {
    return 0;
  }

  return Math.trunc(
    number,
  );
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

    await prisma.bodyInspectionPage.upsert({
      where: {
        id:
          BODY_INSPECTION_PAGE_ID,
      },

      update:
        {},

      create: {
        id:
          BODY_INSPECTION_PAGE_ID,

        title:
          bodyInspectionDefaults.title,

        description:
          bodyInspectionDefaults.description,

        videoTitle:
          bodyInspectionDefaults.videoTitle,

        galleryTitle:
          bodyInspectionDefaults.galleryTitle,
      },
    });

    const image =
      await prisma.bodyInspectionImage.create({
        data: {
          pageId:
            BODY_INSPECTION_PAGE_ID,

          imageUrl,

          title:
            nullableText(
              body.title,
              160,
            ),

          caption:
            nullableText(
              body.caption,
              1500,
            ),

          altText:
            nullableText(
              body.altText,
              250,
            ),

          sortOrder:
            parseSortOrder(
              body.sortOrder,
            ),

          isActive:
            typeof body.isActive ===
            "boolean"
              ? body.isActive
              : true,
        },
      });

    return jsonResponse(
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
      201,
    );
  } catch (error) {
    console.error(
      "BODY_INSPECTION_IMAGE_CREATE_ERROR",
      error,
    );

    return jsonResponse(
      {
        ok: false,
        message:
          "ثبت تصویر انجام نشد.",
      },
      500,
    );
  }
}