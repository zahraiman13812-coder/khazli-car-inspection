import Link from "next/link";

import {
  Check,
  Crown,
} from "lucide-react";

const packages = [
  {
    name: "کارشناسی رنگ",
    price: "تماس بگیرید",
    description:
      "مناسب بررسی وضعیت رنگ و بدنه خودرو.",
    features: [
      "بررسی ضخامت رنگ",
      "تشخیص رنگ‌شدگی",
      "تشخیص قطعات تعویضی",
      "بررسی بدنه",
    ],
    featured: false,
  },
  {
    name: "کارشناسی کامل",
    price: "تماس بگیرید",
    description:
      "انتخاب پیشنهادی برای بررسی کامل‌تر قبل از خرید.",
    features: [
      "کارشناسی رنگ و بدنه",
      "بررسی شاسی و ستون‌ها",
      "بررسی ظاهری خودرو",
      "ارائه گزارش کارشناسی",
    ],
    featured: true,
  },
  {
    name: "بررسی بدنه",
    price: "تماس بگیرید",
    description:
      "مناسب بررسی ساختاری بخش‌های مهم بدنه خودرو.",
    features: [
      "بررسی شاسی",
      "بررسی ستون‌ها",
      "بررسی آثار ضربه",
      "بررسی قطعات تعویضی",
    ],
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="section-space scroll-mt-24 bg-page"
    >
      <div className="site-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-black text-brand-active">
            تعرفه خدمات
          </span>

          <h2 className="mt-4 text-3xl font-black text-ink sm:text-4xl">
            متناسب با نیاز خود انتخاب کنید
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-ink-secondary sm:text-base">
            هزینه نهایی بر اساس نوع خودرو و
            خدمت انتخاب‌شده هنگام دریافت نوبت
            مشخص می‌شود.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-5 lg:mt-16 lg:grid-cols-3">
          {packages.map((item) => (
            <article
              key={item.name}
              className={`relative rounded-[1.75rem] border p-6 sm:p-7 ${
                item.featured
                  ? "border-brand-border bg-surface-warm shadow-float"
                  : "border-line bg-surface"
              }`}
            >
              {item.featured && (
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-brand px-3 py-1.5 text-xs font-black text-on-brand">
                  <Crown size={15} />

                  پیشنهاد ما
                </div>
              )}

              <h3 className="text-xl font-black text-ink">
                {item.name}
              </h3>

              <p className="mt-3 min-h-[56px] text-sm leading-7 text-ink-secondary">
                {item.description}
              </p>

              <p className="mt-7 text-2xl font-black text-ink">
                {item.price}
              </p>

              <div className="my-6 h-px bg-line" />

              <div className="space-y-4">
                {item.features.map(
                  (feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-active">
                        <Check size={15} />
                      </div>

                      <span className="text-sm font-medium text-ink-secondary">
                        {feature}
                      </span>
                    </div>
                  ),
                )}
              </div>

              <Link
                href="#booking"
                className={`mt-8 flex h-12 items-center justify-center rounded-xl text-sm font-black transition-colors ${
                  item.featured
                    ? "bg-brand text-on-brand hover:bg-brand-hover"
                    : "border border-line bg-surface text-ink hover:bg-surface-muted"
                }`}
              >
                دریافت نوبت
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}