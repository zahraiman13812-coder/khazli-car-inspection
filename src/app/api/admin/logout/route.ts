import {
  NextResponse,
} from "next/server";

import {
  clearAdminSession,
} from "@/lib/admin-auth";

import {
  isTrustedMutationRequest,
} from "@/lib/request-security";

export async function POST(
  request: Request,
) {
  try {
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

    await clearAdminSession();

    return NextResponse.json({
      ok:
        true,

      message:
        "از حساب مدیریت خارج شدید.",
    });
  } catch (error) {
    console.error(
      "ADMIN_LOGOUT_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,

        message:
          "خروج از حساب انجام نشد.",
      },
      {
        status:
          500,
      },
    );
  }
}