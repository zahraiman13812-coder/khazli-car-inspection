import {
  NextResponse,
} from "next/server";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  createAppointmentSafely,
} from "@/lib/create-appointment";

import {
  createAppointmentTrackingCode,
  validateAppointmentInput,
} from "@/lib/appointment-input";

import {
  isTrustedMutationRequest,
} from "@/lib/request-security";

export const runtime =
  "nodejs";

const MAX_CREATE_ATTEMPTS = 5;

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

    let body: Record<
      string,
      unknown
    >;

    try {
      body =
        await request.json() as Record<
          string,
          unknown
        >;
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

    const validation =
      validateAppointmentInput(
        body,
        {
          requireWashConfirmation:
            false,
        },
      );

    if (
      !validation.ok
    ) {
      return jsonResponse(
        {
          ok: false,
          code:
            validation.code,
          message:
            validation.message,
        },
        400,
      );
    }

    for (
      let attempt = 0;
      attempt < MAX_CREATE_ATTEMPTS;
      attempt += 1
    ) {
      const result =
        await createAppointmentSafely({
          ...validation.data,
          trackingCode:
            createAppointmentTrackingCode(),
          source: "admin",
        });

      if (
        result.ok
      ) {
        const appointment =
          result.appointment;

        return jsonResponse(
          {
            ok: true,
            message:
              "نوبت دستی با موفقیت ثبت شد.",
            appointment: {
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
                appointment.status,
              source:
                appointment.source,
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
            },
          },
          201,
        );
      }

      if (
        result.reason ===
        "DUPLICATE_DAY"
      ) {
        return jsonResponse(
          {
            ok: false,
            code:
              "DUPLICATE_DAILY_APPOINTMENT",
            message:
              "این شخص برای همین روز قبلاً نوبت دارد.",
            trackingCode:
              result.existingTrackingCode,
          },
          409,
        );
      }

      if (
        result.reason ===
        "SLOT_FULL"
      ) {
        return jsonResponse(
          {
            ok: false,
            code: "SLOT_FULL",
            message:
              "این تاریخ و ساعت قبلاً رزرو شده است.",
          },
          409,
        );
      }

      if (
        result.reason ===
        "BLOCKED"
      ) {
        return jsonResponse(
          {
            ok: false,
            code: "SLOT_BLOCKED",
            message:
              "این روز یا ساعت توسط مدیر بسته شده است.",
          },
          409,
        );
      }

      if (
        result.reason ===
        "CONFLICT"
      ) {
        continue;
      }
    }

    return jsonResponse(
      {
        ok: false,
        code: "CREATE_CONFLICT",
        message:
          "ثبت نوبت با تداخل مواجه شد. لطفاً دوباره تلاش کنید.",
      },
      409,
    );
  } catch (error) {
    console.error(
      "ADMIN_MANUAL_APPOINTMENT_CREATE_ERROR",
      error,
    );

    return jsonResponse(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        message:
          "ثبت نوبت دستی با خطا مواجه شد.",
      },
      500,
    );
  }
}
