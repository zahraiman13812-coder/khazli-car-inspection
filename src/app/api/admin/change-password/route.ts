import {
  NextResponse,
} from "next/server";

import {
  changeAdminPassword,
  createAdminSession,
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  isTrustedMutationRequest,
} from "@/lib/request-security";

type ChangePasswordBody = {
  currentPassword?: unknown;
  newPassword?: unknown;
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

    const authenticated =
      await isAdminAuthenticated();

    if (!authenticated) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "نشست مدیریت معتبر نیست.",
        },
        {
          status: 401,
        },
      );
    }

    let body:
      ChangePasswordBody;

    try {
      body =
        (await request.json()) as ChangePasswordBody;
    } catch {
      return NextResponse.json(
        {
          ok: false,
          message:
            "اطلاعات ارسال‌شده معتبر نیست.",
        },
        {
          status: 400,
        },
      );
    }

    const currentPassword =
      typeof body.currentPassword ===
      "string"
        ? body.currentPassword
        : "";

    const newPassword =
      typeof body.newPassword ===
      "string"
        ? body.newPassword
        : "";

    if (
      !currentPassword
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "رمز عبور فعلی را وارد کنید.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      newPassword.length < 12
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "رمز جدید باید حداقل ۱۲ کاراکتر باشد.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      newPassword.length > 128
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "رمز جدید بیش از حد طولانی است.",
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await changeAdminPassword({
        currentPassword,
        newPassword,
      });

    if (!result.ok) {
      if (
        result.reason ===
        "INVALID_CURRENT_PASSWORD"
      ) {
        return NextResponse.json(
          {
            ok: false,
            message:
              "رمز عبور فعلی صحیح نیست.",
          },
          {
            status: 401,
          },
        );
      }

      if (
        result.reason ===
        "SAME_PASSWORD"
      ) {
        return NextResponse.json(
          {
            ok: false,
            message:
              "رمز جدید باید با رمز فعلی متفاوت باشد.",
          },
          {
            status: 400,
          },
        );
      }
    }

    /*
     * sessionVersion تغییر کرده و Session قبلی
     * باطل شده؛ برای همین یک Session جدید برای
     * همین مرورگر ایجاد می‌کنیم.
     */
    await createAdminSession();

    return NextResponse.json({
      ok: true,
      message:
        "رمز عبور با موفقیت تغییر کرد.",
    });
  } catch (error) {
    console.error(
      "ADMIN_CHANGE_PASSWORD_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "تغییر رمز عبور انجام نشد.",
      },
      {
        status: 500,
      },
    );
  }
}