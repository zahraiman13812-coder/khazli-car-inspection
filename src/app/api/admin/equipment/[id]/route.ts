import {
  NextResponse,
} from "next/server";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  deleteEquipmentImage,
} from "@/lib/equipment-image-storage";

import {
  prisma,
} from "@/lib/prisma";

import {
  isTrustedMutationRequest,
} from "@/lib/request-security";

export const runtime =
  "nodejs";

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
      await prisma.equipmentItem.findUnique({
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
            "تجهیز پیدا نشد.",
        },
        404,
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
        : existing.name;

    const description =
      typeof body.description ===
      "string"
        ? body.description.trim()
        : existing.description;

    const imageUrl =
      typeof body.imageUrl ===
      "string"
        ? body.imageUrl.trim()
        : existing.imageUrl;

    const altText =
      typeof body.altText ===
      "string"
        ? body.altText.trim()
        : existing.altText;

    if (
      name.length <
        2 ||
      name.length >
        120
    ) {
      return jsonResponse(
        {
          ok: false,
          message:
            "نام تجهیز معتبر نیست.",
        },
        400,
      );
    }

    if (
      description.length <
        2 ||
      description.length >
        3000
    ) {
      return jsonResponse(
        {
          ok: false,
          message:
            "توضیحات تجهیز معتبر نیست.",
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

    const sortOrder =
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
        : existing.sortOrder;

    const isActive =
      typeof body.isActive ===
      "boolean"
        ? body.isActive
        : existing.isActive;

    const updated =
      await prisma.equipmentItem.update({
        where: {
          id,
        },

        data: {
          name,
          description,
          imageUrl,

          altText:
            altText ||
            null,

          isActive,
          sortOrder,
        },
      });

    if (
      existing.imageUrl !==
      imageUrl
    ) {
      try {
        await deleteEquipmentImage(
          existing.imageUrl,
        );
      } catch (error) {
        console.error(
          "OLD_EQUIPMENT_IMAGE_DELETE_ERROR",
          error,
        );
      }
    }

    return jsonResponse({
      ok: true,

      item: {
        ...updated,

        createdAt:
          updated.createdAt.toISOString(),

        updatedAt:
          updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error(
      "ADMIN_EQUIPMENT_UPDATE_ERROR",
      error,
    );

    return jsonResponse(
      {
        ok: false,
        message:
          "ویرایش تجهیز انجام نشد.",
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
      await prisma.equipmentItem.findUnique({
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
            "تجهیز پیدا نشد.",
        },
        404,
      );
    }

    await prisma.equipmentItem.delete({
      where: {
        id,
      },
    });

    try {
      await deleteEquipmentImage(
        existing.imageUrl,
      );
    } catch (error) {
      console.error(
        "EQUIPMENT_IMAGE_DELETE_ERROR",
        error,
      );
    }

    return jsonResponse({
      ok: true,
      message:
        "تجهیز حذف شد.",
    });
  } catch (error) {
    console.error(
      "ADMIN_EQUIPMENT_DELETE_ERROR",
      error,
    );

    return jsonResponse(
      {
        ok: false,
        message:
          "حذف تجهیز انجام نشد.",
      },
      500,
    );
  }
}