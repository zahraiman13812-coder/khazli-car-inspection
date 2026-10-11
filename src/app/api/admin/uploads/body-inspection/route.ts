import {
  NextResponse,
} from "next/server";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  saveBodyInspectionImage,
} from "@/lib/body-inspection-image-storage";

import {
  isTrustedMutationRequest,
} from "@/lib/request-security";

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
        },
        {
          status: 403,
        },
      );
    }

    const formData =
      await request.formData();

    const file =
      formData.get(
        "file",
      );

    if (
      !(file instanceof File)
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "تصویر ارسال نشده است.",
        },
        {
          status: 400,
        },
      );
    }

    const imageUrl =
      await saveBodyInspectionImage(
        file,
      );

    return NextResponse.json({
      ok: true,
      imageUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,

        message:
          error instanceof Error
            ? error.message
            : "آپلود تصویر انجام نشد.",
      },
      {
        status: 400,
      },
    );
  }
}