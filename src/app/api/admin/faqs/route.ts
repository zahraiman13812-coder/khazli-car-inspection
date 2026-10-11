import {
  NextResponse,
} from "next/server";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  prisma,
} from "@/lib/prisma";

type CreateFaqBody = {
  question?: unknown;
  answer?: unknown;
};

export async function GET() {
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

    const items =
      await prisma.faq.findMany({
        orderBy: [
          {
            sortOrder:
              "asc",
          },
          {
            createdAt:
              "asc",
          },
        ],
      });

    return NextResponse.json({
      ok: true,
      items,
    });
  } catch (error) {
    console.error(
      "ADMIN_FAQS_GET_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "دریافت سوالات با خطا مواجه شد.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  request: Request,
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

    const body =
      (await request.json()) as CreateFaqBody;

    const question =
      String(
        body.question ?? "",
      ).trim();

    const answer =
      String(
        body.answer ?? "",
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
            "متن سوال باید بین ۵ تا ۳۰۰ کاراکتر باشد.",
        },
        {
          status: 400,
        },
      );
    }

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
            "متن پاسخ باید بین ۵ تا ۳۰۰۰ کاراکتر باشد.",
        },
        {
          status: 400,
        },
      );
    }

    const aggregate =
      await prisma.faq.aggregate({
        _max: {
          sortOrder:
            true,
        },
      });

    const item =
      await prisma.faq.create({
        data: {
          question,
          answer,

          sortOrder:
            (aggregate._max
              .sortOrder ??
              -1) +
            1,

          isActive:
            true,
        },
      });

    return NextResponse.json(
      {
        ok: true,

        message:
          "سوال جدید با موفقیت اضافه شد.",

        item,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "ADMIN_FAQS_POST_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "ثبت سوال با خطا مواجه شد.",
      },
      {
        status: 500,
      },
    );
  }
}