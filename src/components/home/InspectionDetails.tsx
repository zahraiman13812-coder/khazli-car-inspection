import {
  BatteryCharging,
  CarFront,
  CheckCircle2,
  CircleGauge,
  Cog,
  Disc3,
  Paintbrush,
  ScanLine,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import Link from "next/link";

/*
 * ============================================================
 * INSPECTION DETAILS
 * بررسی فنی و بررسی بدنه
 * ============================================================
 */

const technicalItems = [
  {
    icon: CircleGauge,
    title: "بررسی عملکرد موتور",
    description:
      "بررسی وضعیت کلی عملکرد موتور، صداهای غیرعادی و نشانه‌های احتمالی ایراد.",
  },

  {
    icon: Cog,
    title: "بررسی گیربکس",
    description:
      "کنترل عملکرد گیربکس و بررسی نشانه‌های احتمالی ضربه، تأخیر یا عملکرد غیرطبیعی.",
  },

  {
    icon: BatteryCharging,
    title: "بررسی برق و باتری",
    description:
      "بررسی وضعیت عمومی سیستم برق، باتری و عملکرد تجهیزات الکتریکی خودرو.",
  },

  {
    icon: Disc3,
    title: "بررسی ترمز و سیستم حرکتی",
    description:
      "کنترل کلی وضعیت ترمزها و بخش‌های مرتبط با حرکت و ایمنی خودرو.",
  },
];

const bodyItems = [
  {
    icon: Paintbrush,
    title: "بررسی رنگ بدنه",
    description:
      "تشخیص رنگ‌شدگی، آبرنگ، صافکاری، لیسه‌گیری، بتونه‌کاری و تفاوت ضخامت رنگ در بخش‌های مختلف خودرو.",
  },

  {
    icon: ScanLine,
    title: "بررسی قطعات تعویضی",
    description:
      "بررسی آثار بازشدگی، تعویض یا تعمیر قطعات اصلی بدنه خودرو.",
  },

  {
    icon: ShieldCheck,
    title: "بررسی شاسی و بدنه",
    description:
      "کنترل بخش‌های حساس خودرو برای تشخیص آثار ضربه و آسیب‌های ساختاری.",
  },

  {
    icon: CarFront,
    title: "بررسی وضعیت ظاهری",
    description:
      "بررسی وضعیت کلی بدنه، چراغ‌ها، شیشه‌ها و اجزای خارجی خودرو.",
  },
];

export default function InspectionDetails() {
  return (
    <section className="border-y border-line bg-surface-muted">
      {/* =====================================================
          TECHNICAL INSPECTION
      ===================================================== */}

      <div
        id="technical-inspection"
        className="section-space scroll-mt-24"
      >
        <div className="site-container">
          <div className="grid items-start gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
            {/* Content */}

            <div className="lg:sticky lg:top-28">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-brand-soft text-brand-active">
                <Wrench
                  size={25}
                  strokeWidth={1.8}
                />
              </div>

              <span className="mt-6 block text-sm font-black text-brand-active">
                بررسی فنی خودرو
              </span>

              <h2 className="mt-4 text-3xl font-black leading-[1.45] text-ink sm:text-4xl lg:text-5xl">
                وضعیت فنی خودرو را

                <span className="block">
                  دقیق‌تر بشناسید.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-8 text-ink-secondary sm:text-base">
                بخش‌های اصلی فنی خودرو
                بررسی می‌شوند تا نشانه‌های
                احتمالی ایراد قبل از خرید
                بهتر شناسایی شوند.
              </p>

              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-brand-border bg-brand-soft p-4">
                <CheckCircle2
                  size={20}
                  className="mt-1 shrink-0 text-brand-active"
                />

                <p className="text-sm leading-7 text-ink-secondary">
                  بررسی فنی می‌تواند دید
                  بهتری نسبت به وضعیت واقعی
                  خودرو پیش از معامله در
                  اختیار شما قرار دهد.
                </p>
              </div>

              <Link
                href="/technical-inspection"
                className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-brand px-5 text-sm font-black text-on-brand transition-colors hover:bg-brand-hover sm:w-fit"
              >
                مشاهده کامل بررسی فنی

                <span className="mr-2">
                  ←
                </span>
              </Link>
            </div>

            {/* Technical cards */}

            <div className="grid gap-4 sm:grid-cols-2">
              {technicalItems.map(
                ({
                  icon: Icon,
                  title,
                  description,
                }) => (
                  <article
                    key={title}
                    className="rounded-[1.5rem] border border-line bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-border hover:shadow-card sm:p-6"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-active">
                      <Icon
                        size={21}
                        strokeWidth={1.8}
                      />
                    </div>

                    <h3 className="mt-5 text-base font-black text-ink sm:text-lg">
                      {title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-ink-secondary">
                      {description}
                    </p>
                  </article>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Separator */}

      <div className="site-container">
        <div className="h-px bg-line" />
      </div>

      {/* =====================================================
          BODY INSPECTION
      ===================================================== */}

      <div
        id="body-inspection"
        className="section-space scroll-mt-24"
      >
        <div className="site-container">
          <div className="grid items-start gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
            {/* Body cards */}

            <div className="order-2 grid gap-4 sm:grid-cols-2 lg:order-1">
              {bodyItems.map(
                ({
                  icon: Icon,
                  title,
                  description,
                }) => (
                  <article
                    key={title}
                    className="rounded-[1.5rem] border border-line bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-border hover:shadow-card sm:p-6"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-active">
                      <Icon
                        size={21}
                        strokeWidth={1.8}
                      />
                    </div>

                    <h3 className="mt-5 text-base font-black text-ink sm:text-lg">
                      {title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-ink-secondary">
                      {description}
                    </p>
                  </article>
                ),
              )}
            </div>

            {/* Content */}

            <div className="order-1 lg:order-2 lg:sticky lg:top-28">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-brand-soft text-brand-active">
                <CarFront
                  size={25}
                  strokeWidth={1.8}
                />
              </div>

              <span className="mt-6 block text-sm font-black text-brand-active">
                بررسی بدنه خودرو
              </span>

              <h2 className="mt-4 text-3xl font-black leading-[1.45] text-ink sm:text-4xl lg:text-5xl">
                جزئیات بدنه را

                <span className="block">
                  قبل از خرید بررسی کنید.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-8 text-ink-secondary sm:text-base">
                رنگ، شاسی، ستون‌ها و قطعات
                مختلف بدنه بررسی می‌شوند تا
                آثار تعمیر، تعویض یا
                آسیب‌های احتمالی بهتر مشخص
                شوند.
              </p>

              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-brand-border bg-brand-soft p-4">
                <ShieldCheck
                  size={20}
                  className="mt-1 shrink-0 text-brand-active"
                />

                <p className="text-sm leading-7 text-ink-secondary">
                  سلامت ظاهری خودرو همیشه
                  به معنی بدون آسیب بودن
                  بدنه نیست؛ بررسی تخصصی
                  جزئیات اهمیت زیادی دارد.
                </p>
              </div>

              <Link
                href="/body-inspection"
                className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-brand px-5 text-sm font-black text-on-brand transition-colors hover:bg-brand-hover sm:w-fit"
              >
                مشاهده کامل بررسی بدنه

                <span className="mr-2">
                  ←
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}