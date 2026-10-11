import { NextResponse } from "next/server";

import {
  isAdminAuthenticated,
  isAppointmentDeletePinConfigured,
  verifyAppointmentDeletePin,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { isTrustedMutationRequest } from "@/lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    trackingCode: string;
  }>;
};

type DeleteRequestBody = {
  pin?: unknown;
};

const DELETE_GUARD_KEY =
  "appointment-delete-pin";

const DELETE_GUARD_WINDOW_MS =
  10 * 60 * 1000;

const DELETE_GUARD_BLOCK_MS =
  15 * 60 * 1000;

const DELETE_GUARD_MAX_FAILURES =
  5;

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

function normalizeDigits(
  value: string,
) {
  return value
    .replace(
      /[۰-۹]/g,
      (digit) =>
        String(
          "۰۱۲۳۴۵۶۷۸۹".indexOf(
            digit,
          ),
        ),
    )
    .replace(
      /[٠-٩]/g,
      (digit) =>
        String(
          "٠١٢٣٤٥٦٧٨٩".indexOf(
            digit,
          ),
        ),
    );
}

async function getDeleteGuardState() {
  const guard =
    await prisma.adminLoginGuard.findUnique({
      where: {
        key: DELETE_GUARD_KEY,
      },
    });

  if (!guard) {
    return {
      blocked: false,
      retryAfterSeconds: 0,
    };
  }

  const now = new Date();

  if (
    guard.blockedUntil &&
    guard.blockedUntil > now
  ) {
    return {
      blocked: true,
      retryAfterSeconds:
        Math.max(
          1,
          Math.ceil(
            (guard.blockedUntil.getTime() -
              now.getTime()) /
              1000,
          ),
        ),
    };
  }

  return {
    blocked: false,
    retryAfterSeconds: 0,
  };
}

async function registerDeletePinFailure() {
  const now = new Date();

  const existing =
    await prisma.adminLoginGuard.findUnique({
      where: {
        key: DELETE_GUARD_KEY,
      },
    });

  const windowExpired =
    !existing ||
    now.getTime() -
      existing.windowStartedAt.getTime() >
      DELETE_GUARD_WINDOW_MS;

  const nextFailures =
    windowExpired
      ? 1
      : (existing?.failures ?? 0) + 1;

  const blockedUntil =
    nextFailures >=
    DELETE_GUARD_MAX_FAILURES
      ? new Date(
          now.getTime() +
            DELETE_GUARD_BLOCK_MS,
        )
      : null;

  await prisma.adminLoginGuard.upsert({
    where: {
      key: DELETE_GUARD_KEY,
    },
    update: {
      failures: nextFailures,
      windowStartedAt:
        windowExpired
          ? now
          : existing!.windowStartedAt,
      blockedUntil,
    },
    create: {
      key: DELETE_GUARD_KEY,
      failures: nextFailures,
      windowStartedAt: now,
      blockedUntil,
    },
  });

  return {
    blocked:
      Boolean(blockedUntil),
    remainingAttempts:
      Math.max(
        0,
        DELETE_GUARD_MAX_FAILURES -
          nextFailures,
      ),
  };
}

async function clearDeletePinFailures() {
  await prisma.adminLoginGuard.deleteMany({
    where: {
      key: DELETE_GUARD_KEY,
    },
  });
}

export async function DELETE(
  request: Request,
  { params }: RouteContext,
) {
  try {
    if (
      !(await isAdminAuthenticated())
    ) {
      return jsonResponse(
        {
          ok: false,
          code: "UNAUTHORIZED",
          message:
            "نشست مدیریت معتبر نیست.",
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
          code: "UNTRUSTED_REQUEST",
          message:
            "درخواست معتبر نیست.",
        },
        403,
      );
    }

    const configured =
      await isAppointmentDeletePinConfigured();

    if (!configured) {
      return jsonResponse(
        {
          ok: false,
          code:
            "DELETE_PIN_NOT_CONFIGURED",
          message:
            "ابتدا از بخش «امنیت و رمز عبور» کد امنیتی ۴ رقمی حذف نوبت را تنظیم کنید.",
        },
        409,
      );
    }

    const guardState =
      await getDeleteGuardState();

    if (guardState.blocked) {
      return jsonResponse(
        {
          ok: false,
          code:
            "DELETE_PIN_TEMPORARILY_BLOCKED",
          retryAfterSeconds:
            guardState.retryAfterSeconds,
          message:
            "به‌دلیل چند تلاش ناموفق، ورود کد حذف موقتاً مسدود شده است. کمی بعد دوباره تلاش کنید.",
        },
        429,
      );
    }

    const body =
      (await request.json()) as DeleteRequestBody;

    const pin =
      normalizeDigits(
        String(body.pin ?? ""),
      )
        .replace(/\D/g, "")
        .slice(0, 4);

    if (!/^\d{4}$/.test(pin)) {
      return jsonResponse(
        {
          ok: false,
          code: "INVALID_DELETE_PIN",
          message:
            "کد امنیتی حذف باید دقیقاً ۴ رقم باشد.",
        },
        400,
      );
    }

    const validPin =
      await verifyAppointmentDeletePin(
        pin,
      );

    if (!validPin) {
      const failure =
        await registerDeletePinFailure();

      return jsonResponse(
        {
          ok: false,
          code: "INVALID_DELETE_PIN",
          remainingAttempts:
            failure.remainingAttempts,
          message: failure.blocked
            ? "کد امنیتی اشتباه است. به‌دلیل چند تلاش ناموفق، ورود کد حذف موقتاً مسدود شد."
            : "کد امنیتی حذف صحیح نیست.",
        },
        403,
      );
    }

    await clearDeletePinFailures();

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

    const existing =
      await prisma.appointment.findUnique({
        where: {
          trackingCode,
        },
        select: {
          id: true,
          trackingCode: true,
          fullName: true,
          dateKey: true,
          time: true,
        },
      });

    if (!existing) {
      return jsonResponse(
        {
          ok: false,
          code:
            "APPOINTMENT_NOT_FOUND",
          message:
            "نوبت موردنظر پیدا نشد.",
        },
        404,
      );
    }

    await prisma.appointment.delete({
      where: {
        id: existing.id,
      },
    });

    return jsonResponse({
      ok: true,
      message:
        "نوبت با موفقیت و به‌صورت دائمی حذف شد.",
      deletedAppointment: {
        trackingCode:
          existing.trackingCode,
        fullName:
          existing.fullName,
        dateKey:
          existing.dateKey,
        time:
          existing.time,
      },
    });
  } catch (error) {
    console.error(
      "ADMIN_APPOINTMENT_DELETE_ERROR",
      error,
    );

    return jsonResponse(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        message:
          "حذف نوبت با خطا مواجه شد.",
      },
      500,
    );
  }
}
