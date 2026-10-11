"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  MouseEvent,
  PointerEvent,
} from "react";

import PortfolioCard from "@/components/portfolio/PortfolioCard";

import type {
  PortfolioItem,
} from "@/data/portfolio";

type Props = {
  items: PortfolioItem[];
};

const AUTO_PLAY_DELAY = 4500;

export default function PortfolioCarousel({
  items,
}: Props) {
  const containerRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const itemRefs =
    useRef<
      Array<HTMLDivElement | null>
    >([]);

  const isDraggingRef =
    useRef(false);

  const dragMovedRef =
    useRef(false);

  const dragStartXRef =
    useRef(0);

  const dragStartScrollRef =
    useRef(0);

  const resumeTimerRef =
    useRef<number | null>(
      null,
    );

  const mountedRef =
    useRef(false);

  const [activeIndex, setActiveIndex] =
    useState(0);

  const [isPaused, setIsPaused] =
    useState(false);

  const [isDragging, setIsDragging] =
    useState(false);

  const [isVisible, setIsVisible] =
    useState(false);

  /*
   * Component lifecycle.
   * مدیریت Mount و Unmount کامپوننت.
   */
  useEffect(() => {
    mountedRef.current =
      true;

    return () => {
      mountedRef.current =
        false;

      if (
        resumeTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          resumeTimerRef.current,
        );

        resumeTimerRef.current =
          null;
      }
    };
  }, []);

  /*
   * Detect carousel visibility.
   * تشخیص دیده شدن اسلایدر.
   */
  useEffect(() => {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (
            !mountedRef.current
          ) {
            return;
          }

          setIsVisible(
            entry.isIntersecting,
          );
        },
        {
          threshold: 0.15,
        },
      );

    observer.observe(
      container,
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  /*
   * Schedule autoplay resume.
   * زمان‌بندی ادامه حرکت خودکار.
   */
  const scheduleResume =
    useCallback(
      (delay: number) => {
        if (
          resumeTimerRef.current !==
          null
        ) {
          window.clearTimeout(
            resumeTimerRef.current,
          );
        }

        resumeTimerRef.current =
          window.setTimeout(
            () => {
              if (
                !mountedRef.current
              ) {
                return;
              }

              setIsPaused(false);

              resumeTimerRef.current =
                null;
            },
            delay,
          );
      },
      [],
    );

  /*
   * Scroll only inside carousel.
   * اسکرول فقط داخل خود اسلایدر.
   */
  const scrollToItem =
    useCallback(
      (
        index: number,
        behavior: ScrollBehavior =
          "smooth",
      ) => {
        const container =
          containerRef.current;

        const item =
          itemRefs.current[
            index
          ];

        if (
          !container ||
          !item ||
          items.length === 0
        ) {
          return;
        }

        const containerRect =
          container.getBoundingClientRect();

        const itemRect =
          item.getBoundingClientRect();

        const targetLeft =
          container.scrollLeft +
          itemRect.left -
          containerRect.left;

        container.scrollTo({
          left: targetLeft,
          behavior,
        });

        if (
          mountedRef.current
        ) {
          setActiveIndex(
            index,
          );
        }
      },
      [items.length],
    );

  const goNext =
    useCallback(() => {
      if (
        items.length <= 1
      ) {
        return;
      }

      const nextIndex =
        activeIndex >=
        items.length - 1
          ? 0
          : activeIndex + 1;

      scrollToItem(
        nextIndex,
      );
    }, [
      activeIndex,
      items.length,
      scrollToItem,
    ]);

  const goPrevious =
    useCallback(() => {
      if (
        items.length <= 1
      ) {
        return;
      }

      const previousIndex =
        activeIndex <= 0
          ? items.length - 1
          : activeIndex - 1;

      scrollToItem(
        previousIndex,
      );
    }, [
      activeIndex,
      items.length,
      scrollToItem,
    ]);

  /*
   * Autoplay.
   * حرکت خودکار.
   */
  useEffect(() => {
    if (
      !isVisible ||
      isPaused ||
      isDragging ||
      items.length <= 1
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          if (
            mountedRef.current
          ) {
            goNext();
          }
        },
        AUTO_PLAY_DELAY,
      );

    return () => {
      window.clearInterval(
        timer,
      );
    };
  }, [
    goNext,
    isVisible,
    isPaused,
    isDragging,
    items.length,
  ]);

  /*
   * Detect active card.
   * تشخیص کارت فعال.
   */
  const handleScroll =
    useCallback(() => {
      const container =
        containerRef.current;

      if (
        !container ||
        items.length === 0
      ) {
        return;
      }

      const containerRect =
        container.getBoundingClientRect();

      const containerCenter =
        containerRect.left +
        containerRect.width / 2;

      let closestIndex = 0;

      let closestDistance =
        Number.POSITIVE_INFINITY;

      itemRefs.current.forEach(
        (
          item,
          index,
        ) => {
          if (!item) {
            return;
          }

          const itemRect =
            item.getBoundingClientRect();

          const itemCenter =
            itemRect.left +
            itemRect.width / 2;

          const distance =
            Math.abs(
              itemCenter -
                containerCenter,
            );

          if (
            distance <
            closestDistance
          ) {
            closestDistance =
              distance;

            closestIndex =
              index;
          }
        },
      );

      if (
        mountedRef.current
      ) {
        setActiveIndex(
          closestIndex,
        );
      }
    }, [items.length]);

  /*
   * Detect interactive element.
   * تشخیص لینک یا دکمه داخل کارت.
   */
  function isInteractiveElement(
    target: EventTarget | null,
  ) {
    if (
      !(target instanceof Element)
    ) {
      return false;
    }

    return Boolean(
      target.closest(
        "a, button, input, textarea, select, label",
      ),
    );
  }

  /*
   * Start drag.
   * شروع Drag.
   */
  function handlePointerDown(
    event: PointerEvent<HTMLDivElement>,
  ) {
    if (
      isInteractiveElement(
        event.target,
      )
    ) {
      return;
    }

    if (
      event.pointerType !==
      "mouse"
    ) {
      if (
        mountedRef.current
      ) {
        setIsPaused(true);
      }

      return;
    }

    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    if (
      resumeTimerRef.current !==
      null
    ) {
      window.clearTimeout(
        resumeTimerRef.current,
      );

      resumeTimerRef.current =
        null;
    }

    isDraggingRef.current =
      true;

    dragMovedRef.current =
      false;

    dragStartXRef.current =
      event.clientX;

    dragStartScrollRef.current =
      container.scrollLeft;

    if (
      mountedRef.current
    ) {
      setIsDragging(true);
      setIsPaused(true);
    }

    container.setPointerCapture(
      event.pointerId,
    );
  }

  /*
   * Drag movement.
   * حرکت Drag.
   */
  function handlePointerMove(
    event: PointerEvent<HTMLDivElement>,
  ) {
    if (
      event.pointerType !==
        "mouse" ||
      !isDraggingRef.current
    ) {
      return;
    }

    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    const deltaX =
      event.clientX -
      dragStartXRef.current;

    if (
      Math.abs(
        deltaX,
      ) > 5
    ) {
      dragMovedRef.current =
        true;
    }

    container.scrollLeft =
      dragStartScrollRef.current -
      deltaX;
  }

  /*
   * Finish drag.
   * پایان Drag.
   */
  function handlePointerUp(
    event: PointerEvent<HTMLDivElement>,
  ) {
    if (
      event.pointerType !==
      "mouse"
    ) {
      scheduleResume(
        1000,
      );

      return;
    }

    const container =
      containerRef.current;

    isDraggingRef.current =
      false;

    if (
      mountedRef.current
    ) {
      setIsDragging(false);
    }

    scheduleResume(
      800,
    );

    if (
      container?.hasPointerCapture(
        event.pointerId,
      )
    ) {
      container.releasePointerCapture(
        event.pointerId,
      );
    }
  }

  /*
   * Prevent accidental click after drag.
   * جلوگیری از کلیک تصادفی بعد از Drag.
   */
  function handleClickCapture(
    event: MouseEvent<HTMLDivElement>,
  ) {
    if (
      !dragMovedRef.current
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    dragMovedRef.current =
      false;
  }

  if (
    items.length === 0
  ) {
    return (
      <div className="rounded-[1.75rem] border border-line bg-surface-muted px-5 py-10 text-center">
        <p className="font-black text-ink">
          هنوز نمونه‌کاری ثبت نشده است.
        </p>

        <p className="mt-2 text-sm leading-7 text-ink-muted">
          نمونه کارشناسی‌ها به‌زودی
          در این قسمت نمایش داده
          می‌شوند.
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        if (
          mountedRef.current
        ) {
          setIsPaused(true);
        }
      }}
      onMouseLeave={() => {
        if (
          mountedRef.current &&
          !isDraggingRef.current
        ) {
          setIsPaused(false);
        }
      }}
    >


      {/* Carousel / اسلایدر */}
      <div
        ref={containerRef}
        dir="ltr"
        onScroll={
          handleScroll
        }
        onPointerDown={
          handlePointerDown
        }
        onPointerMove={
          handlePointerMove
        }
        onPointerUp={
          handlePointerUp
        }
        onPointerCancel={
          handlePointerUp
        }
        onClickCapture={
          handleClickCapture
        }
        className={`
          flex
          gap-4
          overflow-x-auto
          overflow-y-hidden
          overscroll-x-contain
          pb-4
          select-none
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden

          sm:gap-5
          lg:gap-6

          ${
            isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
          }
        `}
      >
        {items.map(
          (
            item,
            index,
          ) => (
            <div
              key={item.id}
              dir="rtl"
              ref={(
                element,
              ) => {
                itemRefs.current[
                  index
                ] = element;
              }}
              className="
                min-w-0
                shrink-0
                basis-[88%]
                min-[430px]:basis-[78%]
                sm:basis-[48%]
                lg:basis-[32%]
              "
            >
              <PortfolioCard
                item={item}
              />
            </div>
          ),
        )}
      </div>

      {/* Indicators / نشانگرها */}
      {items.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {items.map(
            (
              item,
              index,
            ) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  scrollToItem(
                    index,
                  )
                }
                aria-label={`رفتن به نمونه‌کار ${
                  index + 1
                }`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex ===
                  index
                    ? "w-7 bg-brand"
                    : "w-2 bg-line-strong"
                }`}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}