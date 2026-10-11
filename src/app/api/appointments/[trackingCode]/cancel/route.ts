import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { isTrustedMutationRequest } from "@/lib/request-security";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    trackingCode: string;
  }>;
};

const ACTIVE_STATUSES = [
  "pending",
  "confirmed",
] as const;

/*
 * ============================================================
 * RESPONSE
 * ============================================================
 */

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
) {
  return NextResponse.json(body, {
    status,

    headers: {
      "Cache-Control": "no-store",
    },
  });
}

/*
 * ============================================================
 * SERIALIZER
 * ============================================================
 */

function serializeAppointment(
  appointment: {
    id: string;
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
    cancelledAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  },
) {
  return {
    id:
      appointment.id,

    trackingCode:
      appointment.trackingCode,

    fullName:
      appointment.fullName,

    phone:
      appointment.phone,

    serviceId:
      appointment.serviceId,

    dateKey:
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

    cancelledAt:
      appointment.cancelledAt?.toISOString() ??
      null,

    completedAt:
      appointment.completedAt?.toISOString() ??
      null,

    createdAt:
      appointment.createdAt.toISOString(),

    updatedAt:
      appointment.updatedAt.toISOString(),
  };
}

/*
 * ============================================================
 * POST
 * /api/appointments/[trackingCode]/cancel
 * ============================================================
 */

export async function POST(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    /*
     * Prevent cross-site browser requests.
     */
    if (
      !isTrustedMutationRequest(
        request,
      )
    ) {
      return jsonResponse(
        {
          ok: false,

          code:
            "UNTRUSTED_REQUEST",

          message:
            "درخواست معتبر نیست.",
        },
        403,
      );
    }

    const {
      trackingCode: rawTrackingCode,
    } =
      await params;

    const trackingCode =
      rawTrackingCode
        .trim()
        .toUpperCase();

    if (
      !trackingCode ||
      trackingCode.length >
        100
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

    const existing =
      await prisma.appointment.findUnique({
        where: {
          trackingCode,
        },
      });

    if (!existing) {
      return jsonResponse(
        {
          ok: false,

          code:
            "NOT_FOUND",

          message:
            "نوبتی با این کد پیگیری پیدا نشد.",
        },
        404,
      );
    }

    /*
     * Idempotent cancellation.
     *
     * If user retries after a successful cancellation,
     * don't turn it into an error.
     */
    if (
      existing.status ===
      "cancelled"
    ) {
      return jsonResponse({
        ok: true,

        message:
          "این نوبت قبلاً لغو شده است.",

        status:
          "cancelled",

        appointment:
          serializeAppointment(
            existing,
          ),
      });
    }

    /*
     * Completed appointment cannot be cancelled.
     */
    if (
      existing.status ===
      "completed"
    ) {
      return jsonResponse(
        {
          ok: false,

          code:
            "ALREADY_COMPLETED",

          message:
            "این نوبت قبلاً انجام شده و امکان لغو آن وجود ندارد.",
        },
        409,
      );
    }

    if (
      !ACTIVE_STATUSES.includes(
        existing.status as
          | "pending"
          | "confirmed",
      )
    ) {
      return jsonResponse(
        {
          ok: false,

          code:
            "INVALID_STATUS",

          message:
            "این نوبت در وضعیت قابل لغو قرار ندارد.",
        },
        409,
      );
    }

    /*
     * Atomic state transition.
     *
     * Prevents a race with admin status changes.
     */
    const result =
      await prisma.appointment.updateMany({
        where: {
          id:
            existing.id,

          status: {
            in: [
              ...ACTIVE_STATUSES,
            ],
          },
        },

        data: {
          status:
            "cancelled",

          cancelledAt:
            new Date(),

          /*
           * Release user/day identity lock.
           *
           * User can book this day again.
           */
          dailyIdentityKey:
            null,

          /*
           * Release time slot.
           *
           * Another user can immediately book it.
           */
          activeSlotKey:
            null,
        },
      });

    /*
     * Another request changed the appointment
     * between findUnique and updateMany.
     */
    if (
      result.count === 0
    ) {
      const latest =
        await prisma.appointment.findUnique({
          where: {
            id:
              existing.id,
          },
        });

      if (!latest) {
        return jsonResponse(
          {
            ok: false,

            code:
              "NOT_FOUND",

            message:
              "نوبت پیدا نشد.",
          },
          404,
        );
      }

      if (
        latest.status ===
        "cancelled"
      ) {
        return jsonResponse({
          ok: true,

          message:
            "نوبت با موفقیت لغو شده است.",

          status:
            "cancelled",

          appointment:
            serializeAppointment(
              latest,
            ),
        });
      }

      if (
        latest.status ===
        "completed"
      ) {
        return jsonResponse(
          {
            ok: false,

            code:
              "ALREADY_COMPLETED",

            message:
              "این نوبت انجام شده و دیگر قابل لغو نیست.",
          },
          409,
        );
      }

      return jsonResponse(
        {
          ok: false,

          code:
            "STATE_CHANGED",

          message:
            "وضعیت نوبت هم‌زمان تغییر کرده است. لطفاً صفحه را به‌روزرسانی کنید.",
        },
        409,
      );
    }

    const cancelled =
      await prisma.appointment.findUnique({
        where: {
          id:
            existing.id,
        },
      });

    if (!cancelled) {
      return jsonResponse(
        {
          ok: false,

          code:
            "NOT_FOUND_AFTER_UPDATE",

          message:
            "نوبت لغو شد اما دریافت وضعیت جدید با خطا مواجه شد.",
        },
        500,
      );
    }

    return jsonResponse({
      ok: true,

      message:
        "نوبت شما با موفقیت لغو شد.",

      status:
        "cancelled",

      appointment:
        serializeAppointment(
          cancelled,
        ),
    });
  } catch (error) {
    console.error(
      "APPOINTMENT_CANCEL_ERROR",
      error,
    );

    return jsonResponse(
      {
        ok: false,

        code:
          "INTERNAL_ERROR",

        message:
          "لغو نوبت با خطا مواجه شد. لطفاً دوباره تلاش کنید.",
      },
      500,
    );
  }
}