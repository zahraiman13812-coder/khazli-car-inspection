import {
  BadgeCheck,
  CarFront,
  ClipboardCheck,
  Gauge,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Gauge,
    title: "بررسی با تجهیزات دقیق",
    description:
      "بررسی وضعیت رنگ و بدنه خودرو با ابزار مناسب برای تشخیص دقیق‌تر.",
  },
  {
    icon: SearchCheck,
    title: "بررسی جزئیات خودرو",
    description:
      "بررسی بخش‌های مهم بدنه، قطعات تعویضی و آثار تعمیر یا ضربه.",
  },
  {
    icon: ShieldCheck,
    title: "تصمیم مطمئن‌تر قبل از خرید",
    description:
      "هدف کارشناسی کمک به شما برای شناخت بهتر وضعیت خودرو قبل از معامله است.",
  },
  {
    icon: ClipboardCheck,
    title: "نتیجه شفاف کارشناسی",
    description:
      "نتیجه بررسی به شکلی واضح و قابل فهم در اختیار شما قرار می‌گیرد.",
  },
];

export default function WhyUs() {
  return (
    <section
      id="why-us"
      className="section-space scroll-mt-24 border-y border-line bg-surface-muted"
    >
      <div className="site-container">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* Content / محتوای اصلی */}
          <div>
            <span className="text-sm font-black text-brand-active">
              چرا کارشناسی خزلی؟
            </span>

            <h2 className="mt-4 max-w-xl text-3xl font-black leading-[1.45] text-ink sm:text-4xl lg:text-5xl">
              قبل از معامله،
              <span className="block">
                وضعیت واقعی خودرو را بدانید.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-8 text-ink-secondary sm:text-base sm:leading-9">
              ظاهر سالم خودرو همیشه به معنی
              سلامت کامل آن نیست. کارشناسی
              تخصصی کمک می‌کند قبل از خرید،
              اطلاعات دقیق‌تری درباره وضعیت
              رنگ، بدنه و بخش‌های مهم خودرو
              داشته باشید.
            </p>

            {/* Expert badge / نشان تخصص */}
            <div className="mt-8 flex max-w-xl items-start gap-4 rounded-2xl border border-brand-border bg-brand-soft p-4 sm:p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface text-brand-active">
                <BadgeCheck
                  size={23}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <p className="font-black text-ink">
                  کارشناسی تخصصی خودرو
                </p>

                <p className="mt-1 text-sm leading-7 text-ink-secondary">
                  تمرکز روی بررسی دقیق و ارائه
                  اطلاعات شفاف قبل از تصمیم
                  نهایی خرید.
                </p>
              </div>
            </div>
          </div>

          {/* Feature cards / کارت‌های مزایا */}
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map(
              ({
                icon: Icon,
                title,
                description,
              }) => (
                <article
                  key={title}
                  className="group rounded-[1.5rem] border border-line bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-border hover:shadow-card sm:p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-active">
                    <Icon
                      size={23}
                      strokeWidth={1.7}
                    />
                  </div>

                  <h3 className="mt-5 text-base font-black leading-7 text-ink sm:text-lg">
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

        {/* Bottom trust strip / نوار اعتماد پایین */}
        <div className="mt-12 grid overflow-hidden rounded-[1.75rem] border border-line bg-surface sm:grid-cols-3 lg:mt-16">
          <TrustItem
            icon={<CarFront size={22} />}
            title="بررسی قبل از خرید"
            text="قبل از نهایی کردن معامله"
          />

          <TrustItem
            icon={<Gauge size={22} />}
            title="بررسی تخصصی"
            text="با تمرکز روی جزئیات خودرو"
          />

          <TrustItem
            icon={<ClipboardCheck size={22} />}
            title="نتیجه قابل فهم"
            text="برای تصمیم‌گیری آگاهانه‌تر"
          />
        </div>
      </div>
    </section>
  );
}

function TrustItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-line p-5 last:border-b-0 sm:border-b-0 sm:border-l sm:last:border-l-0 sm:p-6">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-active">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="font-black text-ink">
          {title}
        </p>

        <p className="mt-1 text-xs leading-6 text-ink-muted">
          {text}
        </p>
      </div>
    </div>
  );
}