import {
  NextResponse,
} from "next/server";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  createAppointmentDayBlockKey,
  createAppointmentTimeBlockKey,
} from "@/lib/appointment-block-key";

import {
  getLastBookableDateISO,
  getTehranTodayISO,
  isAllowedAppointmentTime,
  isBookableDate,
  isPastAppointmentTime,
} from "@/lib/appointment-time";

import {
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

export const dynamic =
  "force-dynamic";

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

export async function GET() {
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

    const blocks =
      await prisma.appointmentBlock.findMany({
        where: {
          dateKey: {
            gte:
              getTehranTodayISO(),
            lte:
              getLastBookableDateISO(),
          },
        },
        orderBy: [
          {
            dateKey: "asc",
          },
          {
            time: "asc",
          },
        ],
      });

    return jsonResponse({
      ok: true,
      blocks:
        blocks.map(
          (block) => ({
            ...block,
            createdAt:
              block.createdAt.toISOString(),
            updatedAt:
              block.updatedAt.toISOString(),
          }),
        ),
    });
  } catch (error) {
    console.error(
      "ADMIN_APPOINTMENT_BLOCKS_GET_ERROR",
      error,
    );

    return jsonResponse(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        message:
          "دریافت محدودیت‌های نوبت با خطا مواجه شد.",
      },
      500,
    );
  }
}

export async function POST(
  request: Request,
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

    let body: {
      dateKey?: unknown;
      time?: unknown;
      reason?: unknown;
    };

    try {
      body =
        await request.json() as {
          dateKey?: unknown;
          time?: unknown;
          reason?: unknown;
        };
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

    const dateKey =
      typeof body.dateKey === "string"
        ? body.dateKey.trim()
        : "";

    const time =
      typeof body.time === "string"
        ? body.time.trim()
        : "";

    const reason =
      typeof body.reason === "string"
        ? body.reason
            .trim()
            .slice(0, 300)
        : "";

    if (
      !isBookableDate(
        dateKey,
      )
    ) {
      return jsonResponse(
        {
          ok: false,
          code: "INVALID_DATE",
          message:
            "تاریخ انتخاب‌شده خارج از بازه قابل رزرو است.",
        },
        400,
      );
    }

    if (
      time &&
      !isAllowedAppointmentTime(
        time,
      )
    ) {
      return jsonResponse(
        {
          ok: false,
          code: "INVALID_TIME",
          message:
            "ساعت انتخاب‌شده معتبر نیست.",
        },
        400,
      );
    }

    if (
      time &&
      isPastAppointmentTime({
        date: dateKey,
        time,
      })
    ) {
      return jsonResponse(
        {
          ok: false,
          code: "PAST_TIME",
          message:
            "امکان بستن ساعت گذشته وجود ندارد.",
        },
        400,
      );
    }

    /*
     * برای بستن یک ساعت مشخص، اگر همان ساعت
     * قبلاً نوبت رزروشده داشته باشد، به‌جای ایجاد
     * وضعیت مبهم آن را رد می‌کنیم.
     *
     * بستن کل روز مجاز است و نوبت‌های قبلی را
     * حذف یا لغو نمی‌کند.
     */
    if (
      time
    ) {
      const existingAppointment =
        await prisma.appointment.findFirst({
          where: {
            dateKey,
            time,
            status: {
              in: [
                ...SLOT_RESERVING_APPOINTMENT_STATUSES,
              ],
            },
          },
          select: {
            trackingCode: true,
          },
        });

      if (
        existingAppointment
      ) {
        return jsonResponse(
          {
            ok: false,
            code: "SLOT_OCCUPIED",
            message:
              "این ساعت قبلاً نوبت دارد و نیازی به بستن جداگانه آن نیست.",
          },
          409,
        );
      }
    }

    const blockKey =
      time
        ? createAppointmentTimeBlockKey(
            dateKey,
            time,
          )
        : createAppointmentDayBlockKey(
            dateKey,
          );

    const block =
      await prisma.appointmentBlock.upsert({
        where: {
          blockKey,
        },
        update: {
          reason:
            reason || null,
        },
        create: {
          blockKey,
          dateKey,
          time:
            time || null,
          reason:
            reason || null,
        },
      });

    return jsonResponse(
      {
        ok: true,
        message:
          time
            ? "ساعت موردنظر بسته شد."
            : "روز موردنظر برای رزرو بسته شد.",
        block: {
          ...block,
          createdAt:
            block.createdAt.toISOString(),
          updatedAt:
            block.updatedAt.toISOString(),
        },
      },
      201,
    );
  } catch (error) {
    console.error(
      "ADMIN_APPOINTMENT_BLOCK_CREATE_ERROR",
      error,
    );

    return jsonResponse(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        message:
          "ثبت محدودیت زمانی با خطا مواجه شد.",
      },
      500,
    );
  }
}
