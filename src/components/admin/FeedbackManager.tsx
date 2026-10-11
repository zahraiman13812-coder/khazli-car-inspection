"use client";

import {
  Archive,
  Check,
  Inbox,
  Loader2,
  Lock,
  MessageSquareText,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  TriangleAlert,
  UserRound,
  X,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useRef,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

type FeedbackItem = {
  id: string;

  fullName:
    | string
    | null;

  phone:
    | string
    | null;

  type: string;

  message: string;

  status: string;

  createdAt: string;

  updatedAt: string;
};

type FeedbackResponse = {
  ok: boolean;

  message?:
    string;

  items?:
    FeedbackItem[];

  total?:
    number;
};

type StatusResponse = {
  ok: boolean;

  message?:
    string;

  item?:
    FeedbackItem;
};

type DeleteResponse = {
  ok: boolean;

  message?:
    string;

  code?:
    string;

  remainingAttempts?:
    number;

  retryAfterSeconds?:
    number;
};

type LoadOptions = {
  query:
    string;

  selectedStatus:
    string;

  selectedType:
    string;

  refresh?:
    boolean;
};

function getTypeLabel(
  type: string,
) {
  switch (
    type
  ) {
    case "suggestion":
      return "پیشنهاد";

    case "complaint":
      return "انتقاد";

    default:
      return "پیام عمومی";
  }
}

function getStatusLabel(
  status: string,
) {
  switch (
    status
  ) {
    case "new":
      return "جدید";

    case "read":
      return "خوانده شده";

    case "archived":
      return "بایگانی";

    default:
      return status;
  }
}

function getStatusClass(
  status: string,
) {
  switch (
    status
  ) {
    case "new":
      return "bg-warning-soft text-warning";

    case "read":
      return "bg-success-soft text-success";

    case "archived":
      return "bg-surface-muted text-ink-muted";

    default:
      return "bg-surface-muted text-ink-muted";
  }
}

function formatCreatedAt(
  value: string,
) {
  const date =
    new Date(
      value,
    );

  return new Intl.DateTimeFormat(
    "fa-IR-u-ca-persian",
    {
      year:
        "numeric",

      month:
        "long",

      day:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",

      timeZone:
        "Asia/Tehran",
    },
  ).format(
    date,
  );
}

async function readJsonResponse<T>(
  response: Response,
) {
  const raw =
    await response.text();

  try {
    return JSON.parse(
      raw,
    ) as T;
  } catch {
    throw new Error(
      `پاسخ نامعتبر از سرور دریافت شد. HTTP ${response.status}`,
    );
  }
}

export default function FeedbackManager({
  initialItems,
  initialTotal,
}: {
  initialItems:
    FeedbackItem[];

  initialTotal:
    number;
}) {
  const router =
    useRouter();

  const [
    items,
    setItems,
  ] =
    useState(
      initialItems,
    );

  const [
    total,
    setTotal,
  ] =
    useState(
      initialTotal,
    );

  const [
    search,
    setSearch,
  ] =
    useState(
      "",
    );

  const [
    status,
    setStatus,
  ] =
    useState(
      "",
    );

  const [
    type,
    setType,
  ] =
    useState(
      "",
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      false,
    );

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(
      false,
    );

  const [
    updatingId,
    setUpdatingId,
  ] =
    useState(
      "",
    );

  const [
    error,
    setError,
  ] =
    useState(
      "",
    );

  const [
    success,
    setSuccess,
  ] =
    useState(
      "",
    );

  const [
    deleteTarget,
    setDeleteTarget,
  ] =
    useState<
      FeedbackItem | null
    >(
      null,
    );

  const [
    deletePin,
    setDeletePin,
  ] =
    useState(
      "",
    );

  const [
    deleting,
    setDeleting,
  ] =
    useState(
      false,
    );

  const controllerRef =
    useRef<
      AbortController | null
    >(
      null,
    );

  function redirectToLogin() {
    router.replace(
      "/admin/login",
    );

    router.refresh();
  }

  async function loadItems({
    query,
    selectedStatus,
    selectedType,
    refresh =
      false,
  }: LoadOptions) {
    controllerRef.current?.abort();

    const controller =
      new AbortController();

    controllerRef.current =
      controller;

    if (
      refresh
    ) {
      setRefreshing(
        true,
      );
    } else {
      setLoading(
        true,
      );
    }

    setError(
      "",
    );

    setSuccess(
      "",
    );

    try {
      const params =
        new URLSearchParams();

      if (
        query.trim()
      ) {
        params.set(
          "q",
          query.trim(),
        );
      }

      if (
        selectedStatus
      ) {
        params.set(
          "status",
          selectedStatus,
        );
      }

      if (
        selectedType
      ) {
        params.set(
          "type",
          selectedType,
        );
      }

      const queryString =
        params.toString();

      const response =
        await fetch(
          queryString
            ? `/api/admin/feedback?${queryString}`
            : "/api/admin/feedback",
          {
            method:
              "GET",

            cache:
              "no-store",

            signal:
              controller.signal,
          },
        );

      if (
        response.status ===
        401
      ) {
        redirectToLogin();

        return;
      }

      const data =
        await readJsonResponse<FeedbackResponse>(
          response,
        );

      if (
        controller.signal.aborted
      ) {
        return;
      }

      if (
        !response.ok ||
        !data.ok
      ) {
        setError(
          data.message ??
            "دریافت پیام‌ها انجام نشد.",
        );

        return;
      }

      setItems(
        Array.isArray(
          data.items,
        )
          ? data.items
          : [],
      );

      setTotal(
        data.total ??
          0,
      );
    } catch (
      requestError
    ) {
      if (
        controller.signal.aborted
      ) {
        return;
      }

      console.error(
        "LOAD_FEEDBACK_ERROR",
        requestError,
      );

      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "ارتباط با سرور برقرار نشد.",
      );
    } finally {
      if (
        !controller.signal.aborted
      ) {
        setLoading(
          false,
        );

        setRefreshing(
          false,
        );
      }
    }
  }

  function reloadCurrent(
    refresh =
      false,
  ) {
    void loadItems({
      query:
        search,

      selectedStatus:
        status,

      selectedType:
        type,

      refresh,
    });
  }

  function submitFilters(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    reloadCurrent();
  }

  function changeStatusFilter(
    nextStatus:
      string,
  ) {
    setStatus(
      nextStatus,
    );

    void loadItems({
      query:
        search,

      selectedStatus:
        nextStatus,

      selectedType:
        type,
    });
  }

  function changeTypeFilter(
    nextType:
      string,
  ) {
    setType(
      nextType,
    );

    void loadItems({
      query:
        search,

      selectedStatus:
        status,

      selectedType:
        nextType,
    });
  }

  function resetFilters() {
    setSearch(
      "",
    );

    setStatus(
      "",
    );

    setType(
      "",
    );

    void loadItems({
      query:
        "",

      selectedStatus:
        "",

      selectedType:
        "",
    });
  }

  async function updateStatus(
    item:
      FeedbackItem,

    nextStatus:
      | "new"
      | "read"
      | "archived",
  ) {
    if (
      updatingId ||
      deleting
    ) {
      return;
    }

    setUpdatingId(
      item.id,
    );

    setError(
      "",
    );

    setSuccess(
      "",
    );

    try {
      const response =
        await fetch(
          `/api/admin/feedback/${encodeURIComponent(
            item.id,
          )}/status`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                status:
                  nextStatus,
              }),
          },
        );

      if (
        response.status ===
        401
      ) {
        redirectToLogin();

        return;
      }

      const data =
        await readJsonResponse<StatusResponse>(
          response,
        );

      if (
        !response.ok ||
        !data.ok ||
        !data.item
      ) {
        setError(
          data.message ??
            "تغییر وضعیت انجام نشد.",
        );

        return;
      }

      await loadItems({
        query:
          search,

        selectedStatus:
          status,

        selectedType:
          type,
      });

      setSuccess(
        "وضعیت پیام بروزرسانی شد.",
      );
    } catch (
      requestError
    ) {
      console.error(
        "UPDATE_FEEDBACK_ERROR",
        requestError,
      );

      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "ارتباط با سرور برقرار نشد.",
      );
    } finally {
      setUpdatingId(
        "",
      );
    }
  }

  function openDeleteModal(
    item:
      FeedbackItem,
  ) {
    setDeleteTarget(
      item,
    );

    setDeletePin(
      "",
    );

    setError(
      "",
    );

    setSuccess(
      "",
    );
  }

  function closeDeleteModal() {
    if (
      deleting
    ) {
      return;
    }

    setDeleteTarget(
      null,
    );

    setDeletePin(
      "",
    );
  }

  async function confirmDelete(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !deleteTarget ||
      deleting
    ) {
      return;
    }

    if (
      !/^\d{4}$/.test(
        deletePin,
      )
    ) {
      setError(
        "کد حذف باید دقیقاً ۴ رقم باشد.",
      );

      return;
    }

    setDeleting(
      true,
    );

    setError(
      "",
    );

    setSuccess(
      "",
    );

    try {
      const response =
        await fetch(
          `/api/admin/feedback/${encodeURIComponent(
            deleteTarget.id,
          )}/delete`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                pin:
                  deletePin,
              }),
          },
        );

      if (
        response.status ===
        401
      ) {
        redirectToLogin();

        return;
      }

      const data =
        await readJsonResponse<DeleteResponse>(
          response,
        );

      if (
        !response.ok ||
        !data.ok
      ) {
        let message =
          data.message ??
          "حذف پیام انجام نشد.";

        if (
          typeof data.remainingAttempts ===
          "number" &&
          data.remainingAttempts >
            0
        ) {
          message =
            `${message} ${new Intl.NumberFormat(
              "fa-IR",
            ).format(
              data.remainingAttempts,
            )} تلاش باقی مانده است.`;
        }

        setError(
          message,
        );

        return;
      }

      setDeleteTarget(
        null,
      );

      setDeletePin(
        "",
      );

      await loadItems({
        query:
          search,

        selectedStatus:
          status,

        selectedType:
          type,
      });

      setSuccess(
        "پیام برای همیشه حذف شد.",
      );
    } catch (
      requestError
    ) {
      console.error(
        "DELETE_FEEDBACK_ERROR",
        requestError,
      );

      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "ارتباط با سرور برقرار نشد.",
      );
    } finally {
      setDeleting(
        false,
      );
    }
  }

  const hasFilters =
    Boolean(
      search.trim() ||
        status ||
        type,
    );

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="text-sm font-black text-brand-active">
            ارتباط با مشتریان
          </span>

          <h1 className="mt-2 text-3xl font-black text-ink">
            پیشنهادات و انتقادات
          </h1>

          <p className="mt-2 text-sm leading-7 text-ink-secondary">
            پیام‌های ارسال‌شده از سایت را مشاهده، فیلتر و مدیریت کنید.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-line bg-surface px-4 py-2.5">
            <p className="text-[10px] font-bold text-ink-muted">
              تعداد نتایج
            </p>

            <p className="mt-0.5 text-sm font-black text-ink">
              {new Intl.NumberFormat(
                "fa-IR",
              ).format(
                total,
              )}
            </p>
          </div>

          <button
            type="button"
            disabled={
              refreshing ||
              loading
            }
            onClick={() =>
              reloadCurrent(
                true,
              )
            }
            className="flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-black text-ink transition-colors hover:bg-surface-hover disabled:opacity-50"
          >
            <RefreshCw
              size={
                17
              }
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            بروزرسانی
          </button>
        </div>
      </div>

      <form
        onSubmit={
          submitFilters
        }
        className="mt-7 rounded-[1.5rem] border border-line bg-surface p-4 shadow-card"
      >
        <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(280px,1.4fr)_minmax(180px,0.7fr)_minmax(180px,0.7fr)_minmax(130px,0.5fr)_minmax(130px,0.5fr)]">
          <div className="relative min-w-0">
            <div className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-center">
              <Search
                size={
                  18
                }
                className="text-ink-muted"
              />
            </div>

            <input
              type="search"
              value={
                search
              }
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="نام، شماره یا متن پیام"
              className="h-11 w-full min-w-0 rounded-xl border border-line bg-input pr-12 pl-4 text-sm text-ink outline-none placeholder:text-placeholder focus:border-focus focus:ring-4 focus:ring-brand-soft"
            />
          </div>

          <select
            value={
              status
            }
            onChange={(
              event,
            ) =>
              changeStatusFilter(
                event.target.value,
              )
            }
            className="h-11 rounded-xl border border-line bg-input px-4 text-sm font-bold text-ink outline-none focus:border-focus"
          >
            <option value="">
              همه وضعیت‌ها
            </option>

            <option value="new">
              جدید
            </option>

            <option value="read">
              خوانده شده
            </option>

            <option value="archived">
              بایگانی
            </option>
          </select>

          <select
            value={
              type
            }
            onChange={(
              event,
            ) =>
              changeTypeFilter(
                event.target.value,
              )
            }
            className="h-11 rounded-xl border border-line bg-input px-4 text-sm font-bold text-ink outline-none focus:border-focus"
          >
            <option value="">
              همه انواع
            </option>

            <option value="feedback">
              پیام عمومی
            </option>

            <option value="suggestion">
              پیشنهاد
            </option>

            <option value="complaint">
              انتقاد
            </option>
          </select>

          <button
            type="submit"
            disabled={
              loading
            }
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-black text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-50"
          >
            {loading ? (
              <Loader2
                size={
                  16
                }
                className="animate-spin"
              />
            ) : (
              <Search
                size={
                  16
                }
              />
            )}

            جستجو
          </button>

          <button
            type="button"
            disabled={
              loading ||
              !hasFilters
            }
            onClick={
              resetFilters
            }
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-black text-ink transition-colors hover:bg-surface-hover disabled:opacity-40"
          >
            <X
              size={
                16
              }
            />

            پاک کردن
          </button>
        </div>

        <p className="mt-3 text-xs leading-6 text-ink-muted">
          فیلتر نوع و وضعیت بلافاصله اعمال می‌شوند. برای جستجوی متنی Enter بزنید یا دکمه «جستجو» را انتخاب کنید.
        </p>
      </form>

      {error && (
        <div className="mt-5 flex gap-3 rounded-xl border border-danger bg-danger-soft p-4">
          <TriangleAlert
            size={
              19
            }
            className="shrink-0 text-danger"
          />

          <p className="text-sm font-bold leading-7 text-danger">
            {
              error
            }
          </p>
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-xl border border-success bg-success-soft p-4 text-sm font-bold text-success">
          {
            success
          }
        </div>
      )}

      {loading ? (
        <div className="mt-7 flex min-h-48 items-center justify-center rounded-2xl border border-line bg-surface">
          <Loader2
            size={
              28
            }
            className="animate-spin text-brand-active"
          />
        </div>
      ) : items.length ===
        0 ? (
        <div className="mt-7 rounded-2xl border border-line bg-surface p-10 text-center">
          <Inbox
            size={
              32
            }
            className="mx-auto text-ink-muted"
          />

          <p className="mt-4 font-black text-ink">
            پیامی پیدا نشد
          </p>

          <p className="mt-2 text-sm leading-7 text-ink-muted">
            فیلترها را تغییر دهید یا پاک کنید.
          </p>
        </div>
      ) : (
        <div className="mt-7 grid gap-4 xl:grid-cols-2">
          {items.map(
            (
              item,
            ) => (
              <article
                key={
                  item.id
                }
                className="rounded-[1.5rem] border border-line bg-surface p-5 shadow-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black ${getStatusClass(
                          item.status,
                        )}`}
                      >
                        {getStatusLabel(
                          item.status,
                        )}
                      </span>

                      <span className="rounded-full bg-brand-soft px-3 py-1 text-[10px] font-black text-brand-active">
                        {getTypeLabel(
                          item.type,
                        )}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-ink-muted">
                      {formatCreatedAt(
                        item.createdAt,
                      )}
                    </p>
                  </div>

                  <MessageSquareText
                    size={
                      22
                    }
                    className="text-brand-active"
                  />
                </div>

                <p className="mt-5 whitespace-pre-wrap text-sm font-bold leading-8 text-ink">
                  {
                    item.message
                  }
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl bg-surface-muted p-3">
                    <UserRound
                      size={
                        17
                      }
                      className="text-brand-active"
                    />

                    <span className="text-xs font-bold text-ink">
                      {item.fullName ||
                        "بدون نام"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-surface-muted p-3">
                    <Phone
                      size={
                        17
                      }
                      className="text-brand-active"
                    />

                    <span
                      dir="ltr"
                      className="text-xs font-bold text-ink"
                    >
                      {item.phone ||
                        "ثبت نشده"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                  {item.status !==
                    "read" && (
                    <button
                      type="button"
                      disabled={
                        Boolean(
                          updatingId,
                        ) ||
                        deleting
                      }
                      onClick={() =>
                        void updateStatus(
                          item,
                          "read",
                        )
                      }
                      className="flex h-10 items-center gap-2 rounded-xl bg-success-soft px-4 text-xs font-black text-success disabled:opacity-50"
                    >
                      {updatingId ===
                      item.id ? (
                        <Loader2
                          size={
                            15
                          }
                          className="animate-spin"
                        />
                      ) : (
                        <Check
                          size={
                            15
                          }
                        />
                      )}

                      خوانده شد
                    </button>
                  )}

                  {item.status !==
                    "archived" && (
                    <button
                      type="button"
                      disabled={
                        Boolean(
                          updatingId,
                        ) ||
                        deleting
                      }
                      onClick={() =>
                        void updateStatus(
                          item,
                          "archived",
                        )
                      }
                      className="flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-xs font-black text-ink transition-colors hover:bg-surface-hover disabled:opacity-50"
                    >
                      <Archive
                        size={
                          15
                        }
                      />

                      بایگانی
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={
                      Boolean(
                        updatingId,
                      ) ||
                      deleting
                    }
                    onClick={() =>
                      openDeleteModal(
                        item,
                      )
                    }
                    className="flex h-10 items-center gap-2 rounded-xl border border-danger bg-danger-soft px-4 text-xs font-black text-danger transition-opacity hover:opacity-80 disabled:opacity-50"
                  >
                    <Trash2
                      size={
                        15
                      }
                    />

                    حذف دائمی
                  </button>
                </div>
              </article>
            ),
          )}
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-feedback-title"
        >
          <form
            onSubmit={
              confirmDelete
            }
            className="w-full max-w-md rounded-[1.5rem] border border-line bg-surface p-5 shadow-float sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger-soft text-danger">
                  <Trash2
                    size={
                      20
                    }
                  />
                </div>

                <div>
                  <h2
                    id="delete-feedback-title"
                    className="font-black text-ink"
                  >
                    حذف دائمی پیام
                  </h2>

                  <p className="mt-1 text-xs leading-6 text-ink-muted">
                    این عملیات قابل بازگشت نیست.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={
                  deleting
                }
                onClick={
                  closeDeleteModal
                }
                aria-label="بستن"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-ink transition-colors hover:bg-surface-hover disabled:opacity-50"
              >
                <X
                  size={
                    17
                  }
                />
              </button>
            </div>

            <div className="mt-5 rounded-xl bg-surface-muted p-4">
              <p className="text-xs font-black text-ink">
                پیام انتخاب‌شده
              </p>

              <p className="mt-2 line-clamp-3 text-xs leading-6 text-ink-secondary">
                {
                  deleteTarget.message
                }
              </p>
            </div>

            <label className="mt-5 block">
              <span className="flex items-center gap-2 text-xs font-black text-ink">
                <Lock
                  size={
                    15
                  }
                />

                کد ۴ رقمی حذف
              </span>

              <input
                autoFocus
                type="password"
                inputMode="numeric"
                autoComplete="off"
                maxLength={
                  4
                }
                pattern="[0-9]{4}"
                value={
                  deletePin
                }
                onChange={(
                  event,
                ) => {
                  const next =
                    event.target.value
                      .replace(
                        /\D/g,
                        "",
                      )
                      .slice(
                        0,
                        4,
                      );

                  setDeletePin(
                    next,
                  );
                }}
                placeholder="••••"
                className="mt-2 h-12 w-full rounded-xl border border-line bg-input px-4 text-center text-lg font-black tracking-[0.5em] text-ink outline-none placeholder:text-placeholder focus:border-focus focus:ring-4 focus:ring-brand-soft"
              />
            </label>

            <p className="mt-2 text-[11px] leading-6 text-ink-muted">
              همان کد حذف ۴ رقمی بخش امنیت و حذف نوبت‌ها استفاده می‌شود.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={
                  deleting
                }
                onClick={
                  closeDeleteModal
                }
                className="h-11 rounded-xl border border-line bg-surface text-sm font-black text-ink transition-colors hover:bg-surface-hover disabled:opacity-50"
              >
                انصراف
              </button>

              <button
                type="submit"
                disabled={
                  deleting ||
                  deletePin.length !==
                    4
                }
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-danger px-4 text-sm font-black text-on-brand disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2
                    size={
                      16
                    }
                    className="animate-spin"
                  />
                ) : (
                  <Trash2
                    size={
                      16
                    }
                  />
                )}

                حذف پیام
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
