import {
  NextResponse,
} from "next/server";

import {
  APPOINTMENT_SLOT_CAPACITY,
} from "@/config/appointments";

import {
  getAllowedAppointmentTimes,
  isBookableDate,
} from "@/lib/appointment-time";

import {
  SLOT_RESERVING_APPOINTMENT_STATUSES,
} from "@/lib/appointment-slot-key";

import {
  prisma,
} from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

export async function GET(
  request: Request,
) {
  try {
    const url =
      new URL(request.url);

    const date =
      String(
        url.searchParams.get("date") ?? "",
      ).trim();

    if (
      !isBookableDate(date)
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "تاریخ انتخاب‌شده معتبر نیست.",
        },
        {
          status: 400,
        },
      );
    }

    const [
      appointments,
      blocks,
    ] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          dateKey: date,
          status: {
            in: [
              ...SLOT_RESERVING_APPOINTMENT_STATUSES,
            ],
          },
        },
        select: {
          time: true,
        },
      }),

      prisma.appointmentBlock.findMany({
        where: {
          dateKey: date,
        },
        select: {
          id: true,
          time: true,
          reason: true,
        },
      }),
    ]);

    const counts: Record<
      string,
      number
    > = {};

    for (
      const appointment of appointments
    ) {
      counts[appointment.time] =
        (counts[appointment.time] ?? 0) + 1;
    }

    const bookedTimes =
      Object.entries(counts)
        .filter(
          ([, count]) =>
            count >=
            APPOINTMENT_SLOT_CAPACITY,
        )
        .map(([time]) => time);

    const dayBlock =
      blocks.find(
        (item) =>
          item.time === null,
      );

    const blockedTimes =
      blocks
        .filter(
          (item) =>
            Boolean(item.time),
        )
        .map(
          (item) => item.time!,
        );

    const fullTimes =
      dayBlock
        ? getAllowedAppointmentTimes()
        : Array.from(
            new Set([
              ...bookedTimes,
              ...blockedTimes,
            ]),
          );

    return NextResponse.json(
      {
        ok: true,
        date,
        capacity:
          APPOINTMENT_SLOT_CAPACITY,
        dayBlocked:
          Boolean(dayBlock),
        dayBlockReason:
          dayBlock?.reason ?? null,
        bookedTimes,
        blockedTimes,
        fullTimes,
        counts,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "APPOINTMENT_AVAILABILITY_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "دریافت ساعت‌های قابل رزرو با خطا مواجه شد.",
      },
      {
        status: 500,
      },
    );
  }
}
