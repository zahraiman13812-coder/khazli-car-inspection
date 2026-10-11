import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/prisma";

type FeedbackBody = {
  fullName?: unknown;
  phone?: unknown;
  type?: unknown;
  message?: unknown;
};

const allowedTypes = [
  "feedback",
  "suggestion",
  "complaint",
] as const;

function normalizeDigits(
  value: string,
) {
  const persian =
    "۰۱۲۳۴۵۶۷۸۹";

  const arabic =
    "٠١٢٣٤٥٦٧٨٩";

  return value
    .replace(
      /[۰-۹]/g,
      (digit) =>
        String(
          persian.indexOf(
            digit,
          ),
        ),
    )
    .replace(
      /[٠-٩]/g,
      (digit) =>
        String(
          arabic.indexOf(
            digit,
          ),
        ),
    );
}

function normalizePhone(
  value: string,
) {
  return normalizeDigits(
    value,
  )
    .replace(
      /\D/g,
      "",
    )
    .slice(
      0,
      11,
    );
}

export async function POST(
  request: Request,
) {
  try {
    const body =
      (await request.json()) as FeedbackBody;

    const fullName =
      String(
        body.fullName ?? "",
      ).trim();

    const phone =
      normalizePhone(
        String(
          body.phone ?? "",
        ),
      );

    const type =
      String(
        body.type ??
          "feedback",
      ).trim();

    const message =
      String(
        body.message ?? "",
      ).trim();

    if (
      fullName.length >
      100
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "نام واردشده بیش از حد طولانی است.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      phone &&
      !/^09\d{9}$/.test(
        phone,
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "شماره موبایل معتبر نیست.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !allowedTypes.includes(
        type as
          (typeof allowedTypes)[number],
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "نوع پیام معتبر نیست.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      message.length <
      5
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "متن پیام خیلی کوتاه است.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      message.length >
      2000
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "متن پیام بیش از حد طولانی است.",
        },
        {
          status: 400,
        },
      );
    }

    await prisma.feedback.create({
      data: {
        fullName:
          fullName ||
          null,

        phone:
          phone ||
          null,

        type,

        message,

        status:
          "new",
      },
    });

    return NextResponse.json(
      {
        ok: true,
        message:
          "پیام شما با موفقیت ثبت شد.",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "CREATE_FEEDBACK_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "ثبت پیام با خطا مواجه شد.",
      },
      {
        status: 500,
      },
    );
  }
}