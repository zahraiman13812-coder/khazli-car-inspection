import {
  NextResponse,
} from "next/server";

import {
  createAppointmentSafely,
} from "@/lib/create-appointment";

import {
  createAppointmentTrackingCode,
  validateAppointmentInput,
} from "@/lib/appointment-input";

export const runtime =
  "nodejs";

const MAX_CREATE_ATTEMPTS =
  5;

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
      Record<
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

          code:
            "INVALID_JSON",

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
            true,
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

    const data =
      validation.data;

    for (
      let attempt =
        0;
      attempt <
        MAX_CREATE_ATTEMPTS;
      attempt +=
        1
    ) {
      const result =
        await createAppointmentSafely({
          ...data,

          trackingCode:
            createAppointmentTrackingCode(),

          source:
            "customer",
        });

      /*
       * Success
       */
      if (
        result.ok
      ) {
        const appointment =
          result.appointment;

        return jsonResponse(
          {
            ok:
              true,

            message:
              "نوبت شما با موفقیت ثبت شد.",

            trackingCode:
              appointment.trackingCode,

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

              /*
               * date برای سازگاری
               * با Booking فعلی.
               */
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

              createdAt:
                appointment.createdAt.toISOString(),
            },
          },
          201,
        );
      }

      /*
       * Same person / same day
       */
      if (
        result.reason ===
        "DUPLICATE_DAY"
      ) {
        return jsonResponse(
          {
            ok:
              false,

            code:
              "DUPLICATE_DAILY_APPOINTMENT",

            message:
              "شما برای این روز قبلاً نوبت ثبت کرده‌اید.",

            appointment:
              result.existingTrackingCode
                ? {
                    trackingCode:
                      result.existingTrackingCode,
                  }
                : undefined,
          },
          409,
        );
      }

      /*
       * Slot occupied
       */
      if (
        result.reason ===
        "SLOT_FULL"
      ) {
        return jsonResponse(
          {
            ok:
              false,

            code:
              "SLOT_FULL",

            message:
              "این ساعت قبلاً رزرو شده است. لطفاً ساعت دیگری را انتخاب کنید.",
          },
          409,
        );
      }

      /*
       * Admin closed this day/time.
       */
      if (
        result.reason ===
        "BLOCKED"
      ) {
        return jsonResponse(
          {
            ok:
              false,

            code:
              "SLOT_BLOCKED",

            message:
              "این روز یا ساعت برای رزرو غیرفعال شده است. لطفاً زمان دیگری را انتخاب کنید.",
          },
          409,
        );
      }

      /*
       * Tracking code collision or
       * another extremely rare conflict.
       */
      if (
        result.reason ===
        "CONFLICT"
      ) {
        continue;
      }
    }

    return jsonResponse(
      {
        ok:
          false,

        code:
          "CREATE_CONFLICT",

        message:
          "ثبت نوبت با تداخل مواجه شد. لطفاً دوباره تلاش کنید.",
      },
      409,
    );
  } catch (error) {
    console.error(
      "APPOINTMENT_CREATE_ERROR",
      error,
    );

    return jsonResponse(
      {
        ok:
          false,

        code:
          "INTERNAL_ERROR",

        message:
          "ثبت نوبت با خطا مواجه شد. لطفاً دوباره تلاش کنید.",
      },
      500,
    );
  }
}