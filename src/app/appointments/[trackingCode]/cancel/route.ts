import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/prisma";

function normalizeDigits(
  value: string,
) {
  const persianDigits =
    "۰۱۲۳۴۵۶۷۸۹";

  const arabicDigits =
    "٠١٢٣٤٥٦٧٨٩";

  return value
    .replace(
      /[۰-۹]/g,
      (digit) =>
        String(
          persianDigits.indexOf(
            digit,
          ),
        ),
    )
    .replace(
      /[٠-٩]/g,
      (digit) =>
        String(
          arabicDigits.indexOf(
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
  ).replace(
    /\D/g,
    "",
  );
}

type Props = {
  params: Promise<{
    trackingCode: string;
  }>;
};

export async function POST(
  request: Request,
  {
    params,
  }: Props,
) {
  try {
    const {
      trackingCode,
    } = await params;

    const body =
      await request.json();

    const phone =
      normalizePhone(
        String(
          body.phone ??
            "",
        ),
      );

    if (
      !trackingCode ||
      !phone
    ) {
      return NextResponse.json(
        {
          ok: false,

          message:
            "اطلاعات لازم برای لغو نوبت کامل نیست.",
        },
        {
          status: 400,
        },
      );
    }

    const appointment =
      await prisma.appointment.findUnique(
        {
          where: {
            trackingCode,
          },
        },
      );

    if (!appointment) {
      return NextResponse.json(
        {
          ok: false,

          message:
            "نوبت موردنظر پیدا نشد.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * Extra verification.
     * تأیید شماره موبایل صاحب نوبت.
     */
    if (
      appointment.phone !==
      phone
    ) {
      return NextResponse.json(
        {
          ok: false,

          message:
            "اطلاعات نوبت مطابقت ندارد.",
        },
        {
          status: 403,
        },
      );
    }

    if (
      appointment.status ===
      "cancelled"
    ) {
      return NextResponse.json(
        {
          ok: false,

          message:
            "این نوبت قبلاً لغو شده است.",
        },
        {
          status: 409,
        },
      );
    }

    if (
      appointment.status ===
      "completed"
    ) {
      return NextResponse.json(
        {
          ok: false,

          message:
            "نوبت انجام‌شده قابل لغو نیست.",
        },
        {
          status: 409,
        },
      );
    }

    await prisma.appointment.update(
      {
        where: {
          trackingCode,
        },

        data: {
          status:
            "cancelled",

          cancelledAt:
            new Date(),
        },
      },
    );

    return NextResponse.json(
      {
        ok: true,

        message:
          "نوبت با موفقیت لغو شد.",
      },
    );
  } catch (error) {
    console.error(
      "CANCEL_APPOINTMENT_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok: false,

        message:
          "لغو نوبت با خطا مواجه شد.",
      },
      {
        status: 500,
      },
    );
  }
}