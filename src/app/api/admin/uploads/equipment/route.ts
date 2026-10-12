import {
  NextResponse,
} from "next/server";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  deleteEquipmentImage,
  saveEquipmentImage,
} from "@/lib/equipment-image-storage";

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

    const formData =
      await request.formData();

    const file =
      formData.get(
        "file",
      );

    if (
      !(file instanceof File)
    ) {
      return jsonResponse(
        {
          ok: false,
          message:
            "تصویر ارسال نشده است.",
        },
        400,
      );
    }

    const imageUrl =
      await saveEquipmentImage(
        file,
      );

    return jsonResponse({
      ok: true,
      imageUrl,
    });
  } catch (error) {
    console.error(
      "EQUIPMENT_UPLOAD_ERROR",
      error,
    );

    return jsonResponse(
      {
        ok: false,

        message:
          error instanceof Error
            ? error.message
            : "آپلود تصویر انجام نشد.",
      },
      400,
    );
  }
}

export async function DELETE(
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
      };

    const imageUrl =
      typeof body.imageUrl ===
      "string"
        ? body.imageUrl
        : "";

    await deleteEquipmentImage(
      imageUrl,
    );

    return jsonResponse({
      ok: true,
    });
  } catch (error) {
    console.error(
      "EQUIPMENT_UPLOAD_DELETE_ERROR",
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