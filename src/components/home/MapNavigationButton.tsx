"use client";

import {
  ExternalLink,
  MapPin,
  Navigation,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

type MapNavigationButtonProps = {
  googleMapsUrl?:
    string | null;

  baladMapUrl?:
    string | null;

  neshanMapUrl?:
    string | null;
};

type MapOption = {
  label:
    string;

  subtitle:
    string;

  href:
    string;
};

function cleanUrl(
  value:
    | string
    | null
    | undefined,
) {
  const url =
    value?.trim() ??
    "";

  return url ||
    null;
}

export default function MapNavigationButton({
  googleMapsUrl,
  baladMapUrl,
  neshanMapUrl,
}: MapNavigationButtonProps) {
  const [
    open,
    setOpen,
  ] =
    useState(
      false,
    );

  const options:
    MapOption[] =
    [];

  const google =
    cleanUrl(
      googleMapsUrl,
    );

  const balad =
    cleanUrl(
      baladMapUrl,
    );

  const neshan =
    cleanUrl(
      neshanMapUrl,
    );

  if (
    google
  ) {
    options.push({
      label:
        "Google Maps",

      subtitle:
        "باز کردن موقعیت در گوگل مپس",

      href:
        google,
    });
  }

  if (
    balad
  ) {
    options.push({
      label:
        "بلد",

      subtitle:
        "باز کردن موقعیت در مسیریاب بلد",

      href:
        balad,
    });
  }

  if (
    neshan
  ) {
    options.push({
      label:
        "نشان",

      subtitle:
        "باز کردن موقعیت در مسیریاب نشان",

      href:
        neshan,
    });
  }

  if (
    options.length ===
    0
  ) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setOpen(
            true,
          )
        }
        className="flex h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-6 text-sm font-black text-ink transition-colors hover:bg-surface-hover"
      >
        <Navigation
          size={
            18
          }
        />

        مسیریابی
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-overlay p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="map-navigation-title"
        >
          <button
            type="button"
            aria-label="بستن انتخاب مسیریاب"
            onClick={() =>
              setOpen(
                false,
              )
            }
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 w-full rounded-t-[1.5rem] border border-line bg-surface p-5 shadow-float sm:max-w-md sm:rounded-[1.5rem] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-active">
                  <MapPin
                    size={
                      20
                    }
                  />
                </div>

                <div>
                  <h2
                    id="map-navigation-title"
                    className="font-black text-ink"
                  >
                    انتخاب مسیریاب
                  </h2>

                  <p className="mt-1 text-xs leading-6 text-ink-muted">
                    موقعیت مجموعه را با برنامه موردنظر باز کنید.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setOpen(
                    false,
                  )
                }
                aria-label="بستن"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line text-ink transition-colors hover:bg-surface-hover"
              >
                <X
                  size={
                    17
                  }
                />
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {options.map(
                (
                  option,
                ) => (
                  <a
                    key={
                      option.label
                    }
                    href={
                      option.href
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      setOpen(
                        false,
                      )
                    }
                    className="flex min-h-16 items-center justify-between gap-4 rounded-xl border border-line bg-surface px-4 py-3 transition-colors hover:bg-surface-hover"
                  >
                    <div>
                      <p className="text-sm font-black text-ink">
                        {
                          option.label
                        }
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-ink-muted">
                        {
                          option.subtitle
                        }
                      </p>
                    </div>

                    <ExternalLink
                      size={
                        17
                      }
                      className="shrink-0 text-brand-active"
                    />
                  </a>
                ),
              )}
            </div>

            <p className="mt-4 text-[11px] leading-6 text-ink-muted">
              در موبایل، اگر برنامه مربوط نصب باشد، لینک اشتراک‌گذاری همان مسیریاب معمولاً داخل اپ باز می‌شود؛ در غیر این صورت نسخه وب نمایش داده می‌شود.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
