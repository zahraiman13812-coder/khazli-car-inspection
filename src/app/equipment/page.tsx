import type {
  Metadata,
} from "next";

import {
  Wrench,
} from "lucide-react";

import EquipmentCard from "@/components/equipment/EquipmentCard";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

import {
  getPublicEquipmentItems,
} from "@/lib/equipment";

import {
  getSiteSettings,
} from "@/lib/site-settings";

export const metadata: Metadata = {
  title:
    "تجهیزات کارشناسی خودرو",

  description:
    "آشنایی با تجهیزات و دستگاه‌های تخصصی مورد استفاده در کارشناسی خودرو خزلی.",

  alternates: {
    canonical:
      "/equipment",
  },

  openGraph: {
    type:
      "website",
    locale:
      "fa_IR",
    url:
      "/equipment",
    title:
      "تجهیزات کارشناسی خودرو",
    description:
      "آشنایی با تجهیزات و دستگاه‌های تخصصی مورد استفاده در کارشناسی خودرو خزلی.",
    images: [
      {
        url:
          "/brand/logo.png",
        alt:
          "کارشناسی خودرو خزلی",
      },
    ],
  },

  twitter: {
    card:
      "summary",
    title:
      "تجهیزات کارشناسی خودرو",
    description:
      "آشنایی با تجهیزات و دستگاه‌های تخصصی مورد استفاده در کارشناسی خودرو خزلی.",
    images: [
      "/brand/logo.png",
    ],
  },
};

export const dynamic =
  "force-dynamic";

export default async function EquipmentPage() {
  const [
    settings,
    equipment,
  ] =
    await Promise.all([
      getSiteSettings(),
      getPublicEquipmentItems(),
    ]);

  return (
    <>
      <Header
        settings={
          settings
        }
      />

      <main className="min-h-screen bg-page">
        <section className="border-b border-line bg-surface">
          <div className="site-container py-12 sm:py-16 lg:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-active">
                <Wrench
                  size={22}
                />
              </div>

              <p className="mt-5 text-sm font-black text-brand-active">
                تجهیزات تخصصی
              </p>

              <h1 className="mt-2 text-3xl font-black leading-tight text-ink sm:text-4xl lg:text-5xl">
                تجهیزات مورد استفاده در کارشناسی خودرو
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-ink-secondary sm:text-base">
                بخشی از تجهیزات و ابزارهای تخصصی که برای بررسی دقیق‌تر خودرو و ارائه نتیجه قابل اعتماد استفاده می‌شوند.
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14 lg:py-16">
          <div className="site-container">
            {equipment.length >
            0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {equipment.map(
                  (
                    item,
                  ) => (
                    <EquipmentCard
                      key={
                        item.id
                      }
                      item={
                        item
                      }
                    />
                  ),
                )}
              </div>
            ) : (
              <div className="mx-auto max-w-2xl rounded-[1.5rem] border border-line bg-surface p-8 text-center sm:p-10">
                <Wrench
                  size={30}
                  className="mx-auto text-ink-muted"
                />

                <h2 className="mt-4 text-lg font-black text-ink">
                  هنوز تجهیزی ثبت نشده است
                </h2>

                <p className="mt-2 text-sm leading-7 text-ink-muted">
                  اطلاعات تجهیزات کارشناسی به‌زودی در این بخش قرار می‌گیرد.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer
        settings={
          settings
        }
      />
    </>
  );
}