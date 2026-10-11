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

export const runtime =
  "nodejs";

type RouteContext = {
  params:
    Promise<{
      id:
        string;
    }>;
};

export async function DELETE(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  if (
    !await isAdminAuthenticated()
  ) {
    return NextResponse.json(
      {
        ok:
          false,
      },
      {
        status:
          401,
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
        ok:
          false,

        message:
          "درخواست معتبر نیست.",
      },
      {
        status:
          403,
      },
    );
  }

  const {
    id,
  } =
    await params;

  const existing =
    await prisma.appointmentBlock.findUnique({
      where: {
        id,
      },
    });

  if (
    !existing
  ) {
    return NextResponse.json(
      {
        ok:
          false,

        message:
          "محدودیت زمانی پیدا نشد.",
      },
      {
        status:
          404,
      },
    );
  }

  await prisma.appointmentBlock.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    ok:
      true,

    message:
      existing.time
        ? "ساعت دوباره برای رزرو باز شد."
        : "روز دوباره برای رزرو باز شد.",
  });
}