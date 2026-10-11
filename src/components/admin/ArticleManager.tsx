"use client";

import ArticleRichEditor from "@/components/admin/ArticleRichEditor";

import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  TriangleAlert,
  Upload,
  X,
  XCircle,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useRef,
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type ArticleItem = {
  id: string;

  title: string;

  slug: string;

  excerpt: string;

  content: string;

  coverImageUrl:
    | string
    | null;

  status: string;

  isFeatured: boolean;

  publishedAt:
    | string
    | null;

  createdAt: string;

  updatedAt: string;
};

type EditorState = {
  id:
    | string
    | null;

  title: string;

  slug: string;

  excerpt: string;

  content: string;

  coverImageUrl: string;

  status: string;

  isFeatured: boolean;
};

type ApiResponse = {
  ok: boolean;

  message?: string;

  item?: ArticleItem;
};

type UploadResponse = {
  ok: boolean;

  message?: string;

  url?: string;

  image?: {
    url: string;

    width:
      | number
      | null;

    height:
      | number
      | null;

    size: number;
  };
};

/*
 * ============================================================
 * DEFAULT STATE
 * ============================================================
 */

const emptyEditor:
  EditorState = {
    id:
      null,

    title:
      "",

    slug:
      "",

    excerpt:
      "",

    content:
      "",

    coverImageUrl:
      "",

    status:
      "draft",

    isFeatured:
      false,
  };

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function createSlug(
  value: string,
) {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[\s_]+/g,
      "-",
    )
    .replace(
      /[^a-z0-9\u0600-\u06FF-]/g,
      "",
    )
    .replace(
      /-+/g,
      "-",
    )
    .replace(
      /^-|-$/g,
      "",
    )
    .slice(
      0,
      160,
    );
}

/*
 * متن واقعی را از HTML ویرایشگر استخراج می‌کند
 * تا طول محتوا با تگ‌های HTML اشتباه محاسبه نشود.
 */
function getPlainTextFromHtml(
  html: string,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return html
      .replace(
        /<[^>]*>/g,
        " ",
      )
      .replace(
        /\s+/g,
        " ",
      )
      .trim();
  }

  const element =
    document.createElement(
      "div",
    );

  element.innerHTML =
    html;

  return (
    element.textContent ??
    ""
  )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

/*
 * ============================================================
 * SAFE API RESPONSE
 *
 * اگر Next یا Server به جای JSON صفحه HTML برگرداند،
 * دیگر response.json() باعث:
 *
 * Unexpected token '<'
 *
 * نمی‌شود.
 * ============================================================
 */

