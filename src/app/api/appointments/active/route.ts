import {
  NextResponse,
} from "next/server";

import {
  isValidAppointmentTrackingCode,
  normalizeAppointmentTrackingCode,
} from "@/lib/appointment-tracking-code";

import {
  prisma,
} from "@/lib/prisma";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

type ActiveAppointmentsRequestBody = {
  codes?: unknown;
};

type AppointmentResponseItem = {
  trackingCode: string;
  fullName: string;
  phone: string;
  serviceId: string;
  date: string;
  time: string;
  carBrand: string;
  carModel: string;
  carYear: string | null;
  status: string;
};

function jsonResponse(
  body: Record<
    string,
    unknown
  >,
  status = 200,
) {
  return NextResponse.json(
    body,
    {
      status,
      headers: {
        "Cache-Control":
          "no-store",
      },
    },
  );
}

export async function POST(
  request: Request,
) {
  try {
    let body:
      ActiveAppointmentsRequestBody;

    try {
      body =
        (await request.json()) as ActiveAppointmentsRequestBody;
    } catch {
      return jsonResponse(
        {
          ok:
            false,
          appointments:
            [],
          message:
            "اطلاعات ارسال‌شده معتبر نیست.",
        },
        400,
      );
    }

    const codes =
      Array.isArray(
        body.codes,
      )
        ? body.codes
            .filter(
              (
                code,
              ): code is string =>
                typeof code ===
                "string",
            )
            .map(
              normalizeAppointmentTrackingCode,
            )
            .filter(
              isValidAppointmentTrackingCode,
            )
        : [];

    if (
      codes.length ===
      0
    ) {
      return jsonResponse({
        ok:
          true,
        appointments:
          [],
      });
    }

    const safeCodes =
      Array.from(
        new Set(
          codes,
        ),
      ).slice(
        0,
        50,
      );

    const appointments =
      await prisma.appointment.findMany({
        where: {
          trackingCode: {
            in:
              safeCodes,
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
            time:
              "asc",
          },
        ],
      });

    const responseAppointments:
      AppointmentResponseItem[] =
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
      );

    return jsonResponse({
      ok:
        true,
      appointments:
        responseAppointments,
    });
  } catch (error) {
    console.error(
      "ACTIVE_APPOINTMENTS_ERROR",
      error,
    );

    return jsonResponse(
      {
        ok:
          false,
        appointments:
          [],
        message:
          "دریافت نوبت‌های فعال با خطا مواجه شد.",
      },
      500,
    );
  }
}
