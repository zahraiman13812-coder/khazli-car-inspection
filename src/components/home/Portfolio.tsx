"use client";

import {
  CarFront,
} from "lucide-react";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type PortfolioItem = {
  id: string;
  title: string;
  vehicle: string;
  category: string;
  description: string;

  beforeImageUrl:
    | string
    | null;

  afterImageUrl: string;
};

function getCategoryLabel(
  value: string,
) {
  switch (
    value
  ) {
    case "paint":
      return "کارشناسی رنگ";

    case "body":
      return "بدنه و شاسی";

    case "technical":
      return "کارشناسی فنی";

    case "full":
    default:
      return "کارشناسی کامل";
  }
}

export default function Portfolio({
  items,
}: {
  items: PortfolioItem[];
}) {
  const scrollerRef =
    useRef<HTMLDivElement>(
      null,
    );

  const autoIndexRef =
    useRef(0);

  const autoDirectionRef =
    useRef<
      1 | -1
    >(1);

  const draggingRef =
    useRef(false);

  const dragStartXRef =
    useRef(0);

  const dragStartScrollRef =
    useRef(0);

  const resumeTimerRef =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  const [
    autoplayPaused,
    setAutoplayPaused,
  ] =
    useState(false);

  const cards =
    useMemo(
      () =>
        items.filter(
          (
            item,
          ) =>
            Boolean(
              item.afterImageUrl,
            ),
        ),
      [
        items,
      ],
    );

  /*
   * فقط خود اسلایدر را به‌صورت افقی حرکت می‌دهیم.
   * از scrollIntoView استفاده نمی‌کنیم چون ممکن است
   * کل صفحه را دوباره به سکشن نمونه‌کارها اسکرول کند.
   */
  function scrollToCard(
    index: number,
  ) {
    const container =
      scrollerRef.current;

    if (
      !container
    ) {
      return;
    }

    const card =
      container.children[
        index
      ] as
        | HTMLElement
        | undefined;

    if (
      !card
    ) {
      return;
    }

    const containerRect =
      container.getBoundingClientRect();

    const cardRect =
      card.getBoundingClientRect();

    /*
     * در حالت RTL کارت هدف را به لبه راست viewport
     * اسلایدر نزدیک می‌کنیم. فقط scrollLeft تغییر می‌کند،
     * بنابراین scroll عمودی صفحه دست‌نخورده باقی می‌ماند.
     */
    const horizontalDelta =
      cardRect.right -
      containerRect.right;

    container.scrollBy({
      left:
        horizontalDelta,

      behavior:
        "smooth",
    });
  }

  function pauseAutoplayTemporarily() {
    setAutoplayPaused(
      true,
    );

    if (
      resumeTimerRef.current
    ) {
      clearTimeout(
        resumeTimerRef.current,
      );
    }

    resumeTimerRef.current =
      setTimeout(
        () => {
          setAutoplayPaused(
            false,
          );
        },
        4500,
      );
  }

  useEffect(
    () => {
      if (
        autoplayPaused ||
        cards.length <=
          1
      ) {
        return;
      }

      const interval =
        setInterval(
          () => {
            let nextIndex =
              autoIndexRef.current +
              autoDirectionRef.current;

            if (
              nextIndex >=
              cards.length
            ) {
              autoDirectionRef.current =
                -1;

              nextIndex =
                Math.max(
                  cards.length -
                    2,
                  0,
                );
            } else if (
              nextIndex <
              0
            ) {
              autoDirectionRef.current =
                1;

              nextIndex =
                Math.min(
                  1,
                  cards.length -
                    1,
                );
            }

            autoIndexRef.current =
              nextIndex;

            scrollToCard(
              nextIndex,
            );
          },
          3800,
        );

      return () => {
        clearInterval(
          interval,
        );
      };
    },
    [
      autoplayPaused,
      cards.length,
    ],
  );

  useEffect(
    () => {
      return () => {
        if (
          resumeTimerRef.current
        ) {
          clearTimeout(
            resumeTimerRef.current,
          );
        }
      };
    },
    [],
  );

  function handlePointerDown(
    event:
      React.PointerEvent<HTMLDivElement>,
  ) {
    const container =
      scrollerRef.current;

    if (
      !container
    ) {
      return;
    }

    draggingRef.current =
      true;

    dragStartXRef.current =
      event.clientX;

    dragStartScrollRef.current =
      container.scrollLeft;

    container.setPointerCapture(
      event.pointerId,
    );

    container.style.scrollSnapType =
      "none";

    pauseAutoplayTemporarily();
  }

  function handlePointerMove(
    event:
      React.PointerEvent<HTMLDivElement>,
  ) {
    const container =
      scrollerRef.current;

    if (
      !container ||
      !draggingRef.current
    ) {
      return;
    }

    const delta =
      event.clientX -
      dragStartXRef.current;

    container.scrollLeft =
      dragStartScrollRef.current -
      delta;
  }

  function finishPointerDrag(
    event:
      React.PointerEvent<HTMLDivElement>,
  ) {
    const container =
      scrollerRef.current;

    if (
      !container ||
      !draggingRef.current
    ) {
      return;
    }

    draggingRef.current =
      false;

    try {
      container.releasePointerCapture(
        event.pointerId,
      );
    } catch {
      // Pointer may already be released.
    }

    container.style.scrollSnapType =
      "";

    pauseAutoplayTemporarily();
  }

  if (
    cards.length ===
    0
  ) {
    return null;
  }

  return (
    <section
      id="portfolio"
      className="section-space scroll-mt-24 bg-surface-muted"
    >
      <div className="site-container">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="text-sm font-black text-brand-active">
              نمونه‌کارها
            </span>

            <h2 className="mt-4 text-3xl font-black leading-[1.5] text-ink sm:text-4xl">
              نمونه‌هایی از کارشناسی‌های انجام‌شده
            </h2>

            <p className="mt-4 text-sm leading-8 text-ink-secondary sm:text-base">
              کارت‌ها به‌صورت خودکار حرکت می‌کنند؛
              در عین حال می‌توانید با ماوس یا لمس،
              خودتان بین نمونه‌ها جابه‌جا شوید.
            </p>
          </div>

          <Link
            href="/portfolio"
            className="inline-flex h-11 w-fit items-center justify-center rounded-xl border border-line bg-surface px-5 text-sm font-black text-ink transition-colors hover:bg-surface-hover"
          >
            مشاهده همه نمونه‌کارها
          </Link>
        </div>

        <div
          ref={
            scrollerRef
          }
          dir="rtl"
          aria-label="اسلایدر نمونه‌کارهای کارشناسی خودرو"
          onPointerDown={
            handlePointerDown
          }
          onPointerMove={
            handlePointerMove
          }
          onPointerUp={
            finishPointerDrag
          }
          onPointerCancel={
            finishPointerDrag
          }
          onMouseEnter={() =>
            setAutoplayPaused(
              true,
            )
          }
          onMouseLeave={() =>
            setAutoplayPaused(
              false,
            )
          }
          onTouchStart={
            pauseAutoplayTemporarily
          }
          className="mt-10 flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden pb-5 select-none active:cursor-grabbing sm:gap-5 lg:mt-12"
          style={{
            scrollbarWidth:
              "thin",

            overscrollBehaviorX:
              "contain",

            touchAction:
              "pan-y",
          }}
        >
          {cards.map(
            (
              item,
            ) => (
              <article
                key={
                  item.id
                }
                className="flex min-h-[430px] w-[84vw] max-w-[360px] shrink-0 snap-start flex-col overflow-hidden rounded-[1.75rem] border border-line bg-surface shadow-card sm:w-[320px] lg:w-[340px]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      item.afterImageUrl
                    }
                    alt={
                      item.title
                    }
                    draggable={
                      false
                    }
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                  />

                  <span className="absolute right-3 top-3 rounded-full bg-surface px-3 py-1.5 text-[10px] font-black text-ink shadow-card">
                    {getCategoryLabel(
                      item.category,
                    )}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-ink-muted">
                    <CarFront
                      size={
                        15
                      }
                    />

                    <span className="truncate">
                      {
                        item.vehicle
                      }
                    </span>
                  </div>

                  <h3 className="mt-4 line-clamp-2 min-h-[56px] text-lg font-black leading-7 text-ink">
                    {
                      item.title
                    }
                  </h3>

                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-ink-secondary">
                    {
                      item.description
                    }
                  </p>
                </div>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
