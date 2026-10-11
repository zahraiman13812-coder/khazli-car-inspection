import AppointmentsManager from "@/components/admin/AppointmentsManager";

import {
  getLastBookableDateISO,
  getTehranTodayISO,
} from "@/lib/appointment-time";

import {
  prisma,
} from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

const PAGE_SIZE = 30;

type AppointmentStatus =
  | "pending"
  | "completed"
  | "cancelled";

function normalizeAppointmentStatus(
  status: string,
): AppointmentStatus {
  if (
    status === "completed" ||
    status === "cancelled"
  ) {
    return status;
  }

  /*
   * confirmed فقط داده قدیمی است و در پنل جدید
   * به‌صورت «در انتظار» نمایش داده می‌شود.
   */
  return "pending";
}

export default async function AdminAppointmentsPage() {
  const today =
    getTehranTodayISO();

  const lastBookableDate =
    getLastBookableDateISO();

  const [
    appointments,
    total,
    blocks,
  ] =
    await Promise.all([
      prisma.appointment.findMany({
        take:
          PAGE_SIZE,
        orderBy: [
          {
            dateKey:
              "desc",
          },
          {
            time:
              "desc",
          },
          {
            createdAt:
              "desc",
          },
        ],
        select: {
          id: true,
          trackingCode: true,
          fullName: true,
          phone: true,
          serviceId: true,
          dateKey: true,
          time: true,
          carBrand: true,
          carModel: true,
          carYear: true,
          note: true,
          washConfirmed: true,
          status: true,
          source: true,
          createdAt: true,
          updatedAt: true,
          cancelledAt: true,
          completedAt: true,
        },
      }),

      prisma.appointment.count(),

      prisma.appointmentBlock.findMany({
        where: {
          dateKey: {
            gte:
              today,
            lte:
              lastBookableDate,
          },
        },
        orderBy: [
          {
            dateKey:
              "asc",
          },
          {
            time:
              "asc",
          },
        ],
      }),
    ]);

  const initialAppointments =
    appointments.map(
      (appointment) => ({
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
          normalizeAppointmentStatus(
            appointment.status,
          ),

        source:
          appointment.source,

        createdAt:
          appointment.createdAt.toISOString(),

        updatedAt:
          appointment.updatedAt.toISOString(),

        cancelledAt:
          appointment.cancelledAt?.toISOString() ??
          null,

        completedAt:
          appointment.completedAt?.toISOString() ??
          null,
      }),
    );

  const initialBlocks =
    blocks.map(
      (block) => ({
        id:
          block.id,

        blockKey:
          block.blockKey,

        dateKey:
          block.dateKey,

        time:
          block.time,

        reason:
          block.reason,

        createdAt:
          block.createdAt.toISOString(),

        updatedAt:
          block.updatedAt.toISOString(),
      }),
    );

  return (
    <AppointmentsManager
      initialAppointments={
        initialAppointments
      }
      initialTotal={
        total
      }
      initialToday={
        today
      }
      initialBlocks={
        initialBlocks
      }
    />
  );
}
