import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/prisma";

export async function POST(
  request: Request,
) {
  try {
    const body =
      await request.json();

    const codes =
      Array.isArray(
        body.codes,
      )
        ? body.codes.filter(
            (
              code: unknown,
            ): code is string =>
              typeof code ===
                "string" &&
              code.startsWith(
                "KHZ-",
              ),
          )
        : [];

    if (
      codes.length === 0
    ) {
      return NextResponse.json(
        {
          ok: true,

          appointments:
            [],
        },
      );
    }

    /*
     * Protect API against huge arrays.
     * جلوگیری از ارسال تعداد غیرمنطقی کد.
     */
    const safeCodes =
      codes.slice(
        0,
        50,
      );

    const appointments =
      await prisma.appointment.findMany(
        {
          where: {
            trackingCode: {
              in: safeCodes,
            },

            status: {
              in: [
                "pending",
                "confirmed",
              ],
            },
          },

          select: {
            trackingCode:
              true,

            fullName:
              true,

            phone:
              true,

            serviceId:
              true,

            dateKey:
              true,

            time:
              true,

            carBrand:
              true,

            carModel:
              true,

            carYear:
              true,

            status:
              true,
          },

          orderBy: [
            {
              dateKey:
                "asc",
            },

            {
              time: "asc",
            },
          ],
        },
      );

    return NextResponse.json(
      {
        ok: true,

        appointments:
          appointments.map(
            (
              appointment,
            ) => ({
              trackingCode:
                appointment.trackingCode,

              fullName:
                appointment.fullName,

              phone:
                appointment.phone,

              serviceId:
                appointment.serviceId,

              date:
                appointment.dateKey,

              time:
                appointment.time,

              carBrand:
                appointment.carBrand,

              carModel:
                appointment.carModel,

              carYear:
                appointment.carYear,

              status:
                appointment.status,
            }),
          ),
      },
    );
  } catch (error) {
    console.error(
      "ACTIVE_APPOINTMENTS_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok: false,

        message:
          "دریافت نوبت‌های فعال با خطا مواجه شد.",
      },
      {
        status: 500,
      },
    );
  }
}