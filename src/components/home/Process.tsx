import {
  CalendarDays,
  ClipboardCheck,
  ScanSearch,
} from "lucide-react";

const steps = [
  {
    number: "۰۱",
    icon: CalendarDays,
    title: "ثبت نوبت",
    description:
      "نوع خدمت، تاریخ و ساعت مناسب خود را انتخاب کنید.",
  },
  {
    number: "۰۲",
    icon: ScanSearch,
    title: "کارشناسی خودرو",
    description:
      "بررسی دقیق خودرو و تشخیص آپشن‌های فابریک و غیرفابریک انجام می‌شود.",
  },
  {
    number: "۰۳",
    icon: ClipboardCheck,
    title: "دریافت نتیجه",
    description:
      "نتیجه بررسی به شکل شفاف برای تصمیم‌گیری ارائه می‌شود.",
  },
];

export default function Process() {
  return (
    <section
      id="process"
      className="section-space scroll-mt-24 border-y border-line bg-surface-muted"
    >
      <div className="site-container">
        <div className="max-w-2xl">
          <span className="text-sm font-black text-brand-active">
            روند کار
          </span>

          <h2 className="mt-4 text-3xl font-black leading-tight text-ink sm:text-4xl">
            از رزرو نوبت تا دریافت نتیجه
          </h2>

          <p className="mt-5 text-sm leading-7 text-ink-secondary sm:text-base">
            فرایند کارشناسی را ساده و شفاف
            طراحی کرده‌ایم تا بدون اتلاف وقت
            بتوانید قبل از خرید خودرو تصمیم
            دقیق‌تری بگیرید.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3 lg:mt-16">
          {steps.map(
            ({
              number,
              icon: Icon,
              title,
              description,
            }) => (
              <article
                key={number}
                className="relative rounded-[1.5rem] border border-line bg-surface p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-active">
                    <Icon
                      size={23}
                      strokeWidth={1.7}
                    />
                  </div>

                  <span className="text-2xl font-black text-line-strong">
                    {number}
                  </span>
                </div>

                <h3 className="mt-7 text-lg font-black text-ink">
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
    </section>
  );
}
