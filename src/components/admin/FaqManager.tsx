"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  ok: boolean;
  message?: string;
  item?: FaqItem;
};

type EditorState = {
  id:
    | string
    | null;

  question:
    string;

  answer:
    string;
};

const emptyEditor:
  EditorState = {
    id:
      null,

    question:
      "",

    answer:
      "",
  };

export default function FaqManager({
  initialItems,
}: {
  initialItems:
    FaqItem[];
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
    editor,
    setEditor,
  ] =
    useState<EditorState>({
      ...emptyEditor,
    });

  const [
    saving,
    setSaving,
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

  const editing =
    editor.id !==
    null;

  function redirectToLogin() {
    router.replace(
      "/admin/login",
    );

    router.refresh();
  }

  function resetEditor() {
    setEditor({
      ...emptyEditor,
    });

    setError(
      "",
    );
  }

  function startEdit(
    item: FaqItem,
  ) {
    setEditor({
      id:
        item.id,

      question:
        item.question,

      answer:
        item.answer,
    });

    setError(
      "",
    );

    setSuccess(
      "",
    );

    window.scrollTo({
      top:
        0,

      behavior:
        "smooth",
    });
  }

  /*
   * ==========================================================
   * CREATE / EDIT
   * ==========================================================
   */

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      saving
    ) {
      return;
    }

    const question =
      editor.question.trim();

    const answer =
      editor.answer.trim();

    if (
      question.length <
      5
    ) {
      setError(
        "متن سوال خیلی کوتاه است.",
      );

      return;
    }

    if (
      answer.length <
      5
    ) {
      setError(
        "متن پاسخ خیلی کوتاه است.",
      );

      return;
    }

    setSaving(
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
          editing
            ? `/api/admin/faqs/${encodeURIComponent(
                editor.id!,
              )}`
            : "/api/admin/faqs",
          {
            method:
              editing
                ? "PATCH"
                : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                question,
                answer,
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
        (await response.json()) as ApiResponse;

      if (
        !response.ok ||
        !data.ok ||
        !data.item
      ) {
        setError(
          data.message ??
            "ذخیره سوال انجام نشد.",
        );

        return;
      }

      if (
        editing
      ) {
        setItems(
          (
            current,
          ) =>
            current.map(
              (
                item,
              ) =>
                item.id ===
                data.item!.id
                  ? data.item!
                  : item,
            ),
        );
      } else {
        setItems(
          (
            current,
          ) => [
            ...current,

            data.item!,
          ],
        );
      }

      setSuccess(
        data.message ??
          "تغییرات ذخیره شد.",
      );

      resetEditor();
    } catch (
      requestError
    ) {
      console.error(
        "FAQ_SAVE_ERROR",
        requestError,
      );

      setError(
        "ارتباط با سرور برقرار نشد.",
      );
    } finally {
      setSaving(
        false,
      );
    }
  }

  /*
   * ==========================================================
   * ACTIVE / INACTIVE
   * ==========================================================
   */

  async function toggleActive(
    item: FaqItem,
  ) {
    if (
      updatingId
    ) {
      return;
    }

    setUpdatingId(
      item.id,
    );

    setError(
      "",
    );

    try {
      const response =
        await fetch(
          `/api/admin/faqs/${encodeURIComponent(
            item.id,
          )}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                isActive:
                  !item.isActive,
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
        (await response.json()) as ApiResponse;

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

      setItems(
        (
          current,
        ) =>
          current.map(
            (
              currentItem,
            ) =>
              currentItem.id ===
              item.id
                ? data.item!
                : currentItem,
          ),
      );
    } catch (
      requestError
    ) {
      console.error(
        "FAQ_TOGGLE_ERROR",
        requestError,
      );

      setError(
        "ارتباط با سرور برقرار نشد.",
      );
    } finally {
      setUpdatingId(
        "",
      );
    }
  }

  /*
   * ==========================================================
   * DELETE
   * ==========================================================
   */

  async function deleteItem(
    item: FaqItem,
  ) {
    if (
      updatingId
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `سوال «${item.question}» حذف شود؟`,
      );

    if (
      !confirmed
    ) {
      return;
    }

    setUpdatingId(
      item.id,
    );

    setError(
      "",
    );

    try {
      const response =
        await fetch(
          `/api/admin/faqs/${encodeURIComponent(
            item.id,
          )}`,
          {
            method:
              "DELETE",
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
        (await response.json()) as ApiResponse;

      if (
        !response.ok ||
        !data.ok
      ) {
        setError(
          data.message ??
            "حذف سوال انجام نشد.",
        );

        return;
      }

      setItems(
        (
          current,
        ) =>
          current.filter(
            (
              currentItem,
            ) =>
              currentItem.id !==
              item.id,
          ),
      );

      if (
        editor.id ===
        item.id
      ) {
        resetEditor();
      }

      setSuccess(
        "سوال با موفقیت حذف شد.",
      );
    } catch (
      requestError
    ) {
      console.error(
        "FAQ_DELETE_ERROR",
        requestError,
      );

      setError(
        "ارتباط با سرور برقرار نشد.",
      );
    } finally {
      setUpdatingId(
        "",
      );
    }
  }

  /*
   * ==========================================================
   * REORDER
   * ==========================================================
   */

  async function moveItem(
    index: number,
    direction:
      | "up"
      | "down",
  ) {
    const targetIndex =
      direction ===
      "up"
        ? index -
          1
        : index +
          1;

    if (
      targetIndex <
        0 ||
      targetIndex >=
        items.length
    ) {
      return;
    }

    const next =
      [
        ...items,
      ];

    [
      next[index],
      next[targetIndex],
    ] = [
      next[targetIndex],
      next[index],
    ];

    setItems(
      next,
    );

    try {
      const response =
        await fetch(
          "/api/admin/faqs/reorder",
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                orderedIds:
                  next.map(
                    (
                      item,
                    ) =>
                      item.id,
                  ),
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
        (await response.json()) as ApiResponse;

      if (
        !response.ok ||
        !data.ok
      ) {
        setItems(
          items,
        );

        setError(
          data.message ??
            "ذخیره ترتیب انجام نشد.",
        );

        return;
      }

      setItems(
        next.map(
          (
            item,
            itemIndex,
          ) => ({
            ...item,

            sortOrder:
              itemIndex,
          }),
        ),
      );
    } catch (
      requestError
    ) {
      console.error(
        "FAQ_REORDER_ERROR",
        requestError,
      );

      setItems(
        items,
      );

      setError(
        "ذخیره ترتیب با خطا مواجه شد.",
      );
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div>
        <span className="text-sm font-black text-brand-active">
          مدیریت محتوا
        </span>

        <h1 className="mt-2 text-3xl font-black text-ink">
          سوالات متداول
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-secondary">
          سوالات متداول سایت را اضافه،
          ویرایش، مرتب یا غیرفعال کنید.
        </p>
      </div>

      {/* Editor */}
      <form
        onSubmit={
          handleSubmit
        }
        className="mt-7 rounded-[1.5rem] border border-line bg-surface p-5 shadow-card sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-black text-ink">
              {editing
                ? "ویرایش سوال"
                : "افزودن سوال جدید"}
            </h2>

            <p className="mt-1 text-xs text-ink-muted">
              سوال و پاسخ را وارد کنید.
            </p>
          </div>

          {editing && (
            <button
              type="button"
              onClick={
                resetEditor
              }
              className="flex h-9 items-center gap-2 rounded-xl border border-line px-3 text-xs font-black text-ink hover:bg-surface-hover"
            >
              <X
                size={15}
              />

              انصراف
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-4">
          <label>
            <span className="mb-2 block text-xs font-black text-ink-secondary">
              سوال
            </span>

            <input
              type="text"
              maxLength={
                300
              }
              value={
                editor.question
              }
              onChange={(
                event,
              ) =>
                setEditor(
                  (
                    current,
                  ) => ({
                    ...current,

                    question:
                      event
                        .target
                        .value,
                  }),
                )
              }
              placeholder="مثلاً کارشناسی خودرو چقدر زمان می‌برد؟"
              className="h-12 w-full rounded-xl border border-line bg-input px-4 text-sm text-ink outline-none focus:border-focus focus:ring-4 focus:ring-brand-soft"
            />
          </label>

          <label>
            <span className="mb-2 block text-xs font-black text-ink-secondary">
              پاسخ
            </span>

            <textarea
              rows={
                5
              }
              maxLength={
                3000
              }
              value={
                editor.answer
              }
              onChange={(
                event,
              ) =>
                setEditor(
                  (
                    current,
                  ) => ({
                    ...current,

                    answer:
                      event
                        .target
                        .value,
                  }),
                )
              }
              placeholder="پاسخ کامل سوال را بنویسید..."
              className="w-full resize-none rounded-xl border border-line bg-input px-4 py-3 text-sm leading-8 text-ink outline-none focus:border-focus focus:ring-4 focus:ring-brand-soft"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={
            saving
          }
          className="mt-5 flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-black text-on-brand hover:bg-brand-hover disabled:opacity-50"
        >
          {saving ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : editing ? (
            <Save
              size={17}
            />
          ) : (
            <Plus
              size={17}
            />
          )}

          {editing
            ? "ذخیره تغییرات"
            : "افزودن سوال"}
        </button>
      </form>

      {success && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-success bg-success-soft p-4">
          <CheckCircle2
            size={19}
            className="text-success"
          />

          <p className="text-sm font-black text-success">
            {
              success
            }
          </p>
        </div>
      )}

      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-danger bg-danger-soft p-4">
          <TriangleAlert
            size={19}
            className="text-danger"
          />

          <p className="text-sm font-bold text-ink-secondary">
            {
              error
            }
          </p>
        </div>
      )}

      {/* List */}
      <div className="mt-7 space-y-3">
        {items.length ===
        0 ? (
          <div className="rounded-[1.5rem] border border-line bg-surface p-10 text-center">
            <p className="font-black text-ink">
              هنوز سوالی ثبت نشده.
            </p>
          </div>
        ) : (
          items.map(
            (
              item,
              index,
            ) => (
              <article
                key={
                  item.id
                }
                className="rounded-[1.5rem] border border-line bg-surface p-5 shadow-card"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black ${
                          item.isActive
                            ? "bg-success-soft text-success"
                            : "bg-surface-muted text-ink-muted"
                        }`}
                      >
                        {item.isActive
                          ? "فعال"
                          : "غیرفعال"}
                      </span>

                      <span className="text-xs font-bold text-ink-muted">
                        سوال{" "}
                        {new Intl.NumberFormat(
                          "fa-IR",
                        ).format(
                          index +
                            1,
                        )}
                      </span>
                    </div>

                    <h3 className="mt-4 text-base font-black leading-8 text-ink">
                      {
                        item.question
                      }
                    </h3>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-8 text-ink-secondary">
                      {
                        item.answer
                      }
                    </p>
                  </div>

                  <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-5 xl:w-auto">
                    <button
                      type="button"
                      disabled={
                        index ===
                          0 ||
                        Boolean(
                          updatingId,
                        )
                      }
                      onClick={() =>
                        void moveItem(
                          index,
                          "up",
                        )
                      }
                      aria-label="انتقال به بالا"
                      className="flex h-10 items-center justify-center rounded-xl border border-line bg-surface px-3 text-ink hover:bg-surface-hover disabled:opacity-30"
                    >
                      <ChevronUp
                        size={16}
                      />
                    </button>

                    <button
                      type="button"
                      disabled={
                        index ===
                          items.length -
                            1 ||
                        Boolean(
                          updatingId,
                        )
                      }
                      onClick={() =>
                        void moveItem(
                          index,
                          "down",
                        )
                      }
                      aria-label="انتقال به پایین"
                      className="flex h-10 items-center justify-center rounded-xl border border-line bg-surface px-3 text-ink hover:bg-surface-hover disabled:opacity-30"
                    >
                      <ChevronDown
                        size={16}
                      />
                    </button>

                    <button
                      type="button"
                      disabled={
                        updatingId ===
                        item.id
                      }
                      onClick={() =>
                        void toggleActive(
                          item,
                        )
                      }
                      className="flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-black text-ink hover:bg-surface-hover"
                    >
                      {item.isActive ? (
                        <EyeOff
                          size={15}
                        />
                      ) : (
                        <Eye
                          size={15}
                        />
                      )}

                      {item.isActive
                        ? "غیرفعال"
                        : "فعال"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        startEdit(
                          item,
                        )
                      }
                      className="flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-soft px-3 text-xs font-black text-brand-active"
                    >
                      <Pencil
                        size={15}
                      />

                      ویرایش
                    </button>

                    <button
                      type="button"
                      disabled={
                        updatingId ===
                        item.id
                      }
                      onClick={() =>
                        void deleteItem(
                          item,
                        )
                      }
                      className="flex h-10 items-center justify-center gap-2 rounded-xl bg-danger-soft px-3 text-xs font-black text-danger"
                    >
                      {updatingId ===
                      item.id ? (
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2
                          size={15}
                        />
                      )}

                      حذف
                    </button>
                  </div>
                </div>
              </article>
            )
          )
        )}
      </div>
    </div>
  );
}