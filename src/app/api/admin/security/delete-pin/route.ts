import { NextResponse } from "next/server";

import {
  isAdminAuthenticated,
  setAppointmentDeletePin,
  verifyAppointmentDeletePin,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { isTrustedMutationRequest } from "@/lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequestBody = {
  currentPin?: unknown;
  newPin?: unknown;
};

const PIN_CHANGE_GUARD_KEY =
  "appointment-delete-pin-change";
const PIN_CHANGE_WINDOW_MS =
  10 * 60 * 1000;
const PIN_CHANGE_BLOCK_MS =
  15 * 60 * 1000;
const PIN_CHANGE_MAX_FAILURES = 5;

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

function normalizePin(
  value: unknown,
) {
  return normalizeDigits(
    String(value ?? ""),
  )
    .replace(/\D/g, "")
    .slice(0, 4);
}

async function getGuardState() {
  const guard =
    await prisma.adminLoginGuard.findUnique({
      where: {
        key: PIN_CHANGE_GUARD_KEY,
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

async function registerFailure() {
  const now = new Date();

  const existing =
    await prisma.adminLoginGuard.findUnique({
      where: {
        key: PIN_CHANGE_GUARD_KEY,
      },
    });

  const windowExpired =
    !existing ||
    now.getTime() -
      existing.windowStartedAt.getTime() >
      PIN_CHANGE_WINDOW_MS;

  const nextFailures =
    windowExpired
      ? 1
      : (existing?.failures ?? 0) + 1;

  const blockedUntil =
    nextFailures >=
    PIN_CHANGE_MAX_FAILURES
      ? new Date(
          now.getTime() +
            PIN_CHANGE_BLOCK_MS,
        )
      : null;

  await prisma.adminLoginGuard.upsert({
    where: {
      key: PIN_CHANGE_GUARD_KEY,
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
      key: PIN_CHANGE_GUARD_KEY,
      failures: nextFailures,
      windowStartedAt: now,
      blockedUntil,
    },
  });

  return {
    blocked: Boolean(blockedUntil),
    remainingAttempts:
      Math.max(
        0,
        PIN_CHANGE_MAX_FAILURES -
          nextFailures,
      ),
  };
}

async function clearFailures() {
  await prisma.adminLoginGuard.deleteMany({
    where: {
      key: PIN_CHANGE_GUARD_KEY,
    },
  });
}

export async function POST(
  request: Request,
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

    const guardState =
      await getGuardState();

    if (guardState.blocked) {
      return jsonResponse(
        {
          ok: false,
          code:
            "PIN_CHANGE_TEMPORARILY_BLOCKED",
          retryAfterSeconds:
            guardState.retryAfterSeconds,
          message:
            "به‌دلیل چند تلاش ناموفق، تغییر کد امنیتی موقتاً مسدود شده است. کمی بعد دوباره تلاش کنید.",
        },
        429,
      );
    }

    const body =
      (await request.json()) as RequestBody;

    const currentPin =
      normalizePin(body.currentPin);
    const newPin =
      normalizePin(body.newPin);

    if (
      !/^\d{4}$/.test(
        currentPin,
      )
    ) {
      return jsonResponse(
        {
          ok: false,
          code:
            "INVALID_CURRENT_DELETE_PIN",
          message:
            "کد ۴ رقمی فعلی را درست وارد کنید.",
        },
        400,
      );
    }

    if (
      !/^\d{4}$/.test(
        newPin,
      )
    ) {
      return jsonResponse(
        {
          ok: false,
          code: "INVALID_DELETE_PIN",
          message:
            "کد امنیتی جدید باید دقیقاً ۴ رقم باشد.",
        },
        400,
      );
    }

    if (
      currentPin === newPin
    ) {
      return jsonResponse(
        {
          ok: false,
          code: "SAME_DELETE_PIN",
          message:
            "کد ۴ رقمی جدید باید با کد فعلی متفاوت باشد.",
        },
        400,
      );
    }

    const currentPinValid =
      await verifyAppointmentDeletePin(
        currentPin,
      );

    if (!currentPinValid) {
      const failure =
        await registerFailure();

      return jsonResponse(
        {
          ok: false,
          code:
            "INVALID_CURRENT_DELETE_PIN",
          remainingAttempts:
            failure.remainingAttempts,
          message: failure.blocked
            ? "کد ۴ رقمی فعلی اشتباه است. به‌دلیل چند تلاش ناموفق، تغییر کد موقتاً مسدود شد."
            : "کد ۴ رقمی فعلی صحیح نیست.",
        },
        403,
      );
    }

    await setAppointmentDeletePin(
      newPin,
    );

    await clearFailures();

    return jsonResponse({
      ok: true,
      message:
        "کد امنیتی حذف نوبت با موفقیت تغییر کرد.",
    });
  } catch (error) {
    console.error(
      "ADMIN_DELETE_PIN_UPDATE_ERROR",
      error,
    );

    return jsonResponse(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        message:
          "تغییر کد امنیتی حذف با خطا مواجه شد.",
      },
      500,
    );
  }
}
