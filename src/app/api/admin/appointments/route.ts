import {
  NextResponse,
} from "next/server";

import type {
  Prisma,
} from "@/generated/prisma/client";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  prisma,
} from "@/lib/prisma";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

const ALLOWED_STATUSES =
  new Set([
    "pending",
    "completed",
    "cancelled",
  ]);

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

function normalizeSearchName(
  value: string,
) {
  return value
    .normalize("NFKC")
    .replace(/ك/g, "ک")
    .replace(/[يى]/g, "ی")
    .replace(/ـ/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase(
      "fa-IR",
    );
}

function normalizeStatusForUi(
  value: string,
) {
  if (
    value === "completed" ||
    value === "cancelled"
  ) {
    return value;
  }

  /*
   * confirmed رکورد قدیمی است و در UI جدید
   * به‌عنوان «در انتظار» نمایش داده می‌شود.
   */
  return "pending";
}

export async function GET(
  request: Request,
) {
  try {
    const authenticated =
      await isAdminAuthenticated();

    if (
      !authenticated
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

    const url =
      new URL(
        request.url,
      );

    const rawSearch =
      String(
        url.searchParams.get(
          "q",
        ) ?? "",
      ).trim();

    const status =
      String(
        url.searchParams.get(
          "status",
        ) ?? "",
      ).trim();

    const date =
      normalizeDigits(
        String(
          url.searchParams.get(
            "date",
          ) ?? "",
        ),
      ).trim();

    const pageValue =
      Number(
        url.searchParams.get(
          "page",
        ) ?? "1",
      );

    const limitValue =
      Number(
        url.searchParams.get(
          "limit",
        ) ?? "30",
      );

    const page =
      Number.isFinite(pageValue) &&
      pageValue > 0
        ? Math.floor(pageValue)
        : 1;

    const limit =
      Number.isFinite(limitValue)
        ? Math.min(
            Math.max(
              Math.floor(limitValue),
              1,
            ),
            100,
          )
        : 30;

    const where: Prisma.AppointmentWhereInput =
      {};

    if (
      ALLOWED_STATUSES.has(status)
    ) {
      if (
        status === "pending"
      ) {
        /*
         * رکوردهای قدیمی confirmed نیز در دسته
         * «در انتظار» قرار می‌گیرند.
         */
        where.status = {
          in: [
            "pending",
            "confirmed",
          ],
        };
      } else {
        where.status =
          status;
      }
    }

    if (
      /^\d{4}-\d{2}-\d{2}$/.test(
        date,
      )
    ) {
      where.dateKey =
        date;
    }

    if (
      rawSearch
    ) {
      const search =
        normalizeDigits(
          rawSearch,
        );

      const normalizedName =
        normalizeSearchName(
          rawSearch,
        );

      const trackingSearch =
        search.toUpperCase();

      where.OR = [
        {
          fullName: {
            contains:
              rawSearch,
          },
        },
        {
          normalizedName: {
            contains:
              normalizedName,
          },
        },
        {
          phone: {
            contains:
              search.replace(
                /\D/g,
                "",
              ),
          },
        },
        {
          trackingCode: {
            contains:
              trackingSearch,
          },
        },
        {
          carBrand: {
            contains:
              rawSearch,
          },
        },
        {
          carModel: {
            contains:
              rawSearch,
          },
        },
      ];
    }

    const [
      total,
      appointments,
    ] =
      await Promise.all([
        prisma.appointment.count({
          where,
        }),

        prisma.appointment.findMany({
          where,
          skip:
            (page - 1) *
            limit,
          take:
            limit,
          orderBy: [
            {
              dateKey: "desc",
            },
            {
              time: "desc",
            },
            {
              createdAt: "desc",
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
      ]);

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          total /
            limit,
        ),
      );

    return jsonResponse({
      ok: true,

      appointments:
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
              normalizeStatusForUi(
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
        ),

      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error(
      "ADMIN_APPOINTMENTS_GET_ERROR",
      error,
    );

    return jsonResponse(
      {
        ok: false,
        code:
          "INTERNAL_ERROR",
        message:
          "دریافت نوبت‌ها با خطا مواجه شد.",
      },
      500,
    );
  }
}
