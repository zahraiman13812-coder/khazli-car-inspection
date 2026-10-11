"use client";

import {
  CheckCircle2,
  Lightbulb,
  Loader2,
  MessageSquareText,
  Phone,
  Send,
  TriangleAlert,
  UserRound,
} from "lucide-react";

import {
  useState,
} from "react";

import type {
  FormEvent,
  ReactNode,
} from "react";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type FeedbackType =
  | "feedback"
  | "suggestion"
  | "complaint";

type FeedbackForm = {
  fullName: string;

  phone: string;

  type: FeedbackType;

  message: string;
};

type FeedbackResponse = {
  ok: boolean;

  message?: string;
};

/*
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

const initialForm:
  FeedbackForm = {
    fullName:
      "",

    phone:
      "",

    type:
      "feedback",

    message:
      "",
  };

const feedbackTypes = [
  {
    id:
      "feedback" as const,

    title:
      "پیام عمومی",

    description:
      "نظر یا تجربه‌ای که می‌خواهید با ما در میان بگذارید.",

    icon:
      MessageSquareText,
  },

  {
    id:
      "suggestion" as const,

    title:
      "پیشنهاد",

    description:
      "ایده یا پیشنهادی برای بهتر شدن خدمات.",

    icon:
      Lightbulb,
  },

  {
    id:
      "complaint" as const,

    title:
      "انتقاد",

    description:
      "موضوعی که نیاز به بررسی و پیگیری دارد.",

    icon:
      TriangleAlert,
  },
];

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function normalizeDigits(
  value: string,
) {
  const persianDigits =
    "۰۱۲۳۴۵۶۷۸۹";

  const arabicDigits =
    "٠١٢٣٤٥٦٧٨٩";

  return value
    .replace(
      /[۰-۹]/g,
      (digit) =>
        String(
          persianDigits.indexOf(
            digit,
          ),
        ),
    )
    .replace(
      /[٠-٩]/g,
      (digit) =>
        String(
          arabicDigits.indexOf(
            digit,
          ),
        ),
    );
}

function sanitizePhone(
  value: string,
) {
  return normalizeDigits(
    value,
  )
    .replace(
      /\D/g,
      "",
    )
    .slice(
      0,
      11,
    );
}

function sanitizeFullName(
  value: string,
) {
  return value
    .replace(
      /[^\p{L}\s\u200C]/gu,
      "",
    )
    .slice(
      0,
      100,
    );
}

function toPersianDigits(
  value: string,
) {
  const digits =
    "۰۱۲۳۴۵۶۷۸۹";

  return value.replace(
    /\d/g,
    (digit) =>
      digits[
        Number(
          digit,
        )
      ],
  );
}

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function Feedback() {
  const [
    form,
    setForm,
  ] =
    useState<FeedbackForm>({
      ...initialForm,
    });

  const [
    submitting,
    setSubmitting,
  ] =
    useState(
      false,
    );

  const [
    error,
    setError,
  ] =
    useState(
      "",
    );

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState(
      "",
    );

  /*
   * ==========================================================
   * UPDATE FIELD
   * ==========================================================
   */

  function updateField<
    Key extends keyof FeedbackForm,
  >(
    field:
      Key,

    value:
      FeedbackForm[Key],
  ) {
    setForm(
      (
        current,
      ) => ({
        ...current,

        [field]:
          value,
      }),
    );

    setError(
      "",
    );

    setSuccessMessage(
      "",
    );
  }

  /*
   * ==========================================================
   * SUBMIT
   * ==========================================================
   */

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      submitting
    ) {
      return;
    }

    setError(
      "",
    );

    setSuccessMessage(
      "",
    );

    const fullName =
      form.fullName.trim();

    const phone =
      sanitizePhone(
        form.phone,
      );

    const message =
      form.message.trim();

    /*
     * Name is optional,
     * but if entered it should be valid.
     */
    if (
      fullName &&
      fullName.length <
        2
    ) {
      setError(
        "نام واردشده معتبر نیست.",
      );

      return;
    }

    /*
     * Phone is optional,
     * but if entered it must be valid.
     */
    if (
      phone &&
      !/^09\d{9}$/.test(
        phone,
      )
    ) {
      setError(
        "شماره موبایل باید ۱۱ رقم باشد و با 09 شروع شود.",
      );

      return;
    }

    if (
      message.length <
      5
    ) {
      setError(
        "لطفاً توضیح بیشتری درباره پیام خود بنویسید.",
      );

      return;
    }

    if (
      message.length >
      2000
    ) {
      setError(
        "متن پیام نباید بیشتر از ۲۰۰۰ کاراکتر باشد.",
      );

      return;
    }

    setSubmitting(
      true,
    );

    try {
      const response =
        await fetch(
          "/api/feedback",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                fullName:
                  fullName ||
                  undefined,

                phone:
                  phone ||
                  undefined,

                type:
                  form.type,

                message,
              }),
          },
        );

      const data =
        (await response.json()) as FeedbackResponse;

      if (
        !response.ok ||
        !data.ok
      ) {
        setError(
          data.message ??
            "ثبت پیام انجام نشد. دوباره تلاش کنید.",
        );

        return;
      }

      setSuccessMessage(
        data.message ??
          "پیام شما با موفقیت ثبت شد.",
      );

      /*
       * Clear form after successful submission.
       */
      setForm({
        ...initialForm,
      });
    } catch (
      requestError
    ) {
      console.error(
        "FEEDBACK_SUBMIT_ERROR",
        requestError,
      );

      setError(
        "ارتباط با سرور برقرار نشد. دوباره تلاش کنید.",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  const messageLength =
    form.message.length;

  return (
    <section
      id="feedback"
      className="section-space scroll-mt-24 bg-page"
    >
      <div className="site-container">
        <div className="grid items-start gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-12">
          {/* Intro */}
          <div className="lg:sticky lg:top-28">
            <span className="text-sm font-black text-brand-active">
              پیشنهادات و انتقادات
            </span>

            <h2 className="mt-4 text-3xl font-black leading-[1.45] text-ink sm:text-4xl">
              نظرتون برای ما مهمه.
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-8 text-ink-secondary sm:text-base">
              اگر پیشنهادی برای بهتر شدن
              خدمات دارید یا موضوعی وجود
              دارد که باید بررسی کنیم،
              مستقیماً از همین بخش برای ما
              ارسال کنید.
            </p>

            <div className="mt-7 space-y-3">
              <InfoCard
                icon={
                  <MessageSquareText
                    size={
                      20
                    }
                  />
                }
                title="پیام مستقیم"
                description="پیام شما مستقیماً در پنل مدیریت ثبت می‌شود."
              />

              <InfoCard
                icon={
                  <Lightbulb
                    size={
                      20
                    }
                  />
                }
                title="کمک به بهتر شدن خدمات"
                description="پیشنهادهای شما برای بهبود تجربه کارشناسی بررسی می‌شوند."
              />

              <InfoCard
                icon={
                  <TriangleAlert
                    size={
                      20
                    }
                  />
                }
                title="بررسی انتقادات"
                description="اگر مشکلی وجود داشته باشد، پیام برای پیگیری مدیر ثبت می‌شود."
              />
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={
              handleSubmit
            }
            noValidate
            className="min-w-0 rounded-[1.75rem] border border-line bg-surface p-5 shadow-card sm:p-7 lg:p-8"
          >
            <div>
              <h3 className="text-xl font-black text-ink sm:text-2xl">
                ارسال پیام
              </h3>

              <p className="mt-2 text-sm leading-7 text-ink-secondary">
                نوع پیام را انتخاب کنید و
                توضیحات خود را بنویسید.
              </p>
            </div>

            {/* Type */}
            <div className="mt-7">
              <p className="mb-3 text-xs font-black text-ink-secondary">
                نوع پیام
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                {feedbackTypes.map(
                  (
                    item,
                  ) => {
                    const Icon =
                      item.icon;

                    const selected =
                      form.type ===
                      item.id;

                    return (
                      <button
                        key={
                          item.id
                        }
                        type="button"
                        onClick={() =>
                          updateField(
                            "type",
                            item.id,
                          )
                        }
                        className={`relative rounded-2xl border p-4 text-right transition-all ${
                          selected
                            ? "border-brand bg-brand-soft"
                            : "border-line bg-surface hover:border-brand-border hover:bg-surface-warm"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              selected
                                ? "bg-brand text-on-brand"
                                : "bg-surface-muted text-ink-secondary"
                            }`}
                          >
                            <Icon
                              size={
                                19
                              }
                            />
                          </div>

                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              selected
                                ? "border-brand bg-brand text-on-brand"
                                : "border-line-strong"
                            }`}
                          >
                            {selected && (
                              <CheckCircle2
                                size={
                                  13
                                }
                              />
                            )}
                          </div>
                        </div>

                        <p className="mt-4 text-sm font-black text-ink">
                          {
                            item.title
                          }
                        </p>

                        <p className="mt-1 text-xs leading-6 text-ink-muted">
                          {
                            item.description
                          }
                        </p>
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            {/* Identity */}
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {/* Name */}
              <label className="block min-w-0">
                <span className="mb-2 block text-xs font-bold text-ink-secondary">
                  نام و نام خانوادگی
                  <span className="mr-1 font-normal text-ink-muted">
                    اختیاری
                  </span>
                </span>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-center">
                    <UserRound
                      size={
                        19
                      }
                      className="text-ink-muted"
                    />
                  </div>

                  <input
                    type="text"
                    autoComplete="name"
                    value={
                      form.fullName
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "fullName",
                        sanitizeFullName(
                          event
                            .target
                            .value,
                        ),
                      )
                    }
                    placeholder="مثلاً علی رضایی"
                    className="h-12 w-full min-w-0 rounded-xl border border-line bg-input pr-12 pl-4 text-base text-ink outline-none transition-colors placeholder:text-placeholder hover:bg-input-hover focus:border-focus focus:ring-4 focus:ring-brand-soft"
                  />
                </div>
              </label>

              {/* Phone */}
              <label className="block min-w-0">
                <span className="mb-2 block text-xs font-bold text-ink-secondary">
                  شماره موبایل
                  <span className="mr-1 font-normal text-ink-muted">
                    اختیاری
                  </span>
                </span>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-center">
                    <Phone
                      size={
                        19
                      }
                      className="text-ink-muted"
                    />
                  </div>

                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    dir="ltr"
                    maxLength={
                      11
                    }
                    value={
                      form.phone
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "phone",
                        sanitizePhone(
                          event
                            .target
                            .value,
                        ),
                      )
                    }
                    placeholder="09123456789"
                    className="h-12 w-full min-w-0 rounded-xl border border-line bg-input pr-12 pl-4 text-left text-base text-ink outline-none transition-colors placeholder:text-placeholder hover:bg-input-hover focus:border-focus focus:ring-4 focus:ring-brand-soft"
                  />
                </div>
              </label>
            </div>

            {/* Message */}
            <label className="mt-5 block">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-ink-secondary">
                  متن پیام
                  <span className="mr-1 text-danger">
                    *
                  </span>
                </span>

                <span className="text-[10px] font-bold text-ink-muted">
                  {toPersianDigits(
                    String(
                      messageLength,
                    ),
                  )}
                  {" / "}
                  ۲۰۰۰
                </span>
              </div>

              <textarea
                rows={
                  7
                }
                maxLength={
                  2000
                }
                value={
                  form.message
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "message",
                    event
                      .target
                      .value,
                  )
                }
                placeholder="پیام، پیشنهاد یا انتقاد خود را اینجا بنویسید..."
                className="w-full min-w-0 resize-none rounded-2xl border border-line bg-input px-4 py-4 text-base leading-8 text-ink outline-none transition-colors placeholder:text-placeholder hover:bg-input-hover focus:border-focus focus:ring-4 focus:ring-brand-soft"
              />
            </label>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-3 rounded-xl border border-danger bg-danger-soft p-4"
              >
                <TriangleAlert
                  size={
                    19
                  }
                  className="mt-0.5 shrink-0 text-danger"
                />

                <p className="text-sm font-bold leading-7 text-ink-secondary">
                  {
                    error
                  }
                </p>
              </div>
            )}

            {/* Success */}
            {successMessage && (
              <div
                role="status"
                className="mt-5 flex items-start gap-3 rounded-xl border border-success bg-success-soft p-4"
              >
                <CheckCircle2
                  size={
                    19
                  }
                  className="mt-0.5 shrink-0 text-success"
                />

                <div>
                  <p className="text-sm font-black text-success">
                    پیام ثبت شد
                  </p>

                  <p className="mt-1 text-sm leading-7 text-ink-secondary">
                    {
                      successMessage
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={
                submitting
              }
              className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-black text-on-brand transition-colors hover:bg-brand-hover active:bg-brand-active disabled:cursor-wait disabled:opacity-60 sm:text-base"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={
                      19
                    }
                    className="animate-spin"
                  />

                  در حال ارسال...
                </>
              ) : (
                <>
                  <Send
                    size={
                      18
                    }
                  />

                  ارسال پیام
                </>
              )}
            </button>

            <p className="mt-4 text-center text-[11px] leading-6 text-ink-muted">
              وارد کردن نام و شماره موبایل
              الزامی نیست؛ اما اگر نیاز به
              پیگیری پاسخ دارید، شماره خود
              را وارد کنید.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

/*
 * ============================================================
 * INFO CARD
 * ============================================================
 */

function InfoCard({
  icon,
  title,
  description,
}: {
  icon:
    ReactNode;

  title:
    string;

  description:
    string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-active">
        {
          icon
        }
      </div>

      <div className="min-w-0">
        <p className="text-sm font-black text-ink">
          {
            title
          }
        </p>

        <p className="mt-1 text-xs leading-6 text-ink-muted">
          {
            description
          }
        </p>
      </div>
    </div>
  );
}