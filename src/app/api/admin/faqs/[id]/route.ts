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

type UpdateBody = {
  question?: unknown;
  answer?: unknown;
  isActive?: unknown;
};

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
          message: "دسترسی غیرمجاز است.",
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

    const existing =
      await prisma.faq.findUnique({
        where: {
          id,
        },
      });

    if (
      !existing
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "سوال موردنظر پیدا نشد.",
        },
        {
          status: 404,
        },
      );
    }

    const body =
      (await request.json()) as UpdateBody;

    const data: {
      question?: string;
      answer?: string;
      isActive?: boolean;
    } = {};

    if (
      body.question !==
      undefined
    ) {
      const question =
        String(
          body.question,
        ).trim();

      if (
        question.length <
          5 ||
        question.length >
          300
      ) {
        return NextResponse.json(
          {
            ok: false,
            message:
              "متن سوال معتبر نیست.",
          },
          {
            status: 400,
          },
        );
      }

      data.question =
        question;
    }

    if (
      body.answer !==
      undefined
    ) {
      const answer =
        String(
          body.answer,
        ).trim();

      if (
        answer.length <
          5 ||
        answer.length >
          3000
      ) {
        return NextResponse.json(
          {
            ok: false,
            message:
              "متن پاسخ معتبر نیست.",
          },
          {
            status: 400,
          },
        );
      }

      data.answer =
        answer;
    }

    if (
      typeof body.isActive ===
      "boolean"
    ) {
      data.isActive =
        body.isActive;
    }

    const item =
      await prisma.faq.update({
        where: {
          id,
        },

        data,
      });

    return NextResponse.json({
      ok: true,

      message:
        "تغییرات با موفقیت ذخیره شد.",

      item,
    });
  } catch (error) {
    console.error(
      "ADMIN_FAQ_PATCH_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "ویرایش سوال با خطا مواجه شد.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  _request: Request,
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
          message: "دسترسی غیرمجاز است.",
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

    const existing =
      await prisma.faq.findUnique({
        where: {
          id,
        },
      });

    if (
      !existing
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "سوال موردنظر پیدا نشد.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.faq.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      ok: true,

      message:
        "سوال با موفقیت حذف شد.",
    });
  } catch (error) {
    console.error(
      "ADMIN_FAQ_DELETE_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "حذف سوال با خطا مواجه شد.",
      },
      {
        status: 500,
      },
    );
  }
}