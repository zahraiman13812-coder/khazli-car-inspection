import {
  NextResponse,
} from "next/server";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  createAppointmentBlockKeys,
} from "@/lib/appointment-block-key";

import {
  createActiveSlotKey,
  SLOT_RESERVING_APPOINTMENT_STATUSES,
} from "@/lib/appointment-slot-key";

import {
  prisma,
} from "@/lib/prisma";

import {
  isTrustedMutationRequest,
} from "@/lib/request-security";

export const runtime =
  "nodejs";

type RouteContext = {
  params: Promise<{
    trackingCode: string;
  }>;
};

type AppointmentStatus =
  | "pending"
  | "completed"
  | "cancelled";

type KnownStoredStatus =
  | AppointmentStatus
  | "confirmed";

type StatusRequestBody = {
  status?: unknown;
};

function jsonResponse(
  body: Record<string, unknown>,
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

function isTargetStatus(
  value: string,
): value is AppointmentStatus {
  return [
    "pending",
    "completed",
    "cancelled",
  ].includes(value);
}

function isKnownStoredStatus(
  value: string,
): value is KnownStoredStatus {
  return [
    "pending",
    "confirmed",
    "completed",
    "cancelled",
  ].includes(value);
}

function isPrismaUniqueConstraintError(
  error: unknown,
) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function serializeAppointment(
  appointment: {
    id: string;
    trackingCode: string;
    fullName: string;
    normalizedName: string;
    phone: string;
    serviceId: string;
    dateKey: string;
    time: string;
    carBrand: string;
    carModel: string;
    carYear: string | null;
    note: string | null;
    washConfirmed: boolean;
    status: string;
    source: string;
    cancelledAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  },
) {
  return {
    id: appointment.id,
    trackingCode:
      appointment.trackingCode,
    fullName:
      appointment.fullName,
    normalizedName:
      appointment.normalizedName,
    phone:
      appointment.phone,
    serviceId:
      appointment.serviceId,
    date:
      appointment.dateKey,
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
    note:
      appointment.note,
    washConfirmed:
      appointment.washConfirmed,
    status:
      appointment.status === "confirmed"
        ? "pending"
        : appointment.status,
    source:
      appointment.source,
    cancelledAt:
      appointment.cancelledAt?.toISOString() ?? null,
    completedAt:
      appointment.completedAt?.toISOString() ?? null,
    createdAt:
      appointment.createdAt.toISOString(),
    updatedAt:
      appointment.updatedAt.toISOString(),
  };
}

export async function PATCH(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    if (
      !await isAdminAuthenticated()
    ) {
      return jsonResponse(
        {
          ok: false,
          code: "UNAUTHORIZED",
          message:
            "دسترسی غیرمجاز است.",
        },
        401,
      );
    }

    if (
      !isTrustedMutationRequest(request)
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
    } = await params;

    const trackingCode =
      rawTrackingCode
        .trim()
        .toUpperCase();

    if (
      !trackingCode ||
      trackingCode.length > 100
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

    let body: StatusRequestBody;

    try {
      body =
        await request.json() as StatusRequestBody;
    } catch {
      return jsonResponse(
        {
          ok: false,
          code: "INVALID_JSON",
          message:
            "اطلاعات ارسال‌شده معتبر نیست.",
        },
        400,
      );
    }

    const nextStatus =
      typeof body.status === "string"
        ? body.status.trim()
        : "";

    if (
      !isTargetStatus(nextStatus)
    ) {
      return jsonResponse(
        {
          ok: false,
          code: "INVALID_STATUS",
          message:
            "وضعیت انتخاب‌شده معتبر نیست.",
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
          code: "NOT_FOUND",
          message:
            "نوبت پیدا نشد.",
        },
        404,
      );
    }

    if (
      !isKnownStoredStatus(existing.status)
    ) {
      return jsonResponse(
        {
          ok: false,
          code:
            "UNKNOWN_CURRENT_STATUS",
          message:
            "وضعیت فعلی این نوبت معتبر نیست.",
        },
        409,
      );
    }

    const currentUiStatus =
      existing.status === "confirmed"
        ? "pending"
        : existing.status;

    if (
      currentUiStatus === nextStatus
    ) {
      if (
        existing.status === "confirmed" &&
        nextStatus === "pending"
      ) {
        const updated =
          await prisma.appointment.update({
            where: {
              id: existing.id,
            },
            data: {
              status: "pending",
            },
          });

        return jsonResponse({
          ok: true,
          message:
            "وضعیت نوبت به ساختار جدید منتقل شد.",
          appointment:
            serializeAppointment(updated),
        });
      }

      return jsonResponse({
        ok: true,
        message:
          "نوبت در حال حاضر در همین وضعیت قرار دارد.",
        appointment:
          serializeAppointment(existing),
      });
    }

    if (
      nextStatus === "cancelled"
    ) {
      const now =
        new Date();

      const result =
        await prisma.appointment.updateMany({
          where: {
            id: existing.id,
            status: existing.status,
          },
          data: {
            status: "cancelled",
            activeSlotKey: null,
            dailyIdentityKey: null,
            cancelledAt: now,
            completedAt: null,
          },
        });

      if (
        result.count === 0
      ) {
        return jsonResponse(
          {
            ok: false,
            code: "STATE_CHANGED",
            message:
              "وضعیت نوبت هم‌زمان تغییر کرده است. صفحه را به‌روزرسانی کنید.",
          },
          409,
        );
      }

      const updated =
        await prisma.appointment.findUnique({
          where: {
            id: existing.id,
          },
        });

      if (!updated) {
        return jsonResponse(
          {
            ok: false,
            code:
              "NOT_FOUND_AFTER_UPDATE",
            message:
              "نوبت تغییر کرد اما دریافت اطلاعات جدید با خطا مواجه شد.",
          },
          500,
        );
      }

      return jsonResponse({
        ok: true,
        message:
          "نوبت با موفقیت لغو شد و زمان آن دوباره آزاد شد.",
        appointment:
          serializeAppointment(updated),
      });
    }

    const activeSlotKey =
      createActiveSlotKey(
        existing.dateKey,
        existing.time,
      );

    const dailyIdentityKey =
      `${existing.dateKey}:${existing.phone}:${existing.normalizedName}`;

    if (
      existing.status === "cancelled"
    ) {
      const blockKeys =
        createAppointmentBlockKeys(
          existing.dateKey,
          existing.time,
        );

      const block =
        await prisma.appointmentBlock.findFirst({
          where: {
            blockKey: {
              in: blockKeys,
            },
          },
          select: {
            reason: true,
          },
        });

      if (block) {
        return jsonResponse(
          {
            ok: false,
            code: "SLOT_BLOCKED",
            message:
              block.reason
                ? `این زمان توسط مدیر بسته شده است: ${block.reason}`
                : "این روز یا ساعت در حال حاضر برای رزرو بسته است.",
          },
          409,
        );
      }
    }

    const [
      slotConflict,
      identityConflict,
    ] = await Promise.all([
      prisma.appointment.findFirst({
        where: {
          id: {
            not: existing.id,
          },
          dateKey: existing.dateKey,
          time: existing.time,
          status: {
            in: [
              ...SLOT_RESERVING_APPOINTMENT_STATUSES,
            ],
          },
        },
        select: {
          id: true,
        },
      }),

      prisma.appointment.findFirst({
        where: {
          id: {
            not: existing.id,
          },
          dailyIdentityKey,
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (slotConflict) {
      return jsonResponse(
        {
          ok: false,
          code: "SLOT_CONFLICT",
          message:
            "برای این تاریخ و ساعت یک نوبت دیگر وجود دارد.",
        },
        409,
      );
    }

    if (identityConflict) {
      return jsonResponse(
        {
          ok: false,
          code:
            "IDENTITY_CONFLICT",
          message:
            "این شخص برای همین روز یک نوبت دیگر دارد.",
        },
        409,
      );
    }

    try {
      const now =
        new Date();

      const result =
        await prisma.appointment.updateMany({
          where: {
            id: existing.id,
            status: existing.status,
          },
          data: {
            status: nextStatus,
            activeSlotKey,
            dailyIdentityKey,
            cancelledAt: null,
            completedAt:
              nextStatus === "completed"
                ? now
                : null,
          },
        });

      if (
        result.count === 0
      ) {
        return jsonResponse(
          {
            ok: false,
            code: "STATE_CHANGED",
            message:
              "وضعیت نوبت هم‌زمان تغییر کرده است. صفحه را به‌روزرسانی کنید.",
          },
          409,
        );
      }
    } catch (error) {
      if (
        isPrismaUniqueConstraintError(error)
      ) {
        return jsonResponse(
          {
            ok: false,
            code:
              "UNIQUE_CONFLICT",
            message:
              "این زمان یا نوبت هم‌زمان توسط رکورد دیگری اشغال شده است.",
          },
          409,
        );
      }

      throw error;
    }

    const updated =
      await prisma.appointment.findUnique({
        where: {
          id: existing.id,
        },
      });

    if (!updated) {
      return jsonResponse(
        {
          ok: false,
          code:
            "NOT_FOUND_AFTER_UPDATE",
          message:
            "وضعیت تغییر کرد اما دریافت اطلاعات جدید با خطا مواجه شد.",
        },
        500,
      );
    }

    return jsonResponse({
      ok: true,
      message:
        nextStatus === "completed"
          ? "نوبت با موفقیت به حالت انجام‌شده منتقل شد."
          : "نوبت با موفقیت به حالت در انتظار منتقل شد.",
      appointment:
        serializeAppointment(updated),
    });
  } catch (error) {
    console.error(
      "ADMIN_APPOINTMENT_STATUS_ERROR",
      error,
    );

    return jsonResponse(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        message:
          "تغییر وضعیت نوبت با خطا مواجه شد.",
      },
      500,
    );
  }
}
