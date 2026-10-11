import {
  NextResponse,
} from "next/server";

import {
  createAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";

import {
  isTrustedMutationRequest,
} from "@/lib/request-security";

export const runtime =
  "nodejs";

type LoginBody = {
  password?: unknown;
};

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
          ok: false,
          message:
            "درخواست معتبر نیست.",
        },
        {
          status: 403,
        },
      );
    }

    let body:
      LoginBody;

    try {
      body =
        (await request.json()) as LoginBody;
    } catch {
      return NextResponse.json(
        {
          ok: false,
          message:
            "اطلاعات ورود معتبر نیست.",
        },
        {
          status: 400,
        },
      );
    }

    const password =
      typeof body.password ===
      "string"
        ? body.password
        : "";

    const valid =
      await verifyAdminPassword(
        password,
      );

    if (
      !valid
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "رمز عبور صحیح نیست.",
        },
        {
          status: 401,
        },
      );
    }

    await createAdminSession();

    return NextResponse.json({
      ok: true,
      message:
        "ورود با موفقیت انجام شد.",
    });
  } catch (error) {
    console.error(
      "ADMIN_LOGIN_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "ورود به پنل با خطا مواجه شد.",
      },
      {
        status: 500,
      },
    );
  }
}
