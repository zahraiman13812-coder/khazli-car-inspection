import {
  CalendarDays,
  CarFront,
  CheckCircle2,
  CircleGauge,
  Clock3,
  Cog,
  FileText,
  Lock,
  MessageSquareText,
  Wrench,
} from "lucide-react";

import Link from "next/link";

import type {
  ReactNode,
} from "react";

import {
  getTehranTodayISO,
} from "@/lib/appointment-time";

import {
  prisma,
} from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function formatNumber(
  value: number,
) {
  return new Intl.NumberFormat(
    "fa-IR",
  ).format(
    value,
  );
}

function getStatusLabel(
  status: string,
) {
  switch (
    status
  ) {
    case "pending":
      return "در انتظار";

    case "confirmed":
      return "تأییدشده";

    case "completed":
      return "انجام‌شده";

    case "cancelled":
      return "لغوشده";

    default:
      return status;
  }
}

function getStatusClasses(
  status: string,
) {
  switch (
    status
  ) {
    case "confirmed":
      return "bg-brand-soft text-brand-active";

    case "completed":
      return "bg-success-soft text-success";

    case "cancelled":
      return "bg-danger-soft text-danger";

    case "pending":
    default:
      return "bg-warning-soft text-warning";
  }
}

function getServiceLabel(
  serviceId: string,
) {
  switch (
    serviceId
  ) {
    case "paint":
      return "کارشناسی رنگ";

    case "body":
      return "بدنه و شاسی";

    case "full":
      return "کارشناسی کامل";

    default:
      return serviceId;
  }
}

function formatPersianDateKey(
  dateKey: string,
) {
  try {
    const date =
      new Date(
        `${dateKey}T12:00:00Z`,
      );

    return new Intl.DateTimeFormat(
      "fa-IR-u-ca-persian",
      {
        year:
          "numeric",

        month:
          "long",

        day:
          "numeric",

        timeZone:
          "Asia/Tehran",
      },
    ).format(
      date,
    );
  } catch {
    return dateKey;
  }
}

function formatPersianToday(
  dateKey: string,
) {
  try {
    const date =
      new Date(
        `${dateKey}T12:00:00Z`,
      );

    return new Intl.DateTimeFormat(
      "fa-IR-u-ca-persian",
      {
        weekday:
          "long",

        year:
          "numeric",

        month:
          "long",

        day:
          "numeric",

        timeZone:
          "Asia/Tehran",
      },
    ).format(
      date,
    );
  } catch {
    return dateKey;
  }
}

/*
 * ============================================================
 * DASHBOARD
 * ============================================================
 */

