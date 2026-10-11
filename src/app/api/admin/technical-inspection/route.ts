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

function validVideoUrl(
  value: string,
) {
  if (
    !value
  ) {
    return true;
  }

  if (
    value.startsWith(
      "/",
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

  const page =
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

  return jsonResponse({
    ok: true,
    page,
  });
}

export async function PATCH(
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
        title?: unknown;
        description?: unknown;
        videoTitle?: unknown;
        videoUrl?: unknown;
        galleryTitle?: unknown;
      };

    const title =
      typeof body.title ===
      "string"
        ? body.title.trim()
        : "";

    const description =
      typeof body.description ===
      "string"
        ? body.description.trim()
        : "";

    const videoTitle =
      typeof body.videoTitle ===
      "string"
        ? body.videoTitle.trim()
        : "";

    const videoUrl =
      typeof body.videoUrl ===
      "string"
        ? body.videoUrl.trim()
        : "";

    const galleryTitle =
      typeof body.galleryTitle ===
      "string"
        ? body.galleryTitle.trim()
        : "";

    if (
      title.length <
        2 ||
      title.length >
        160
    ) {
      return jsonResponse(
        {
          ok: false,
          message:
            "عنوان صفحه معتبر نیست.",
        },
        400,
      );
    }

    if (
      description.length <
        10 ||
      description.length >
        5000
    ) {
      return jsonResponse(
        {
          ok: false,
          message:
            "توضیحات صفحه معتبر نیست.",
        },
        400,
      );
    }

    if (
      videoTitle.length <
        2 ||
      videoTitle.length >
        160
    ) {
      return jsonResponse(
        {
          ok: false,
          message:
            "عنوان ویدیو معتبر نیست.",
        },
        400,
      );
    }

    if (
      galleryTitle.length <
        2 ||
      galleryTitle.length >
        160
    ) {
      return jsonResponse(
        {
          ok: false,
          message:
            "عنوان گالری معتبر نیست.",
        },
        400,
      );
    }

    if (
      videoUrl.length >
        1000 ||
      !validVideoUrl(
        videoUrl,
      )
    ) {
      return jsonResponse(
        {
          ok: false,
          message:
            "لینک ویدیو معتبر نیست.",
        },
        400,
      );
    }

    const page =
      await prisma.technicalInspectionPage.upsert({
        where: {
          id:
            TECHNICAL_INSPECTION_PAGE_ID,
        },

        create: {
          id:
            TECHNICAL_INSPECTION_PAGE_ID,

          title,
          description,
          videoTitle,

          videoUrl:
            videoUrl ||
            null,

          galleryTitle,
        },

        update: {
          title,
          description,
          videoTitle,

          videoUrl:
            videoUrl ||
            null,

          galleryTitle,
        },
      });

    return jsonResponse({
      ok: true,

      page,

      message:
        "اطلاعات بررسی فنی ذخیره شد.",
    });
  } catch (error) {
    console.error(
      "TECHNICAL_INSPECTION_UPDATE_ERROR",
      error,
    );

    return jsonResponse(
      {
        ok: false,
        message:
          "ذخیره اطلاعات انجام نشد.",
      },
      500,
    );
  }
}