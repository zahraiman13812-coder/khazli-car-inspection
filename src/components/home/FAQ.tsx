"use client";

import {
  MessageSquareText,
  Minus,
  Plus,
} from "lucide-react";

import {
  useState,
} from "react";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export default function FAQ({
  items,
}: {
  items:
    FaqItem[];
}) {
  
  const [
  openId,
  setOpenId,
] =
  useState<
    string | null
  >(
    null,
  );

  if (
    items.length ===
    0
  ) {
    return null;
  }

  return (
    <section
      id="faq"
      className="section-space scroll-mt-24 bg-page"
    >
      <div className="site-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-black text-brand-active">
            سوالات متداول
          </span>

          <h2 className="mt-4 text-3xl font-black leading-[1.5] text-ink sm:text-4xl">
            قبل از رزرو، شاید جواب سوالت اینجا باشه
          </h2>

          <p className="mt-4 text-sm leading-8 text-ink-secondary sm:text-base">
            پاسخ سوال‌های پرتکرار درباره
            کارشناسی خودرو و فرآیند رزرو.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl space-y-3">
          {items.map(
            (
              item,
            ) => {
              const open =
                openId ===
                item.id;

              return (
                <article
                  key={
                    item.id
                  }
                  className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
                >
                  <button
                    type="button"
                    aria-expanded={
                      open
                    }
                    onClick={() =>
                      setOpenId(
                        open
                          ? null
                          : item.id,
                      )
                    }
                    className="flex w-full items-center justify-between gap-4 p-5 text-right sm:p-6"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-active">
                        <MessageSquareText
                          size={18}
                        />
                      </div>

                      <h3 className="text-sm font-black leading-7 text-ink sm:text-base">
                        {
                          item.question
                        }
                      </h3>
                    </div>

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-ink">
                      {open ? (
                        <Minus
                          size={16}
                        />
                      ) : (
                        <Plus
                          size={16}
                        />
                      )}
                    </div>
                  </button>

                  {open && (
                    <div className="border-t border-line px-5 py-5 sm:px-6">
                      <p className="whitespace-pre-wrap text-sm leading-8 text-ink-secondary">
                        {
                          item.answer
                        }
                      </p>
                    </div>
                  )}
                </article>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}