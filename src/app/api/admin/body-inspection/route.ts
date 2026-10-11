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
      },
      401,
    );
  }

  const page =
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

  return jsonResponse({
    ok: true,
    page,
  });
}

export async function PATCH(
  request: Request,
) {
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
    description.length <
      10 ||
    videoTitle.length <
      2 ||
    galleryTitle.length <
      2
  ) {
    return jsonResponse(
      {
        ok: false,
        message:
          "اطلاعات واردشده کامل نیست.",
      },
      400,
    );
  }

  if (
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
    await prisma.bodyInspectionPage.upsert({
      where: {
        id:
          BODY_INSPECTION_PAGE_ID,
      },

      create: {
        id:
          BODY_INSPECTION_PAGE_ID,

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
  });
}