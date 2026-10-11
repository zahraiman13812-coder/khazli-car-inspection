import {
  NextResponse,
} from "next/server";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  prisma,
} from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type Body = {
  status?: unknown;
};

const allowedStatuses = [
  "new",
  "read",
  "archived",
] as const;

export async function PATCH(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    const authenticated =
      await isAdminAuthenticated();

    if (
      !authenticated
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

    const {
      id,
    } =
      await params;

    const body =
      (await request.json()) as Body;

    const status =
      String(
        body.status ?? "",
      );

    if (
      !allowedStatuses.includes(
        status as
          (typeof allowedStatuses)[number],
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "وضعیت معتبر نیست.",
        },
        {
          status: 400,
        },
      );
    }

    const exists =
      await prisma.feedback.findUnique({
        where: {
          id,
        },
      });

    if (
      !exists
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "پیام پیدا نشد.",
        },
        {
          status: 404,
        },
      );
    }

    const item =
      await prisma.feedback.update({
        where: {
          id,
        },

        data: {
          status,
        },
      });

    return NextResponse.json({
      ok: true,
      item,
    });
  } catch (error) {
    console.error(
      "UPDATE_FEEDBACK_STATUS_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "تغییر وضعیت انجام نشد.",
      },
      {
        status: 500,
      },
    );
  }
}