export default async function AdminDashboardPage() {
  const today =
    getTehranTodayISO();

  const [
    totalAppointments,
    todayAppointments,
    pendingAppointments,
    completedAppointments,

    newFeedbackCount,

    totalPortfolio,
    activePortfolio,

    totalEquipment,
    activeEquipment,

    totalArticles,
    publishedArticles,

    totalFaqs,
    activeFaqs,

    technicalImagesTotal,
    technicalImagesActive,
    technicalPage,

    bodyImagesTotal,
    bodyImagesActive,
    bodyPage,

    latestAppointments,
    todayAppointmentList,
  ] =
    await Promise.all([
      /*
       * Appointments
       */

      prisma.appointment.count(),

      prisma.appointment.count({
        where: {
          dateKey:
            today,

          status: {
            not:
              "cancelled",
          },
        },
      }),

      prisma.appointment.count({
        where: {
          status:
            "pending",
        },
      }),

      prisma.appointment.count({
        where: {
          status:
            "completed",
        },
      }),

      /*
       * Feedback
       */

      prisma.feedback.count({
        where: {
          status:
            "new",
        },
      }),

      /*
       * Portfolio
       */

      prisma.portfolioItem.count(),

      prisma.portfolioItem.count({
        where: {
          isActive:
            true,
        },
      }),

      /*
       * Equipment
       */

      prisma.equipmentItem.count(),

      prisma.equipmentItem.count({
        where: {
          isActive:
            true,
        },
      }),

      /*
       * Articles
       */

      prisma.article.count(),

      prisma.article.count({
        where: {
          status:
            "published",
        },
      }),

      /*
       * FAQs
       */

      prisma.faq.count(),

      prisma.faq.count({
        where: {
          isActive:
            true,
        },
      }),

      /*
       * Technical inspection
       */

      prisma.technicalInspectionImage.count(),

      prisma.technicalInspectionImage.count({
        where: {
          isActive:
            true,
        },
      }),

      prisma.technicalInspectionPage.findUnique({
        where: {
          id:
            "main",
        },

        select: {
          videoUrl:
            true,
        },
      }),

      /*
       * Body inspection
       */

      prisma.bodyInspectionImage.count(),

      prisma.bodyInspectionImage.count({
        where: {
          isActive:
            true,
        },
      }),

      prisma.bodyInspectionPage.findUnique({
        where: {
          id:
            "main",
        },

        select: {
          videoUrl:
            true,
        },
      }),

      /*
       * Latest appointments
       */

      prisma.appointment.findMany({
        orderBy: {
          createdAt:
            "desc",
        },

        take:
          6,

        select: {
          id:
            true,

          trackingCode:
            true,

          fullName:
            true,

          phone:
            true,

          serviceId:
            true,

          dateKey:
            true,

          time:
            true,

          carBrand:
            true,

          carModel:
            true,

          carYear:
            true,

          status:
            true,

          createdAt:
            true,
        },
      }),

      /*
       * Today's appointments
       */

      prisma.appointment.findMany({
        where: {
          dateKey:
            today,

          status: {
            not:
              "cancelled",
          },
        },

        orderBy: {
          time:
            "asc",
        },

        take:
          8,

        select: {
          id:
            true,

          trackingCode:
            true,

          fullName:
            true,

          serviceId:
            true,

          time:
            true,

          carBrand:
            true,

          carModel:
            true,

          status:
            true,
        },
      }),
    ]);

  const technicalVideoExists =
    Boolean(
      technicalPage
        ?.videoUrl
        ?.trim(),
    );

  const bodyVideoExists =
    Boolean(
      bodyPage
        ?.videoUrl
        ?.trim(),
    );

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="text-sm font-black text-brand-active">
            پنل مدیریت
          </span>

          <h1 className="mt-2 text-3xl font-black text-ink sm:text-4xl">
            داشبورد
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-secondary">
            وضعیت نوبت‌ها، محتوای سایت،
            تجهیزات و بخش‌های کارشناسی را
            از یک‌جا بررسی و مدیریت کنید.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-surface px-4 py-3 shadow-card">
          <p className="text-[10px] font-bold text-ink-muted">
            امروز
          </p>

          <p className="mt-1 text-sm font-black text-ink">
            {
              formatPersianToday(
                today,
              )
            }
          </p>
        </div>
      </div>

      {/* =====================================================
          MAIN STATS
      ===================================================== */}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={
            <CalendarDays
              size={21}
            />
          }
          title="نوبت‌های امروز"
          value={
            todayAppointments
          }
          description="نوبت‌های فعال امروز"
          href="/admin/appointments"
        />

        <StatCard
          icon={
            <Clock3
              size={21}
            />
          }
          title="در انتظار تأیید"
          value={
            pendingAppointments
          }
          description="نوبت‌های نیازمند بررسی"
          href="/admin/appointments"
          attention={
            pendingAppointments >
            0
          }
        />

        <StatCard
          icon={
            <MessageSquareText
              size={21}
            />
          }
          title="پیام‌های جدید"
          value={
            newFeedbackCount
          }
          description="پیشنهاد، انتقاد یا پیام جدید"
          href="/admin/feedback"
          attention={
            newFeedbackCount >
            0
          }
        />

        <StatCard
          icon={
            <CheckCircle2
              size={21}
            />
          }
          title="کارشناسی انجام‌شده"
          value={
            completedAppointments
          }
          description="کل نوبت‌های تکمیل‌شده"
          href="/admin/appointments"
        />
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <ContentCard
          icon={
            <CircleGauge
              size={20}
            />
          }
          title="بررسی فنی"
          active={
            technicalImagesActive
          }
          total={
            technicalImagesTotal
          }
          activeLabel="تصویر فعال"
          href="/admin/technical-inspection"
          extra={
            technicalVideoExists
              ? "ویدیو ثبت شده"
              : "ویدیو ثبت نشده"
          }
          positiveExtra={
            technicalVideoExists
          }
        />

        <ContentCard
          icon={
            <CarFront
              size={20}
            />
          }
          title="بررسی بدنه"
          active={
            bodyImagesActive
          }
          total={
            bodyImagesTotal
          }
          activeLabel="تصویر فعال"
          href="/admin/body-inspection"
          extra={
            bodyVideoExists
              ? "ویدیو ثبت شده"
              : "ویدیو ثبت نشده"
          }
          positiveExtra={
            bodyVideoExists
          }
        />

        <ContentCard
          icon={
            <Wrench
              size={20}
            />
          }
          title="تجهیزات"
          active={
            activeEquipment
          }
          total={
            totalEquipment
          }
          activeLabel="فعال"
          href="/admin/equipment"
        />

        <ContentCard
          icon={
            <CarFront
              size={20}
            />
          }
          title="نمونه‌کارها"
          active={
            activePortfolio
          }
          total={
            totalPortfolio
          }
          activeLabel="فعال"
          href="/admin/portfolio"
        />

        <ContentCard
          icon={
            <FileText
              size={20}
            />
          }
          title="مقالات"
          active={
            publishedArticles
          }
          total={
            totalArticles
          }
          activeLabel="منتشرشده"
          href="/admin/articles"
        />

        <ContentCard
          icon={
            <MessageSquareText
              size={20}
            />
          }
          title="سوالات متداول"
          active={
            activeFaqs
          }
          total={
            totalFaqs
          }
          activeLabel="فعال"
          href="/admin/faqs"
        />
      </div>

      {/* =====================================================
          TODAY + QUICK ACTIONS
      ===================================================== */}

      <div className="mt-8 grid gap-6 2xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.7fr)]">
        {/* Today's appointments */}

        <section className="rounded-[1.5rem] border border-line bg-surface shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-black text-ink">
                نوبت‌های امروز
              </h2>

              <p className="mt-1 text-xs text-ink-muted">
                برنامه امروز به‌ترتیب ساعت
              </p>
            </div>

            <Link
              href="/admin/appointments"
              className="text-xs font-black text-brand-active"
            >
              مدیریت همه نوبت‌ها ←
            </Link>
          </div>

          {todayAppointmentList.length ===
          0 ? (
            <div className="p-10 text-center">
              <Clock3
                size={28}
                className="mx-auto text-ink-muted"
              />

              <p className="mt-4 font-black text-ink">
                امروز نوبت فعالی وجود
                ندارد.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {todayAppointmentList.map(
                (
                  appointment,
                ) => (
                  <div
                    key={
                      appointment.id
                    }
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 min-w-16 shrink-0 items-center justify-center rounded-xl bg-brand-soft px-3 text-sm font-black text-brand-active">
                        {
                          appointment.time
                        }
                      </div>

                      <div className="min-w-0">
                        <p className="font-black text-ink">
                          {
                            appointment.fullName
                          }
                        </p>

                        <p className="mt-1 text-xs leading-6 text-ink-muted">
                          {
                            appointment.carBrand
                          }{" "}
                          {
                            appointment.carModel
                          }
                          {" · "}
                          {
                            getServiceLabel(
                              appointment.serviceId,
                            )
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1.5 text-[10px] font-black ${getStatusClasses(
                          appointment.status,
                        )}`}
                      >
                        {
                          getStatusLabel(
                            appointment.status,
                          )
                        }
                      </span>

                      <Link
                        href="/admin/appointments"
                        className="rounded-lg border border-line px-3 py-1.5 text-[10px] font-black text-ink transition-colors hover:bg-surface-hover"
                      >
                        بررسی
                      </Link>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </section>

        {/* Quick actions */}

        <section className="rounded-[1.5rem] border border-line bg-surface p-5 shadow-card sm:p-6">
          <h2 className="text-lg font-black text-ink">
            دسترسی سریع
          </h2>

          <p className="mt-1 text-xs leading-6 text-ink-muted">
            عملیات پرتکرار مدیریت سایت
          </p>

          <div className="mt-5 grid gap-2">
            <QuickAction
              href="/admin/appointments"
              icon={
                <CalendarDays
                  size={18}
                />
              }
              title="مدیریت نوبت‌ها"
              description={`${formatNumber(
                pendingAppointments,
              )} نوبت در انتظار`}
            />

            <QuickAction
              href="/admin/technical-inspection"
              icon={
                <CircleGauge
                  size={18}
                />
              }
              title="بررسی فنی"
              description={
                technicalVideoExists
                  ? `${formatNumber(
                      technicalImagesActive,
                    )} تصویر فعال · ویدیو ثبت شده`
                  : `${formatNumber(
                      technicalImagesActive,
                    )} تصویر فعال · بدون ویدیو`
              }
            />

            <QuickAction
              href="/admin/body-inspection"
              icon={
                <CarFront
                  size={18}
                />
              }
              title="بررسی بدنه"
              description={
                bodyVideoExists
                  ? `${formatNumber(
                      bodyImagesActive,
                    )} تصویر فعال · ویدیو ثبت شده`
                  : `${formatNumber(
                      bodyImagesActive,
                    )} تصویر فعال · بدون ویدیو`
              }
            />

            <QuickAction
              href="/admin/equipment"
              icon={
                <Wrench
                  size={18}
                />
              }
              title="مدیریت تجهیزات"
              description={`${formatNumber(
                activeEquipment,
              )} تجهیز فعال`}
            />

            <QuickAction
              href="/admin/portfolio"
              icon={
                <CarFront
                  size={18}
                />
              }
              title="مدیریت نمونه‌کارها"
              description="تصاویر و پروژه‌های انجام‌شده"
            />

            <QuickAction
              href="/admin/articles"
              icon={
                <FileText
                  size={18}
                />
              }
              title="مدیریت مقالات"
              description="محتوای آموزشی سایت"
            />

            <QuickAction
              href="/admin/feedback"
              icon={
                <MessageSquareText
                  size={18}
                />
              }
              title="بررسی پیام‌ها"
              description={`${formatNumber(
                newFeedbackCount,
              )} پیام جدید`}
            />

            <QuickAction
              href="/admin/settings"
              icon={
                <Cog
                  size={18}
                />
              }
              title="تنظیمات سایت"
              description="تماس، آدرس و اطلاعات کسب‌وکار"
            />

            <QuickAction
              href="/admin/security"
              icon={
                <Lock
                  size={18}
                />
              }
              title="امنیت"
              description="مدیریت رمز عبور پنل"
            />
          </div>
        </section>
      </div>

      {/* =====================================================
          LATEST APPOINTMENTS
      ===================================================== */}

      <section className="mt-6 overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-black text-ink">
              آخرین نوبت‌های ثبت‌شده
            </h2>

            <p className="mt-1 text-xs text-ink-muted">
              آخرین درخواست‌های دریافتی
              از سایت
            </p>
          </div>

          <div className="rounded-full bg-surface-muted px-3 py-1.5 text-[10px] font-black text-ink-muted">
            کل نوبت‌ها:{" "}
            {
              formatNumber(
                totalAppointments,
              )
            }
          </div>
        </div>

        {latestAppointments.length ===
        0 ? (
          <div className="p-10 text-center">
            <p className="font-black text-ink">
              هنوز نوبتی ثبت نشده.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile */}

            <div className="divide-y divide-line lg:hidden">
              {latestAppointments.map(
                (
                  appointment,
                ) => (
                  <div
                    key={
                      appointment.id
                    }
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-ink">
                          {
                            appointment.fullName
                          }
                        </p>

                        <p
                          dir="ltr"
                          className="mt-1 text-right text-xs text-ink-muted"
                        >
                          {
                            appointment.phone
                          }
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black ${getStatusClasses(
                          appointment.status,
                        )}`}
                      >
                        {
                          getStatusLabel(
                            appointment.status,
                          )
                        }
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-surface-muted p-3">
                      <Info
                        label="خودرو"
                        value={`${appointment.carBrand} ${appointment.carModel}`}
                      />

                      <Info
                        label="سرویس"
                        value={
                          getServiceLabel(
                            appointment.serviceId,
                          )
                        }
                      />

                      <Info
                        label="تاریخ"
                        value={
                          formatPersianDateKey(
                            appointment.dateKey,
                          )
                        }
                      />

                      <Info
                        label="ساعت"
                        value={
                          appointment.time
                        }
                      />
                    </div>

                    <div className="mt-3 rounded-xl border border-line px-3 py-2">
                      <p className="text-[9px] font-bold text-ink-muted">
                        کد پیگیری
                      </p>

                      <p
                        dir="ltr"
                        className="mt-1 text-right text-xs font-black text-ink"
                      >
                        {
                          appointment.trackingCode
                        }
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>

            {/* Desktop */}

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px] text-right">
                <thead className="bg-surface-muted">
                  <tr className="text-[11px] font-black text-ink-muted">
                    <th className="px-5 py-4">
                      مشتری
                    </th>

                    <th className="px-5 py-4">
                      خودرو
                    </th>

                    <th className="px-5 py-4">
                      سرویس
                    </th>

                    <th className="px-5 py-4">
                      تاریخ
                    </th>

                    <th className="px-5 py-4">
                      ساعت
                    </th>

                    <th className="px-5 py-4">
                      وضعیت
                    </th>

                    <th className="px-5 py-4">
                      کد پیگیری
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-line">
                  {latestAppointments.map(
                    (
                      appointment,
                    ) => (
                      <tr
                        key={
                          appointment.id
                        }
                        className="text-sm text-ink-secondary transition-colors hover:bg-surface-hover"
                      >
                        <td className="px-5 py-4">
                          <p className="font-black text-ink">
                            {
                              appointment.fullName
                            }
                          </p>

                          <p
                            dir="ltr"
                            className="mt-1 text-right text-[11px] text-ink-muted"
                          >
                            {
                              appointment.phone
                            }
                          </p>
                        </td>

                        <td className="px-5 py-4 font-bold">
                          {
                            appointment.carBrand
                          }{" "}
                          {
                            appointment.carModel
                          }

                          {appointment.carYear && (
                            <span className="mr-1 text-xs text-ink-muted">
                              {
                                appointment.carYear
                              }
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {
                            getServiceLabel(
                              appointment.serviceId,
                            )
                          }
                        </td>

                        <td className="px-5 py-4">
                          {
                            formatPersianDateKey(
                              appointment.dateKey,
                            )
                          }
                        </td>

                        <td className="px-5 py-4 font-black text-ink">
                          {
                            appointment.time
                          }
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-black ${getStatusClasses(
                              appointment.status,
                            )}`}
                          >
                            {
                              getStatusLabel(
                                appointment.status,
                              )
                            }
                          </span>
                        </td>

                        <td
                          dir="ltr"
                          className="px-5 py-4 text-right text-xs font-bold text-ink-muted"
                        >
                          {
                            appointment.trackingCode
                          }
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* =====================================================
          SYSTEM SUMMARY
      ===================================================== */}

      <section className="mt-6 rounded-[1.5rem] border border-line bg-surface p-5 shadow-card sm:p-6">
        <h2 className="text-lg font-black text-ink">
          خلاصه وضعیت سایت
        </h2>

        <p className="mt-1 text-xs leading-6 text-ink-muted">
          وضعیت کلی محتوای فعال و
          اطلاعات ثبت‌شده
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <SummaryItem
            label="کل نوبت‌ها"
            value={
              totalAppointments
            }
          />

          <SummaryItem
            label="تجهیز فعال"
            value={
              activeEquipment
            }
          />

          <SummaryItem
            label="نمونه‌کار فعال"
            value={
              activePortfolio
            }
          />

          <SummaryItem
            label="تصاویر فنی"
            value={
              technicalImagesActive
            }
          />

          <SummaryItem
            label="تصاویر بدنه"
            value={
              bodyImagesActive
            }
          />

          <SummaryItem
            label="مقاله منتشرشده"
            value={
              publishedArticles
            }
          />

          <SummaryItem
            label="FAQ فعال"
            value={
              activeFaqs
            }
          />
        </div>
      </section>
    </div>
  );
}

/*
 * ============================================================
 * STAT CARD
 * ============================================================
 */

function StatCard({
  icon,
  title,
  value,
  description,
  href,
  attention = false,
}: {
  icon:
    ReactNode;

  title:
    string;

  value:
    number;

  description:
    string;

  href:
    string;

  attention?:
    boolean;
}) {
  return (
    <Link
      href={
        href
      }
      className="group rounded-[1.5rem] border border-line bg-surface p-5 shadow-card transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            attention
              ? "bg-warning-soft text-warning"
              : "bg-brand-soft text-brand-active"
          }`}
        >
          {
            icon
          }
        </div>

        {attention && (
          <span className="rounded-full bg-warning-soft px-2.5 py-1 text-[9px] font-black text-warning">
            نیاز به بررسی
          </span>
        )}
      </div>

      <p className="mt-5 text-3xl font-black text-ink">
        {
          formatNumber(
            value,
          )
        }
      </p>

      <p className="mt-2 text-sm font-black text-ink">
        {
          title
        }
      </p>

      <p className="mt-1 text-xs leading-6 text-ink-muted">
        {
          description
        }
      </p>
    </Link>
  );
}

/*
 * ============================================================
 * CONTENT CARD
 * ============================================================
 */

function ContentCard({
  icon,
  title,
  active,
  total,
  href,
  activeLabel,
  extra,
  positiveExtra = false,
}: {
  icon:
    ReactNode;

  title:
    string;

  active:
    number;

  total:
    number;

  href:
    string;

  activeLabel:
    string;

  extra?:
    string;

  positiveExtra?:
    boolean;
}) {
  return (
    <Link
      href={
        href
      }
      className="group rounded-[1.5rem] border border-line bg-surface p-5 shadow-card transition-colors hover:bg-surface-hover"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-active">
          {
            icon
          }
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="font-black text-ink">
              {
                title
              }
            </p>

            <span className="text-sm font-black text-brand-active transition-transform group-hover:-translate-x-0.5">
              ←
            </span>
          </div>

          <p className="mt-1 text-xs text-ink-muted">
            {
              formatNumber(
                active,
              )
            }{" "}
            {activeLabel} از{" "}
            {
              formatNumber(
                total,
              )
            }
          </p>

          {extra && (
            <div
              className={
                positiveExtra
                  ? "mt-3 inline-flex rounded-full bg-success-soft px-2.5 py-1 text-[10px] font-black text-success"
                  : "mt-3 inline-flex rounded-full bg-warning-soft px-2.5 py-1 text-[10px] font-black text-warning"
              }
            >
              {
                extra
              }
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

/*
 * ============================================================
 * QUICK ACTION
 * ============================================================
 */

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href:
    string;

  icon:
    ReactNode;

  title:
    string;

  description:
    string;
}) {
  return (
    <Link
      href={
        href
      }
      className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 transition-colors hover:bg-surface-hover"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-active">
        {
          icon
        }
      </div>

      <div className="min-w-0">
        <p className="text-xs font-black text-ink">
          {
            title
          }
        </p>

        <p className="mt-0.5 truncate text-[10px] text-ink-muted">
          {
            description
          }
        </p>
      </div>
    </Link>
  );
}

/*
 * ============================================================
 * SUMMARY ITEM
 * ============================================================
 */

function SummaryItem({
  label,
  value,
}: {
  label:
    string;

  value:
    number;
}) {
  return (
    <div className="rounded-xl bg-surface-muted p-4">
      <p className="text-xs font-bold text-ink-muted">
        {
          label
        }
      </p>

      <p className="mt-2 text-2xl font-black text-ink">
        {
          formatNumber(
            value,
          )
        }
      </p>
    </div>
  );
}

/*
 * ============================================================
 * MOBILE INFO
 * ============================================================
 */

function Info({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div>
      <p className="text-[9px] font-bold text-ink-muted">
        {
          label
        }
      </p>

      <p className="mt-1 text-xs font-black text-ink">
        {
          value
        }
      </p>
    </div>
  );
}