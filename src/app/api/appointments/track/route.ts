import {
  NextResponse,
} from "next/server";

import {
  normalizeFullName,
  normalizePhone,
} from "@/lib/appointment-normalize";

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

type TrackingRequestBody = {
  method?: unknown;
  trackingCode?: unknown;
  fullName?: unknown;
  phone?: unknown;
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

function normalizePublicStatus(
  status: string,
) {
  return status ===
    "confirmed"
    ? "pending"
    : status;
}

function serializeAppointment(
  appointment: {
    trackingCode: string;
    fullName: string;
    phone: string;
    serviceId: string;
    dateKey: string;
    time: string;
    carBrand: string;
    carModel: string;
    carYear: string | null;
    status: string;
    createdAt: Date;
    cancelledAt: Date | null;
    completedAt: Date | null;
  },
) {
  return {
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
      normalizePublicStatus(
        appointment.status,
      ),
    createdAt:
      appointment.createdAt.toISOString(),
    cancelledAt:
      appointment.cancelledAt?.toISOString() ??
      null,
    completedAt:
      appointment.completedAt?.toISOString() ??
      null,
  };
}

const appointmentSelect = {
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
  createdAt:
    true,
  cancelledAt:
    true,
  completedAt:
    true,
} as const;

export async function POST(
  request: Request,
) {
  try {
    let body:
      TrackingRequestBody;

    try {
      body =
        (await request.json()) as TrackingRequestBody;
    } catch {
      return jsonResponse(
        {
          ok: false,
          code:
            "INVALID_JSON",
          message:
            "اطلاعات ارسال‌شده معتبر نیست.",
        },
        400,
      );
    }

    const method =
      String(
        body.method ??
          "",
      ).trim();

    if (
      method ===
      "code"
    ) {
      const trackingCode =
        normalizeAppointmentTrackingCode(
          String(
            body.trackingCode ??
              "",
          ),
        );

      if (
        !isValidAppointmentTrackingCode(
          trackingCode,
        )
      ) {
        return jsonResponse(
          {
            ok: false,
            code:
              "INVALID_TRACKING_CODE",
            message:
              "کد پیگیری معتبر نیست.",
          },
          400,
        );
      }

      const appointment =
        await prisma.appointment.findUnique({
          where: {
            trackingCode,
          },
          select:
            appointmentSelect,
        });

      if (
        !appointment
      ) {
        return jsonResponse(
          {
            ok: false,
            code:
              "APPOINTMENT_NOT_FOUND",
            message:
              "نوبتی با این کد پیگیری پیدا نشد.",
          },
          404,
        );
      }

      return jsonResponse({
        ok: true,
        appointments: [
          serializeAppointment(
            appointment,
          ),
        ],
      });
    }

    if (
      method ===
      "identity"
    ) {
      const fullName =
        normalizeFullName(
          String(
            body.fullName ??
              "",
          ),
        );

      const phone =
        normalizePhone(
          String(
            body.phone ??
              "",
          ),
        );

      if (
        !fullName
      ) {
        return jsonResponse(
          {
            ok: false,
            code:
              "INVALID_NAME",
            message:
              "نام و نام خانوادگی معتبر نیست.",
          },
          400,
        );
      }

      if (
        !/^09\d{9}$/.test(
          phone,
        )
      ) {
        return jsonResponse(
          {
            ok: false,
            code:
              "INVALID_PHONE",
            message:
              "شماره موبایل معتبر نیست.",
          },
          400,
        );
      }

      const appointments =
        await prisma.appointment.findMany({
          where: {
            normalizedName:
              fullName,
            phone,
          },
          select:
            appointmentSelect,
          orderBy: {
            createdAt:
              "desc",
          },
          take: 20,
        });

      if (
        appointments.length ===
        0
      ) {
        return jsonResponse(
          {
            ok: false,
            code:
              "APPOINTMENT_NOT_FOUND",
            message:
              "نوبتی با این نام و شماره موبایل پیدا نشد.",
          },
          404,
        );
      }

      return jsonResponse({
        ok: true,
        appointments:
          appointments.map(
            serializeAppointment,
          ),
      });
    }

    return jsonResponse(
      {
        ok: false,
        code:
          "INVALID_METHOD",
        message:
          "روش پیگیری معتبر نیست.",
      },
      400,
    );
  } catch (error) {
    console.error(
      "TRACK_APPOINTMENT_ERROR",
      error,
    );

    return jsonResponse(
      {
        ok: false,
        code:
          "INTERNAL_ERROR",
        message:
          "پیگیری نوبت با خطا مواجه شد. دوباره تلاش کنید.",
      },
      500,
    );
  }
}
