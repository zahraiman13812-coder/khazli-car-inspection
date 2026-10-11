import {
  CarFront,
  ClipboardCheck,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";

const services = [
  {
    icon: ScanSearch,
    title: "کارشناسی رنگ و بدنه",
    description:
      "بررسی دقیق ضخامت رنگ، تشخیص رنگ‌شدگی، بتونه، تعویض قطعات و تعمیرات بدنه.",
  },
  {
    icon: ShieldCheck,
    title: "بررسی شاسی و بدنه",
    description:
      "بررسی بخش‌های حساس سازه خودرو برای تشخیص ضربه و آسیب‌های مهم.",
  },
  {
    icon: CarFront,
    title: "بررسی وضعیت ظاهری",
    description:
      "کنترل دقیق وضعیت بدنه، چراغ‌ها، شیشه‌ها و اجزای خارجی خودرو.",
  },
  {
    icon: ClipboardCheck,
    title: "گزارش کارشناسی",
    description:
      "ارائه نتیجه شفاف و قابل فهم برای کمک به تصمیم‌گیری قبل از خرید.",
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="section-space scroll-mt-24 bg-page"
    >
      <div className="site-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-black text-brand-active">
            خدمات کارشناسی
          </span>

          <h2 className="mt-4 text-3xl font-black leading-tight text-ink sm:text-4xl lg:text-5xl">
            خودرو را قبل از خرید،
            دقیق بررسی می‌کنیم.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-ink-secondary sm:text-base sm:leading-8">
            هدف کارشناسی فقط پیدا کردن
            رنگ‌شدگی نیست؛ وضعیت خودرو باید
            به شکلی بررسی شود که تصمیم نهایی
            شما بر اساس اطلاعات واقعی باشد.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {services.map(
            ({
              icon: Icon,
              title,
              description,
            }) => (
              <article
                key={title}
                className="group rounded-[1.5rem] border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-border hover:shadow-card"
              >
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-brand-soft text-brand-active transition-transform duration-300 group-hover:scale-105">
                  <Icon
                    size={25}
                    strokeWidth={1.7}
                  />
                </div>

                <h3 className="mt-6 text-lg font-black text-ink">
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