import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  Check,
  ScanSearch,
} from "lucide-react";

import type { PortfolioItem } from "@/data/portfolio";

type Props = {
  item: PortfolioItem;
};

export default function PortfolioCard({
  item,
}: Props) {
  return (
    <article
      className={`group overflow-hidden rounded-[1.75rem] border bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-float ${
        item.featured
          ? "border-brand-border"
          : "border-line"
      }`}
    >
      {/* Portfolio image / تصویر نمونه کارشناسی */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
        <Image
          src={item.image}
          alt={`${item.title} - ${item.subtitle}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />

        {/* Result badge / نشان نوع کارشناسی */}
        {item.result && (
          <div className="absolute right-4 top-4 rounded-full border border-brand-border bg-surface/95 px-3 py-2 text-xs font-black text-ink shadow-card backdrop-blur">
            {item.result}
          </div>
        )}
      </div>

      {/* Content / محتوا */}
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-black text-ink sm:text-xl">
              {item.title}
            </h3>

            <p className="mt-1 text-sm text-ink-muted">
              {item.subtitle}
            </p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand-active">
            <ScanSearch
              size={21}
              strokeWidth={1.8}
            />
          </div>
        </div>

        {/* Inspection services / موارد بررسی */}
        <div className="mt-6 space-y-3">
          {item.services.map(
            (service) => (
              <div
                key={service}
                className="flex items-center gap-3"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                  <Check
                    size={13}
                    strokeWidth={2.5}
                  />
                </div>

                <span className="text-sm font-medium text-ink-secondary">
                  {service}
                </span>
              </div>
            ),
          )}
        </div>

        {/* CTA / دعوت به اقدام */}
        <Link
  href="/#booking"
  className="group/link mt-7 flex h-11 items-center justify-between rounded-xl border border-line bg-surface-muted px-4 text-sm font-black text-ink transition-colors hover:border-brand-border hover:bg-brand-soft"
>
  کارشناسی خودرو من

  <ArrowLeft
    size={17}
    className="transition-transform group-hover/link:-translate-x-1"
  />
</Link>
      </div>
    </article>
  );
}