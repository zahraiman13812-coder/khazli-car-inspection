import {
  APPOINTMENT_SLOT_CAPACITY,
} from "@/config/appointments";

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

type AppointmentSource =
  | "customer"
  | "admin";

type CreateAppointmentInput = {
  trackingCode:
    string;

  fullName:
    string;

  normalizedName:
    string;

  phone:
    string;

  dailyIdentityKey:
    string;

  serviceId:
    string;

  dateKey:
    string;

  time:
    string;

  carBrand:
    string;

  carModel:
    string;

  carYear?:
    string | null;

  note?:
    string | null;

  washConfirmed:
    boolean;

  source?:
    AppointmentSource;
};

type CreateAppointmentResult =
  | {
      ok: true;

      appointment:
        Awaited<
          ReturnType<
            typeof prisma.appointment.create
          >
        >;
    }
  | {
      ok: false;

      reason:
        "DUPLICATE_DAY";

      existingTrackingCode:
        string | null;
    }
  | {
      ok: false;

      reason:
        | "SLOT_FULL"
        | "BLOCKED"
        | "CONFLICT";
    };

function isPrismaUniqueError(
  error: unknown,
) {
  return (
    typeof error ===
      "object" &&
    error !== null &&
    "code" in error &&
    error.code ===
      "P2002"
  );
}

export async function createAppointmentSafely(
  input:
    CreateAppointmentInput,
): Promise<CreateAppointmentResult> {
  if (
    APPOINTMENT_SLOT_CAPACITY !==
    1
  ) {
    throw new Error(
      "Active slot locking currently expects APPOINTMENT_SLOT_CAPACITY=1.",
    );
  }

  const activeSlotKey =
    createActiveSlotKey(
      input.dateKey,
      input.time,
    );

  const blockKeys =
    createAppointmentBlockKeys(
      input.dateKey,
      input.time,
    );

  /*
   * بررسی هم‌زمان:
   *
   * - بسته بودن روز یا ساعت
   * - نوبت تکراری همان شخص
   * - پر بودن Slot
   */
  const [
    block,
    duplicateDay,
    slotCount,
  ] =
    await Promise.all([
      prisma.appointmentBlock.findFirst({
        where: {
          blockKey: {
            in:
              blockKeys,
          },
        },

        select: {
          id:
            true,
        },
      }),

      prisma.appointment.findFirst({
        where: {
          dailyIdentityKey:
            input.dailyIdentityKey,

          status: {
            in: [
              ...SLOT_RESERVING_APPOINTMENT_STATUSES,
            ],
          },
        },

        select: {
          trackingCode:
            true,
        },
      }),

      prisma.appointment.count({
        where: {
          dateKey:
            input.dateKey,

          time:
            input.time,

          status: {
            in: [
              ...SLOT_RESERVING_APPOINTMENT_STATUSES,
            ],
          },
        },
      }),
    ]);

  if (
    block
  ) {
    return {
      ok: false,

      reason:
        "BLOCKED",
    };
  }

  if (
    duplicateDay
  ) {
    return {
      ok: false,

      reason:
        "DUPLICATE_DAY",

      existingTrackingCode:
        duplicateDay.trackingCode,
    };
  }

  if (
    slotCount >=
    APPOINTMENT_SLOT_CAPACITY
  ) {
    return {
      ok: false,

      reason:
        "SLOT_FULL",
    };
  }

  try {
    const appointment =
      await prisma.appointment.create({
        data: {
          trackingCode:
            input.trackingCode,

          fullName:
            input.fullName,

          normalizedName:
            input.normalizedName,

          phone:
            input.phone,

          dailyIdentityKey:
            input.dailyIdentityKey,

          activeSlotKey,

          serviceId:
            input.serviceId,

          dateKey:
            input.dateKey,

          time:
            input.time,

          carBrand:
            input.carBrand,

          carModel:
            input.carModel,

          carYear:
            input.carYear ??
            null,

          note:
            input.note ??
            null,

          washConfirmed:
            input.washConfirmed,

          status:
            "pending",

          source:
            input.source ??
            "customer",
        },
      });

    return {
      ok: true,

      appointment,
    };
  } catch (error) {
    if (
      isPrismaUniqueError(
        error,
      )
    ) {
      const [
        duplicateAfterRace,
        slotAfterRace,
      ] =
        await Promise.all([
          prisma.appointment.findFirst({
            where: {
              dailyIdentityKey:
                input.dailyIdentityKey,

              status: {
                in: [
                  ...SLOT_RESERVING_APPOINTMENT_STATUSES,
                ],
              },
            },

            select: {
              trackingCode:
                true,
            },
          }),

          prisma.appointment.findFirst({
            where: {
              activeSlotKey,
            },

            select: {
              id:
                true,
            },
          }),
        ]);

      if (
        duplicateAfterRace
      ) {
        return {
          ok: false,

          reason:
            "DUPLICATE_DAY",

          existingTrackingCode:
            duplicateAfterRace.trackingCode,
        };
      }

      if (
        slotAfterRace
      ) {
        return {
          ok: false,

          reason:
            "SLOT_FULL",
        };
      }

      return {
        ok: false,

        reason:
          "CONFLICT",
      };
    }

    throw error;
  }
}