async function readApiResponse<T>(
  response: Response,
): Promise<T> {
  const contentType =
    response.headers.get(
      "content-type",
    ) ?? "";

  const raw =
    await response.text();

  if (
    contentType.includes(
      "application/json",
    )
  ) {
    try {
      return JSON.parse(
        raw,
      ) as T;
    } catch (
      parseError
    ) {
      console.error(
        "ARTICLE_INVALID_JSON_RESPONSE",
        {
          status:
            response.status,

          url:
            response.url,

          body:
            raw.slice(
              0,
              1200,
            ),

          error:
            parseError,
        },
      );

      throw new Error(
        `پاسخ JSON سرور معتبر نیست. HTTP ${response.status}`,
      );
    }
  }

  console.error(
    "ARTICLE_NON_JSON_RESPONSE",
    {
      status:
        response.status,

      statusText:
        response.statusText,

      url:
        response.url,

      contentType,

      body:
        raw.slice(
          0,
          1500,
        ),
    },
  );

  if (
    response.status ===
    401
  ) {
    throw new Error(
      "AUTH_REQUIRED",
    );
  }

  if (
    response.status ===
    404
  ) {
    throw new Error(
      "مسیر API پیدا نشد.",
    );
  }

  if (
    response.status ===
    413
  ) {
    throw new Error(
      "حجم فایل از محدودیت سرور بیشتر است.",
    );
  }

  if (
    response.status >=
    500
  ) {
    throw new Error(
      `خطای داخلی سرور رخ داد. HTTP ${response.status}`,
    );
  }

  throw new Error(
    `پاسخ نامعتبر از سرور دریافت شد. HTTP ${response.status}`,
  );
}

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function ArticleManager({
  initialItems,
}: {
  initialItems:
    ArticleItem[];
}) {
  const router =
    useRouter();

  const coverInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const [
    items,
    setItems,
  ] =
    useState<
      ArticleItem[]
    >(
      initialItems,
    );

  const [
    editor,
    setEditor,
  ] =
    useState<EditorState>({
      ...emptyEditor,
    });

  /*
   * باعث Remount شدن Tiptap هنگام:
   * - انتخاب مقاله دیگر
   * - لغو ویرایش
   * - ذخیره موفق
   */
  const [
    editorVersion,
    setEditorVersion,
  ] =
    useState(
      0,
    );

  const [
    saving,
    setSaving,
  ] =
    useState(
      false,
    );

  const [
    uploading,
    setUploading,
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

  /*
   * ==========================================================
   * AUTH
   * ==========================================================
   */

  function redirectToLogin() {
    router.replace(
      "/admin/login",
    );

    router.refresh();
  }

  /*
   * ==========================================================
   * MESSAGES
   * ==========================================================
   */

  function clearMessages() {
    setError(
      "",
    );

    setSuccess(
      "",
    );
  }

  /*
   * ==========================================================
   * EDITOR STATE
   * ==========================================================
   */

  function resetEditor() {
    setEditor({
      ...emptyEditor,
    });

    setEditorVersion(
      (
        current,
      ) =>
        current +
        1,
    );

    clearMessages();
  }

  function updateEditor(
    field:
      keyof EditorState,

    value:
      string | boolean,
  ) {
    setEditor(
      (
        current,
      ) => ({
        ...current,

        [field]:
          value,
      }),
    );

    clearMessages();
  }

  /*
   * برای مقاله جدید، Slug خودکار از عنوان ساخته می‌شود.
   *
   * هنگام ویرایش مقاله موجود، Slug خودکار تغییر نمی‌کند
   * تا URL قبلی ناخواسته شکسته نشود.
   */
  function updateTitle(
    title: string,
  ) {
    setEditor(
      (
        current,
      ) => ({
        ...current,

        title,

        slug:
          current.id
            ? current.slug
            : createSlug(
                title,
              ),
      }),
    );

    clearMessages();
  }

  function startEdit(
    item:
      ArticleItem,
  ) {
    setEditor({
      id:
        item.id,

      title:
        item.title,

      slug:
        item.slug,

      excerpt:
        item.excerpt,

      content:
        item.content,

      coverImageUrl:
        item.coverImageUrl ??
        "",

      status:
        item.status,

      isFeatured:
        item.isFeatured,
    });

    setEditorVersion(
      (
        current,
      ) =>
        current +
        1,
    );

    clearMessages();

    window.scrollTo({
      top:
        0,

      behavior:
        "smooth",
    });
  }

  /*
   * ==========================================================
   * COVER UPLOAD
   * ==========================================================
   */

  async function uploadCover(
    file: File,
  ) {
    if (
      uploading
    ) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (
      !allowedTypes.includes(
        file.type,
      )
    ) {
      setError(
        "فرمت تصویر مجاز نیست. JPG، PNG، WEBP یا AVIF انتخاب کنید.",
      );

      setSuccess(
        "",
      );

      return;
    }

    if (
      file.size >
      8 * 1024 * 1024
    ) {
      setError(
        "حجم تصویر اولیه نباید بیشتر از ۸ مگابایت باشد.",
      );

      setSuccess(
        "",
      );

      return;
    }

    setUploading(
      true,
    );

    clearMessages();

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file,
      );

      const response =
        await fetch(
          "/api/admin/uploads/articles",
          {
            method:
              "POST",

            body:
              formData,
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
        await readApiResponse<UploadResponse>(
          response,
        );

      if (
        !response.ok ||
        !data.ok ||
        !data.url
      ) {
        setError(
          data.message ??
            "آپلود تصویر انجام نشد.",
        );

        return;
      }

      setEditor(
        (
          current,
        ) => ({
          ...current,

          coverImageUrl:
            data.url!,
        }),
      );

      setSuccess(
        "کاور مقاله با موفقیت آپلود و بهینه شد.",
      );
    } catch (
      uploadError
    ) {
      console.error(
        "ARTICLE_COVER_UPLOAD_ERROR",
        uploadError,
      );

      if (
        uploadError instanceof
          Error
      ) {
        if (
          uploadError.message ===
          "AUTH_REQUIRED"
        ) {
          redirectToLogin();

          return;
        }

        setError(
          uploadError.message,
        );
      } else {
        setError(
          "ارتباط با سرور هنگام آپلود تصویر برقرار نشد.",
        );
      }
    } finally {
      setUploading(
        false,
      );
    }
  }

  function handleCoverInput(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    /*
     * اجازه می‌دهد همان فایل دوباره نیز انتخاب شود.
     */
    event.target.value =
      "";

    if (
      !file
    ) {
      return;
    }

    void uploadCover(
      file,
    );
  }

  /*
   * ==========================================================
   * SAVE ARTICLE
   * ==========================================================
   */

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      saving ||
      uploading
    ) {
      return;
    }

    const title =
      editor.title.trim();

    const slug =
      createSlug(
        editor.slug,
      );

    const excerpt =
      editor.excerpt.trim();

    const content =
      editor.content.trim();

    /*
     * ===========================================
     * VALIDATION
     * ===========================================
     */

    if (
      title.length <
      5
    ) {
      setError(
        "عنوان مقاله باید حداقل ۵ کاراکتر باشد.",
      );

      setSuccess(
        "",
      );

      return;
    }

    if (
      slug.length <
      3
    ) {
      setError(
        "آدرس مقاله معتبر نیست.",
      );

      setSuccess(
        "",
      );

      return;
    }

    if (
      excerpt.length <
      10
    ) {
      setError(
        "خلاصه مقاله باید حداقل ۱۰ کاراکتر باشد.",
      );

      setSuccess(
        "",
      );

      return;
    }

    const plainContent =
      getPlainTextFromHtml(
        content,
      );

    if (
      plainContent.length <
      30
    ) {
      setError(
        "متن مقاله باید حداقل ۳۰ کاراکتر محتوای واقعی داشته باشد.",
      );

      setSuccess(
        "",
      );

      return;
    }

    /*
     * ===========================================
     * REQUEST
     * ===========================================
     */

    setSaving(
      true,
    );

    clearMessages();

    try {
      const requestUrl =
        editing
          ? `/api/admin/articles/${encodeURIComponent(
              editor.id!,
            )}`
          : "/api/admin/articles";

      const requestMethod =
        editing
          ? "PATCH"
          : "POST";

      const response =
        await fetch(
          requestUrl,
          {
            method:
              requestMethod,

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                title,

                slug,

                excerpt,

                content,

                coverImageUrl:
                  editor.coverImageUrl.trim(),

                status:
                  editor.status,

                isFeatured:
                  editor.isFeatured,
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
        await readApiResponse<ApiResponse>(
          response,
        );

      if (
        !response.ok ||
        !data.ok ||
        !data.item
      ) {
        setError(
          data.message ??
            "ذخیره مقاله انجام نشد.",
        );

        return;
      }

      const savedItem =
        data.item;

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
                savedItem.id
                  ? savedItem
                  : item,
            ),
        );
      } else {
        setItems(
          (
            current,
          ) => [
            savedItem,

            ...current,
          ],
        );
      }

      /*
       * Reset form + Tiptap
       */
      setEditor({
        ...emptyEditor,
      });

      setEditorVersion(
        (
          current,
        ) =>
          current +
          1,
      );

      setSuccess(
        data.message ??
          "مقاله با موفقیت ذخیره شد.",
      );

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "ARTICLE_SAVE_ERROR",
        requestError,
      );

      if (
        requestError instanceof
          Error
      ) {
        if (
          requestError.message ===
          "AUTH_REQUIRED"
        ) {
          redirectToLogin();

          return;
        }

        setError(
          requestError.message,
        );
      } else {
        setError(
          "ارتباط با سرور برقرار نشد.",
        );
      }
    } finally {
      setSaving(
        false,
      );
    }
  }

  /*
   * ==========================================================
   * PUBLISH / DRAFT
   * ==========================================================
   */

  async function toggleStatus(
    item:
      ArticleItem,
  ) {
    if (
      updatingId
    ) {
      return;
    }

    const nextStatus =
      item.status ===
      "published"
        ? "draft"
        : "published";

    setUpdatingId(
      item.id,
    );

    clearMessages();

    try {
      const response =
        await fetch(
          `/api/admin/articles/${encodeURIComponent(
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
        await readApiResponse<ApiResponse>(
          response,
        );

      if (
        !response.ok ||
        !data.ok ||
        !data.item
      ) {
        setError(
          data.message ??
            "تغییر وضعیت مقاله انجام نشد.",
        );

        return;
      }

      const updatedItem =
        data.item;

      setItems(
        (
          current,
        ) =>
          current.map(
            (
              currentItem,
            ) =>
              currentItem.id ===
              updatedItem.id
                ? updatedItem
                : currentItem,
          ),
      );

      setSuccess(
        updatedItem.status ===
        "published"
          ? "مقاله با موفقیت منتشر شد."
          : "مقاله به پیش‌نویس منتقل شد.",
      );

      /*
       * اگر همین مقاله در Editor باز است،
       * وضعیت Editor هم همگام شود.
       */
      if (
        editor.id ===
        updatedItem.id
      ) {
        setEditor(
          (
            current,
          ) => ({
            ...current,

            status:
              updatedItem.status,
          }),
        );
      }

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "ARTICLE_STATUS_ERROR",
        requestError,
      );

      if (
        requestError instanceof
          Error
      ) {
        setError(
          requestError.message,
        );
      } else {
        setError(
          "ارتباط با سرور برقرار نشد.",
        );
      }
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

  async function deleteArticle(
    item:
      ArticleItem,
  ) {
    if (
      updatingId
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `مقاله «${item.title}» برای همیشه حذف شود؟`,
      );

    if (
      !confirmed
    ) {
      return;
    }

    setUpdatingId(
      item.id,
    );

    clearMessages();

    try {
      const response =
        await fetch(
          `/api/admin/articles/${encodeURIComponent(
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
        await readApiResponse<ApiResponse>(
          response,
        );

      if (
        !response.ok ||
        !data.ok
      ) {
        setError(
          data.message ??
            "حذف مقاله انجام نشد.",
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

      /*
       * اگر مقاله در حال ویرایش حذف شد،
       * فرم هم پاک شود.
       */
      if (
        editor.id ===
        item.id
      ) {
        setEditor({
          ...emptyEditor,
        });

        setEditorVersion(
          (
            current,
          ) =>
            current +
            1,
        );
      }

      setSuccess(
        data.message ??
          "مقاله با موفقیت حذف شد.",
      );

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "ARTICLE_DELETE_ERROR",
        requestError,
      );

      if (
        requestError instanceof
          Error
      ) {
        setError(
          requestError.message,
        );
      } else {
        setError(
          "ارتباط با سرور برقرار نشد.",
        );
      }
    } finally {
      setUpdatingId(
        "",
      );
    }
  }

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div>
        <span className="text-sm font-black text-brand-active">
          مدیریت محتوا
        </span>

        <h1 className="mt-2 text-3xl font-black text-ink">
          مقالات و آموزش‌ها
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-secondary">
          مقالات آموزشی سایت را ایجاد،
          ویرایش، منتشر و برای نمایش در
          صفحه اصلی مدیریت کنید.
        </p>
      </div>

      {/* ======================================================
          ARTICLE EDITOR FORM
      ====================================================== */}

      <form
        onSubmit={
          handleSubmit
        }
        className="mt-7 rounded-[1.5rem] border border-line bg-surface p-5 shadow-card sm:p-6"
      >
        {/* Form header */}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-ink">
              {editing
                ? "ویرایش مقاله"
                : "افزودن مقاله جدید"}
            </h2>

            <p className="mt-1 text-xs leading-6 text-ink-muted">
              عنوان، خلاصه، محتوای کامل،
              تصویر کاور و وضعیت انتشار را
              مشخص کنید.
            </p>
          </div>

          {editing && (
            <button
              type="button"
              disabled={
                saving ||
                uploading
              }
              onClick={
                resetEditor
              }
              className="flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-xs font-black text-ink transition-colors hover:bg-surface-hover disabled:opacity-50"
            >
              <X
                size={
                  16
                }
              />

              انصراف از ویرایش
            </button>
          )}
        </div>

        {/* ====================================================
            TITLE + SLUG
        ==================================================== */}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-black text-ink-secondary">
              عنوان مقاله
            </span>

            <input
              type="text"
              maxLength={
                200
              }
              value={
                editor.title
              }
              onChange={(
                event,
              ) =>
                updateTitle(
                  event
                    .target
                    .value,
                )
              }
              placeholder="مثلاً چگونه رنگ‌شدگی خودرو را تشخیص دهیم؟"
              className="h-12 w-full min-w-0 rounded-xl border border-line bg-input px-4 text-sm text-ink outline-none transition-colors placeholder:text-placeholder focus:border-focus focus:ring-4 focus:ring-brand-soft"
            />
          </label>

          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-black text-ink-secondary">
              آدرس مقاله
            </span>

            <div className="relative">
              <span
                dir="ltr"
                className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-xs text-ink-muted"
              >
                /blog/
              </span>

              <input
                type="text"
                dir="ltr"
                maxLength={
                  160
                }
                value={
                  editor.slug
                }
                onChange={(
                  event,
                ) =>
                  updateEditor(
                    "slug",
                    createSlug(
                      event
                        .target
                        .value,
                    ),
                  )
                }
                placeholder="car-paint-inspection"
                className="h-12 w-full min-w-0 rounded-xl border border-line bg-input pr-4 pl-16 text-left text-sm text-ink outline-none transition-colors placeholder:text-placeholder focus:border-focus focus:ring-4 focus:ring-brand-soft"
              />
            </div>

            <p className="mt-2 text-[11px] leading-6 text-ink-muted">
              بعد از انتشار بهتر است آدرس
              مقاله را بدون دلیل تغییر
              ندهید.
            </p>
          </label>
        </div>

        {/* ====================================================
            EXCERPT
        ==================================================== */}

        <label className="mt-5 block">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-xs font-black text-ink-secondary">
              خلاصه مقاله
            </span>

            <span className="text-[10px] font-bold text-ink-muted">
              {new Intl.NumberFormat(
                "fa-IR",
              ).format(
                editor.excerpt.length,
              )}
              /۵۰۰
            </span>
          </div>

          <textarea
            rows={
              3
            }
            maxLength={
              500
            }
            value={
              editor.excerpt
            }
            onChange={(
              event,
            ) =>
              updateEditor(
                "excerpt",
                event
                  .target
                  .value,
              )
            }
            placeholder="خلاصه‌ای کوتاه، جذاب و مناسب نمایش در کارت مقاله و موتورهای جست‌وجو..."
            className="w-full resize-none rounded-xl border border-line bg-input px-4 py-3 text-sm leading-8 text-ink outline-none transition-colors placeholder:text-placeholder focus:border-focus focus:ring-4 focus:ring-brand-soft"
          />
        </label>

        {/* ====================================================
            RICH TEXT
        ==================================================== */}

        <div className="mt-6">
          <div className="mb-2">
            <span className="block text-xs font-black text-ink-secondary">
              متن کامل مقاله
            </span>

            <p className="mt-1 text-[11px] leading-6 text-ink-muted">
              عنوان اصلی صفحه به صورت H1
              خودکار ساخته می‌شود؛ داخل
              مقاله از H2 و H3 استفاده
              کنید.
            </p>
          </div>

          <ArticleRichEditor
            key={`${editor.id ?? "new"}-${editorVersion}`}
            initialContent={
              editor.content
            }
            disabled={
              saving
            }
            onChange={(
              html,
            ) => {
              setEditor(
                (
                  current,
                ) => ({
                  ...current,

                  content:
                    html,
                }),
              );

              setError(
                "",
              );

              setSuccess(
                "",
              );
            }}
          />
        </div>

        {/* ====================================================
            COVER IMAGE
        ==================================================== */}

        <div className="mt-6">
          <div>
            <span className="block text-xs font-black text-ink-secondary">
              تصویر کاور
            </span>

            <p className="mt-1 text-[11px] leading-6 text-ink-muted">
              تصویر بعد از آپلود به‌صورت
              خودکار بهینه و به WebP تبدیل
              می‌شود.
            </p>
          </div>

          <input
            ref={
              coverInputRef
            }
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            disabled={
              uploading ||
              saving
            }
            onChange={
              handleCoverInput
            }
            className="hidden"
          />

          {!editor.coverImageUrl ? (
            <button
              type="button"
              disabled={
                uploading ||
                saving
              }
              onClick={() =>
                coverInputRef.current?.click()
              }
              className="mt-3 flex min-h-48 w-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-line-strong bg-surface-muted px-6 text-center transition-colors hover:bg-surface-hover disabled:cursor-wait disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2
                    size={
                      28
                    }
                    className="animate-spin text-brand-active"
                  />

                  <span className="mt-3 text-sm font-black text-ink">
                    در حال آپلود و
                    بهینه‌سازی...
                  </span>

                  <span className="mt-1 text-[11px] text-ink-muted">
                    لطفاً چند لحظه صبر کنید
                  </span>
                </>
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand-active">
                    <Upload
                      size={
                        21
                      }
                    />
                  </div>

                  <span className="mt-3 text-sm font-black text-ink">
                    انتخاب تصویر کاور
                  </span>

                  <span className="mt-1 text-[11px] leading-6 text-ink-muted">
                    JPG، PNG، WEBP یا AVIF
                    — حداکثر ۸ مگابایت
                  </span>
                </>
              )}
            </button>
          ) : (
            <div className="relative mt-3 overflow-hidden rounded-[1.5rem] border border-line bg-surface-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  editor.coverImageUrl
                }
                alt="پیش‌نمایش کاور مقاله"
                className="aspect-[16/7] w-full object-cover"
              />

              <div className="absolute inset-x-3 bottom-3 flex gap-2">
                <button
                  type="button"
                  disabled={
                    uploading ||
                    saving
                  }
                  onClick={() =>
                    coverInputRef.current?.click()
                  }
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-surface px-4 text-xs font-black text-ink shadow-float transition-colors hover:bg-surface-hover disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2
                      size={
                        16
                      }
                      className="animate-spin"
                    />
                  ) : (
                    <Upload
                      size={
                        16
                      }
                    />
                  )}

                  تغییر تصویر
                </button>

                <button
                  type="button"
                  disabled={
                    uploading ||
                    saving
                  }
                  onClick={() =>
                    updateEditor(
                      "coverImageUrl",
                      "",
                    )
                  }
                  aria-label="حذف تصویر کاور"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger-soft text-danger shadow-float disabled:opacity-50"
                >
                  <XCircle
                    size={
                      17
                    }
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ====================================================
            PUBLISH SETTINGS
        ==================================================== */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-black text-ink-secondary">
              وضعیت مقاله
            </span>

            <select
              value={
                editor.status
              }
              onChange={(
                event,
              ) =>
                updateEditor(
                  "status",
                  event
                    .target
                    .value,
                )
              }
              className="h-12 w-full rounded-xl border border-line bg-input px-4 text-sm font-bold text-ink outline-none transition-colors focus:border-focus focus:ring-4 focus:ring-brand-soft"
            >
              <option value="draft">
                پیش‌نویس
              </option>

              <option value="published">
                منتشرشده
              </option>
            </select>
          </label>

          <label className="flex min-h-12 cursor-pointer items-center gap-3 self-end rounded-xl border border-line bg-surface-muted px-4 transition-colors hover:bg-surface-hover">
            <input
              type="checkbox"
              checked={
                editor.isFeatured
              }
              onChange={(
                event,
              ) =>
                updateEditor(
                  "isFeatured",
                  event
                    .target
                    .checked,
                )
              }
              className="h-4 w-4 shrink-0 accent-current"
            />

            <div>
              <span className="block text-sm font-black text-ink">
                نمایش در صفحه اصلی
              </span>

              <span className="mt-0.5 block text-[10px] leading-5 text-ink-muted">
                مقاله در بخش آموزش صفحه
                اصلی قرار می‌گیرد.
              </span>
            </div>
          </label>
        </div>

        {/* ====================================================
            ERROR / SUCCESS
        ==================================================== */}

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

        {success && (
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

            <p className="text-sm font-black leading-7 text-success">
              {
                success
              }
            </p>
          </div>
        )}

        {/* ====================================================
            SAVE
        ==================================================== */}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={
              saving ||
              uploading
            }
            className="flex h-12 min-w-48 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-black text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-wait disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2
                  size={
                    18
                  }
                  className="animate-spin"
                />

                در حال ذخیره...
              </>
            ) : editing ? (
              <>
                <Save
                  size={
                    18
                  }
                />

                ذخیره تغییرات
              </>
            ) : (
              <>
                <Plus
                  size={
                    18
                  }
                />

                ثبت مقاله
              </>
            )}
          </button>

          {editing &&
            editor.status ===
              "published" &&
            editor.slug && (
              <a
                href={`/blog/${editor.slug}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-5 text-sm font-black text-ink transition-colors hover:bg-surface-hover"
              >
                <Eye
                  size={
                    17
                  }
                />

                مشاهده مقاله
              </a>
            )}
        </div>
      </form>

      {/* ======================================================
          ARTICLE LIST HEADER
      ====================================================== */}

      <div className="mt-9 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-ink">
            مقالات ثبت‌شده
          </h2>

          <p className="mt-1 text-xs text-ink-muted">
            تعداد کل:{" "}
            {new Intl.NumberFormat(
              "fa-IR",
            ).format(
              items.length,
            )}
          </p>
        </div>

        <a
          href="/blog"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-black text-brand-active"
        >
          مشاهده وبلاگ ←
        </a>
      </div>

      {/* ======================================================
          ARTICLES
      ====================================================== */}

      <div className="mt-4 space-y-4">
        {items.length ===
        0 ? (
          <div className="rounded-[1.5rem] border border-line bg-surface p-10 text-center shadow-card">
            <p className="font-black text-ink">
              هنوز مقاله‌ای ثبت نشده.
            </p>

            <p className="mt-2 text-xs leading-6 text-ink-muted">
              اولین مقاله را از فرم بالا
              ایجاد کنید.
            </p>
          </div>
        ) : (
          items.map(
            (
              item,
            ) => (
              <article
                key={
                  item.id
                }
                className="overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-card"
              >
                <div className="grid md:grid-cols-[210px_minmax(0,1fr)]">
                  {/* Cover */}

                  <div className="min-h-44 overflow-hidden bg-surface-muted">
                    {item.coverImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={
                          item.coverImageUrl
                        }
                        alt={
                          item.title
                        }
                        loading="lazy"
                        className="h-full min-h-44 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full min-h-44 items-center justify-center">
                        <span className="text-xs font-bold text-ink-muted">
                          بدون کاور
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Article info */}

                  <div className="min-w-0 p-5 sm:p-6">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">
                        {/* Badges */}

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-black ${
                              item.status ===
                              "published"
                                ? "bg-success-soft text-success"
                                : "bg-surface-muted text-ink-muted"
                            }`}
                          >
                            {item.status ===
                            "published"
                              ? "منتشرشده"
                              : "پیش‌نویس"}
                          </span>

                          {item.isFeatured && (
                            <span className="rounded-full bg-brand-soft px-3 py-1 text-[10px] font-black text-brand-active">
                              صفحه اصلی
                            </span>
                          )}
                        </div>

                        {/* Title */}

                        <h3 className="mt-3 text-lg font-black leading-8 text-ink">
                          {
                            item.title
                          }
                        </h3>

                        {/* URL */}

                        <p
                          dir="ltr"
                          className="mt-1 truncate text-left text-[11px] font-bold text-ink-muted"
                        >
                          /blog/
                          {
                            item.slug
                          }
                        </p>

                        {/* Excerpt */}

                        <p className="mt-3 line-clamp-3 text-sm leading-8 text-ink-secondary">
                          {
                            item.excerpt
                          }
                        </p>

                        {/* Date */}

                        {item.publishedAt && (
                          <p className="mt-3 text-[11px] font-bold text-ink-muted">
                            تاریخ انتشار:{" "}
                            {new Intl.DateTimeFormat(
                              "fa-IR",
                              {
                                year:
                                  "numeric",

                                month:
                                  "long",

                                day:
                                  "numeric",
                              },
                            ).format(
                              new Date(
                                item.publishedAt,
                              ),
                            )}
                          </p>
                        )}
                      </div>

                      {/* Actions */}

                      <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4 xl:w-auto">
                        {item.status ===
                          "published" && (
                          <a
                            href={`/blog/${item.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-[11px] font-black text-ink transition-colors hover:bg-surface-hover"
                          >
                            <Eye
                              size={
                                15
                              }
                            />

                            مشاهده
                          </a>
                        )}

                        <button
                          type="button"
                          disabled={
                            Boolean(
                              updatingId,
                            )
                          }
                          onClick={() =>
                            void toggleStatus(
                              item,
                            )
                          }
                          className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-[11px] font-black text-ink transition-colors hover:bg-surface-hover disabled:opacity-40"
                        >
                          {updatingId ===
                          item.id ? (
                            <Loader2
                              size={
                                15
                              }
                              className="animate-spin"
                            />
                          ) : item.status ===
                            "published" ? (
                            <EyeOff
                              size={
                                15
                              }
                            />
                          ) : (
                            <Eye
                              size={
                                15
                              }
                            />
                          )}

                          {item.status ===
                          "published"
                            ? "پیش‌نویس"
                            : "انتشار"}
                        </button>

                        <button
                          type="button"
                          disabled={
                            Boolean(
                              updatingId,
                            )
                          }
                          onClick={() =>
                            startEdit(
                              item,
                            )
                          }
                          className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-brand-border bg-brand-soft px-3 text-[11px] font-black text-brand-active transition-colors disabled:opacity-40"
                        >
                          <Pencil
                            size={
                              15
                            }
                          />

                          ویرایش
                        </button>

                        <button
                          type="button"
                          disabled={
                            Boolean(
                              updatingId,
                            )
                          }
                          onClick={() =>
                            void deleteArticle(
                              item,
                            )
                          }
                          className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-danger bg-danger-soft px-3 text-[11px] font-black text-danger transition-colors disabled:opacity-40"
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
                            <Trash2
                              size={
                                15
                              }
                            />
                          )}

                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ),
          )
        )}
      </div>
    </div>
  );
}