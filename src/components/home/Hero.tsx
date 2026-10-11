import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  BadgeCheck,
  CarFront,
  Check,
  Gauge,
  ShieldCheck,
  NotebookText
} from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden border-b border-line bg-page"
    >
      {/* Decorative shapes / المان‌های تزئینی */}
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-brand-soft" />

      <div className="pointer-events-none absolute -right-24 bottom-10 h-52 w-52 rounded-full bg-surface-muted" />

      <div className="site-container relative">
        <div className="grid min-h-[calc(100svh-72px)] items-center gap-14 py-14 lg:min-h-[720px] lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          {/* Content / محتوای اصلی */}
          <div className="order-1 max-w-3xl">
            {/* Badge / نشان بالای Hero */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-soft px-4 py-2 text-xs font-bold text-ink sm:text-sm">
              <BadgeCheck
                size={18}
                className="text-brand-active"
              />

              کارشناسی تخصصی قبل از خرید خودرو
            </div>

            <h1 className="text-[clamp(2.7rem,7vw,5.5rem)] font-black leading-[1.15] tracking-[-0.04em] text-ink">
              قبل از خرید،
              <span className="mt-2 block text-brand-active">
                مطمئن شو.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-ink-secondary sm:text-lg sm:leading-9">
              بررسی تخصصی رنگ، بدنه و
              وضعیت خودرو با تجهیزات دقیق و پیشرفته
              و گزارش شفاف؛ تا قبل از خرید،
              تصمیم مطمئن‌تری بگیرید.
            </p>

            {/* Hero actions / دکمه‌های Hero */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#booking"
                className="group inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-brand px-7 text-sm font-black text-on-brand transition-all hover:bg-brand-hover sm:text-base"
              >
                دریافت نوبت کارشناسی

                <ArrowLeft
                  size={19}
                  className="transition-transform group-hover:-translate-x-1"
                />
              </Link>

              <Link
                href="#services"
                className="inline-flex h-14 items-center justify-center rounded-2xl border border-line bg-surface px-7 text-sm font-black text-ink transition-colors hover:bg-surface-muted sm:text-base"
              >
                مشاهده خدمات
              </Link>
            </div>

            {/* Quick trust points / مزیت‌های سریع */}
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <Feature
                icon={<Gauge size={19} />}
                title="تجهیزات دقیق"
              />

              <Feature
                icon={
                  <ShieldCheck size={19} />
                }
                title="بررسی تخصصی"
              />

              <Feature
                icon={<NotebookText size={19} />}
                title="گزارش شفاف"
              />
              <Feature
                icon={<CarFront size={19} />}
                title="کارشناسی خودرو"
              />
            </div>
          </div>

          {/* Visual inspection card / کارت تصویری کارشناسی */}
          <div className="order-2 mx-auto w-full max-w-[560px] lg:mx-0">
            <div className="relative rounded-[2rem] border border-line bg-surface p-4 shadow-float sm:p-6">
              {/* Top / بالای کارت */}
              <div className="flex items-center justify-between gap-4 border-b border-line pb-5">
                <div className="flex min-w-0 items-center gap-3">
                  <Image
                    src="/brand/logo.png"
                    alt="لوگوی خزلی"
                    width={64}
                    height={64}
                    className="h-14 w-14 shrink-0 rounded-full object-cover"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-ink">
                      گزارش کارشناسی خودرو
                    </p>

                    <p className="mt-1 text-xs text-ink-muted">
                      بررسی تخصصی قبل از خرید
                    </p>
                  </div>
                </div>

                <div className="rounded-full bg-success-soft px-3 py-1.5 text-xs font-bold text-success">
                  بررسی کامل
                </div>
              </div>

              {/* Vehicle / خودرو */}
              <div className="mt-5 rounded-2xl bg-surface-muted p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand-active">
                    <CarFront size={28} />
                  </div>

                  <div>
                    <p className="font-black text-ink">
                      کارشناسی پیش از خرید
                    </p>

                    <p className="mt-1 text-sm leading-6 text-ink-muted">
                      بررسی چندمرحله‌ای خودرو
                    </p>
                  </div>
                </div>
              </div>

              {/* Checklist / چک‌لیست */}
              <div className="mt-5 space-y-3">
                <InspectionItem>
                  بررسی رنگ و ضخامت بدنه
                </InspectionItem>

                <InspectionItem>
                  تشخیص قطعات تعویضی
                </InspectionItem>

                <InspectionItem>
                  بررسی شاسی و بدنه
                </InspectionItem>

                <InspectionItem>
                  بررسی وضعیت ظاهری خودرو
                </InspectionItem>
                <InspectionItem>
                    بررسی فنی و تطابق کارکرد خودرو با دستگاه دیاگ تخصصی 
                </InspectionItem>
              </div>

              {/* Result / نتیجه */}
              <div className="mt-6 flex items-center justify-between rounded-2xl border border-brand-border bg-brand-soft p-4">
                <div>
                  <p className="text-xs font-medium text-ink-muted">
                    نتیجه کارشناسی
                  </p>

                  <p className="mt-1 font-black text-ink">
                    گزارش دقیق و شفاف
                  </p>
                </div>

                <ShieldCheck
                  size={30}
                  className="text-brand-active"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
      <div className="text-brand-active">
        {icon}
      </div>

      <span className="text-sm font-bold text-ink-secondary">
        {title}
      </span>
    </div>
  );
}

function InspectionItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line-soft px-4 py-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
        <Check size={15} />
      </div>

      <span className="text-sm font-bold text-ink-secondary">
        {children}
      </span>
    </div>
  );
}