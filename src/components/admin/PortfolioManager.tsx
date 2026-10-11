"use client";

import {
  CarFront,
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
  ReactNode,
  RefObject,
} from "react";

type PortfolioItem = {
  id: string;
  title: string;
  vehicle: string;
  category: string;
  description: string;
  beforeImageUrl: string | null;
  afterImageUrl: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  ok: boolean;
  message?: string;
  item?: PortfolioItem;
  items?: PortfolioItem[];
};

type UploadResponse = {
  ok: boolean;
  message?: string;
  url?: string;
};

type EditorState = {
  id: string | null;
  title: string;
  vehicle: string;
  category: string;
  description: string;
  imageUrl: string;
};

const emptyEditor: EditorState = {
  id: null,
  title: "",
  vehicle: "",
  category: "full",
  description: "",
  imageUrl: "",
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
      error
    ) {
      console.error(
        "INVALID_JSON_RESPONSE",
        {
          status:
            response.status,

          url:
            response.url,

          body:
            raw.slice(
              0,
              1000,
            ),

          error,
        },
      );

      throw new Error(
        `پاسخ JSON سرور معتبر نیست. کد HTTP: ${response.status}`,
      );
    }
  }

  console.error(
    "NON_JSON_API_RESPONSE",
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
      "مسیر API موردنظر پیدا نشد.",
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
      `خطای داخلی سرور رخ داد. کد HTTP: ${response.status}`,
    );
  }

  throw new Error(
    `سرور پاسخ نامعتبر برگرداند. کد HTTP: ${response.status}`,
  );
}

export default function PortfolioManager({
  initialItems,
}: {
  initialItems:
    PortfolioItem[];
}) {
  const router =
    useRouter();

  const imageInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const [
    items,
    setItems,
  ] =
    useState<
      PortfolioItem[]
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

  function redirectToLogin() {
    router.replace(
      "/admin/login",
    );

    router.refresh();
  }

  function clearMessages() {
    setError(
      "",
    );

    setSuccess(
      "",
    );
  }

  function resetEditor() {
    setEditor({
      ...emptyEditor,
    });

    clearMessages();
  }

  function updateEditor(
    field:
      keyof EditorState,
    value:
      string,
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

  function startEdit(
    item:
      PortfolioItem,
  ) {
    setEditor({
      id:
        item.id,

      title:
        item.title,

      vehicle:
        item.vehicle,

      category:
        item.category,

      description:
        item.description,

      imageUrl:
        item.afterImageUrl,
    });

    clearMessages();

    window.scrollTo({
      top:
        0,

      behavior:
        "smooth",
    });
  }

  async function uploadImage(
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
      8 *
        1024 *
        1024
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
          "/api/admin/uploads/portfolio",
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

          imageUrl:
            data.url!,
        }),
      );

      setSuccess(
        "تصویر با موفقیت آپلود و بهینه شد.",
      );
    } catch (
      uploadError
    ) {
      console.error(
        "PORTFOLIO_UPLOAD_ERROR",
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

  function handleImageInput(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    event.target.value =
      "";

    if (
      !file
    ) {
      return;
    }

    void uploadImage(
      file,
    );
  }

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

    const vehicle =
      editor.vehicle.trim();

    const description =
      editor.description.trim();

    const imageUrl =
      editor.imageUrl.trim();

    if (
      title.length <
      3
    ) {
      setError(
        "عنوان نمونه‌کار را کامل وارد کنید.",
      );

      setSuccess(
        "",
      );

      return;
    }

    if (
      vehicle.length <
      2
    ) {
      setError(
        "نام خودرو را کامل وارد کنید.",
      );

      setSuccess(
        "",
      );

      return;
    }

    if (
      description.length <
      5
    ) {
      setError(
        "توضیحات نمونه‌کار خیلی کوتاه است.",
      );

      setSuccess(
        "",
      );

      return;
    }

    if (
      !imageUrl
    ) {
      setError(
        "تصویر نمونه‌کار الزامی است.",
      );

      setSuccess(
        "",
      );

      return;
    }

    setSaving(
      true,
    );

    clearMessages();

    try {
      const url =
        editing
          ? `/api/admin/portfolio/${encodeURIComponent(
              editor.id!,
            )}`
          : "/api/admin/portfolio";

      const method =
        editing
          ? "PATCH"
          : "POST";

      const response =
        await fetch(
          url,
          {
            method,

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                title,
                vehicle,

                category:
                  editor.category,

                description,

                imageUrl,
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
            "ذخیره نمونه‌کار انجام نشد.",
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
            ...current,
            savedItem,
          ],
        );
      }

      setEditor({
        ...emptyEditor,
      });

      setSuccess(
        data.message ??
          "نمونه‌کار با موفقیت ذخیره شد.",
      );

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "PORTFOLIO_SAVE_ERROR",
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

  async function toggleActive(
    item:
      PortfolioItem,
  ) {
    if (
      updatingId
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
          `/api/admin/portfolio/${encodeURIComponent(
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
            "تغییر وضعیت نمونه‌کار انجام نشد.",
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
              data.item!.id
                ? data.item!
                : currentItem,
          ),
      );

      setSuccess(
        data.item.isActive
          ? "نمونه‌کار در سایت فعال شد."
          : "نمونه‌کار از سایت مخفی شد.",
      );

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "PORTFOLIO_TOGGLE_ERROR",
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

  async function deleteItem(
    item:
      PortfolioItem,
  ) {
    if (
      updatingId
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `نمونه‌کار «${item.title}» حذف شود؟ این عملیات قابل بازگشت نیست.`,
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
          `/api/admin/portfolio/${encodeURIComponent(
            item.id,
          )}/delete`,
          {
            method:
              "POST",
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
            "حذف نمونه‌کار انجام نشد.",
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
        setEditor({
          ...emptyEditor,
        });
      }

      setSuccess(
        data.message ??
          "نمونه‌کار با موفقیت حذف شد.",
      );

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "PORTFOLIO_DELETE_ERROR",
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

  async function moveItem(
    index:
      number,
    direction:
      | "up"
      | "down",
  ) {
    if (
      updatingId
    ) {
      return;
    }

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

    const previousItems =
      [
        ...items,
      ];

    const nextItems =
      [
        ...items,
      ];

    [
      nextItems[index],
      nextItems[targetIndex],
    ] = [
      nextItems[targetIndex],
      nextItems[index],
    ];

    setItems(
      nextItems,
    );

    clearMessages();

    try {
      const response =
        await fetch(
          "/api/admin/portfolio/reorder",
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
                  nextItems.map(
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
        setItems(
          previousItems,
        );

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
        setItems(
          previousItems,
        );

        setError(
          data.message ??
            "ذخیره ترتیب نمونه‌کارها انجام نشد.",
        );

        return;
      }

      setItems(
        nextItems.map(
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

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "PORTFOLIO_REORDER_ERROR",
        requestError,
      );

      setItems(
        previousItems,
      );

      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "ذخیره ترتیب نمونه‌کارها با خطا مواجه شد.",
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
          نمونه‌کارها
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-secondary">
          نمونه‌های کارشناسی انجام‌شده را همراه با مشخصات خودرو،
          نتیجه بررسی و یک تصویر واقعی مدیریت کنید.
        </p>
      </div>

      <form
        onSubmit={
          handleSubmit
        }
        className="mt-7 rounded-[1.5rem] border border-line bg-surface p-5 shadow-card sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-ink">
              {editing
                ? "ویرایش نمونه‌کار"
                : "افزودن نمونه‌کار جدید"}
            </h2>

            <p className="mt-1 text-xs leading-6 text-ink-muted">
              اطلاعات نمونه‌کار و یک تصویر اصلی را وارد کنید.
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

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-black text-ink-secondary">
              عنوان نمونه‌کار
            </span>

            <input
              type="text"
              maxLength={
                150
              }
              value={
                editor.title
              }
              onChange={(
                event,
              ) =>
                updateEditor(
                  "title",
                  event.target.value,
                )
              }
              placeholder="مثلاً کارشناسی کامل دنا پلاس"
              className="h-12 w-full min-w-0 rounded-xl border border-line bg-input px-4 text-sm text-ink outline-none transition-colors placeholder:text-placeholder focus:border-focus focus:ring-4 focus:ring-brand-soft"
            />
          </label>

          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-black text-ink-secondary">
              خودرو
            </span>

            <input
              type="text"
              maxLength={
                120
              }
              value={
                editor.vehicle
              }
              onChange={(
                event,
              ) =>
                updateEditor(
                  "vehicle",
                  event.target.value,
                )
              }
              placeholder="مثلاً دنا پلاس توربو ۱۴۰۲"
              className="h-12 w-full min-w-0 rounded-xl border border-line bg-input px-4 text-sm text-ink outline-none transition-colors placeholder:text-placeholder focus:border-focus focus:ring-4 focus:ring-brand-soft"
            />
          </label>

          <label className="block min-w-0 md:max-w-md">
            <span className="mb-2 block text-xs font-black text-ink-secondary">
              نوع کارشناسی
            </span>

            <select
              value={
                editor.category
              }
              onChange={(
                event,
              ) =>
                updateEditor(
                  "category",
                  event.target.value,
                )
              }
              className="h-12 w-full rounded-xl border border-line bg-input px-4 text-sm font-bold text-ink outline-none transition-colors focus:border-focus focus:ring-4 focus:ring-brand-soft"
            >
              <option value="full">
                کارشناسی کامل
              </option>

              <option value="paint">
                کارشناسی رنگ
              </option>

              <option value="body">
                بدنه و شاسی
              </option>

              <option value="technical">
                کارشناسی فنی
              </option>
            </select>
          </label>
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-xs font-black text-ink-secondary">
            توضیحات و نتیجه کارشناسی
          </span>

          <textarea
            rows={
              5
            }
            maxLength={
              2000
            }
            value={
              editor.description
            }
            onChange={(
              event,
            ) =>
              updateEditor(
                "description",
                event.target.value,
              )
            }
            placeholder="شرح نتیجه کارشناسی، ایرادهای پیدا شده و نکات مهم خودرو..."
            className="w-full resize-none rounded-xl border border-line bg-input px-4 py-3 text-sm leading-8 text-ink outline-none transition-colors placeholder:text-placeholder focus:border-focus focus:ring-4 focus:ring-brand-soft"
          />
        </label>

        <div className="mt-6">
          <ImageUploadField
            title="تصویر نمونه‌کار"
            description="فقط یک تصویر اصلی برای این نمونه‌کار انتخاب کنید."
            value={
              editor.imageUrl
            }
            uploading={
              uploading
            }
            inputRef={
              imageInputRef
            }
            onSelect={
              handleImageInput
            }
            onRemove={() => {
              updateEditor(
                "imageUrl",
                "",
              );
            }}
          />

          <div className="mt-3 rounded-xl bg-surface-muted px-4 py-3">
            <p className="text-[11px] leading-6 text-ink-muted">
              فرمت‌های مجاز: JPG، PNG، WEBP و AVIF. حداکثر حجم فایل
              اولیه ۸ مگابایت است و تصویر پس از آپلود روی سرور بهینه
              می‌شود.
            </p>
          </div>
        </div>

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

        <button
          type="submit"
          disabled={
            saving ||
            uploading
          }
          className="mt-6 flex h-12 min-w-48 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-black text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-wait disabled:opacity-50"
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
          ) : (
            <>
              {editing ? (
                <Save
                  size={
                    18
                  }
                />
              ) : (
                <Plus
                  size={
                    18
                  }
                />
              )}

              {editing
                ? "ذخیره تغییرات"
                : "افزودن نمونه‌کار"}
            </>
          )}
        </button>
      </form>

      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-ink">
              نمونه‌کارهای ثبت‌شده
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
        </div>

        <div className="mt-4 space-y-4">
          {items.length ===
          0 ? (
            <div className="rounded-[1.5rem] border border-line bg-surface p-10 text-center shadow-card">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-ink-muted">
                <CarFront
                  size={
                    28
                  }
                />
              </div>

              <p className="mt-4 font-black text-ink">
                هنوز نمونه‌کاری ثبت نشده.
              </p>

              <p className="mt-2 text-xs leading-6 text-ink-muted">
                اولین نمونه‌کار را از فرم بالا اضافه کنید.
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
                  className="overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-card"
                >
                  <div className="grid lg:grid-cols-[260px_minmax(0,1fr)]">
                    <div className="relative min-h-56 overflow-hidden bg-surface-muted lg:min-h-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          item.afterImageUrl
                        }
                        alt={
                          item.title
                        }
                        loading="lazy"
                        className="h-full min-h-56 w-full object-cover"
                      />

                      <div className="absolute inset-x-3 top-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="rounded-full bg-surface px-3 py-1 text-[10px] font-black text-ink shadow-card">
                          {getCategoryLabel(
                            item.category,
                          )}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-black shadow-card ${
                            item.isActive
                              ? "bg-success-soft text-success"
                              : "bg-surface-muted text-ink-muted"
                          }`}
                        >
                          {item.isActive
                            ? "فعال"
                            : "غیرفعال"}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0 p-5 sm:p-6">
                      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-xs font-bold text-ink-secondary">
                            <CarFront
                              size={
                                14
                              }
                            />

                            {
                              item.vehicle
                            }
                          </span>

                          <h3 className="mt-4 text-lg font-black leading-8 text-ink">
                            {
                              item.title
                            }
                          </h3>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-8 text-ink-secondary">
                            {
                              item.description
                            }
                          </p>
                        </div>

                        <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-3 xl:w-72">
                          <ActionButton
                            label="بالا"
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
                          >
                            <ChevronUp
                              size={
                                15
                              }
                            />
                          </ActionButton>

                          <ActionButton
                            label="پایین"
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
                          >
                            <ChevronDown
                              size={
                                15
                              }
                            />
                          </ActionButton>

                          <ActionButton
                            label={
                              item.isActive
                                ? "غیرفعال"
                                : "فعال"
                            }
                            disabled={
                              Boolean(
                                updatingId,
                              )
                            }
                            onClick={() =>
                              void toggleActive(
                                item,
                              )
                            }
                          >
                            {updatingId ===
                            item.id ? (
                              <Loader2
                                size={
                                  15
                                }
                                className="animate-spin"
                              />
                            ) : item.isActive ? (
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
                          </ActionButton>

                          <ActionButton
                            label="ویرایش"
                            highlighted
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
                          >
                            <Pencil
                              size={
                                15
                              }
                            />
                          </ActionButton>

                          <ActionButton
                            label="حذف"
                            danger
                            disabled={
                              Boolean(
                                updatingId,
                              )
                            }
                            onClick={() =>
                              void deleteItem(
                                item,
                              )
                            }
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
                          </ActionButton>
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
    </div>
  );
}

function ImageUploadField({
  title,
  description,
  value,
  uploading,
  inputRef,
  onSelect,
  onRemove,
}: {
  title:
    string;

  description:
    string;

  value:
    string;

  uploading:
    boolean;

  inputRef:
    RefObject<HTMLInputElement | null>;

  onSelect:
    (
      event:
        ChangeEvent<HTMLInputElement>,
    ) => void;

  onRemove:
    () => void;
}) {
  return (
    <div className="max-w-2xl overflow-hidden rounded-[1.5rem] border border-line bg-surface-muted">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black text-ink">
              {
                title
              }

              <span className="mr-1 text-danger">
                *
              </span>
            </p>

            <p className="mt-1 text-[11px] leading-6 text-ink-muted">
              {
                description
              }
            </p>
          </div>

          {value && (
            <button
              type="button"
              disabled={
                uploading
              }
              onClick={
                onRemove
              }
              aria-label={`حذف ${title}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-danger-soft text-danger transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <XCircle
                size={
                  17
                }
              />
            </button>
          )}
        </div>

        <input
          ref={
            inputRef
          }
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={
            uploading
          }
          onChange={
            onSelect
          }
          className="hidden"
        />

        {!value ? (
          <button
            type="button"
            disabled={
              uploading
            }
            onClick={() =>
              inputRef.current?.click()
            }
            className="mt-4 flex min-h-44 w-full flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-surface px-5 text-center transition-colors hover:bg-surface-hover disabled:cursor-wait disabled:opacity-50"
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
                  در حال آپلود و بهینه‌سازی...
                </span>
              </>
            ) : (
              <>
                <Upload
                  size={
                    28
                  }
                  className="text-brand-active"
                />

                <span className="mt-3 text-sm font-black text-ink">
                  انتخاب تصویر
                </span>

                <span className="mt-1 text-[11px] text-ink-muted">
                  برای انتخاب فایل کلیک کنید
                </span>
              </>
            )}
          </button>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                value
              }
              alt="پیش‌نمایش تصویر نمونه‌کار"
              className="aspect-[16/10] w-full object-cover"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 p-3">
              <span className="text-[11px] font-bold text-success">
                تصویر آماده است
              </span>

              <button
                type="button"
                disabled={
                  uploading
                }
                onClick={() =>
                  inputRef.current?.click()
                }
                className="flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-[11px] font-black text-ink transition-colors hover:bg-surface-hover"
              >
                <Upload
                  size={
                    14
                  }
                />

                تغییر تصویر
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  label,
  disabled,
  highlighted = false,
  danger = false,
  onClick,
  children,
}: {
  label:
    string;

  disabled:
    boolean;

  highlighted?:
    boolean;

  danger?:
    boolean;

  onClick:
    () => void;

  children:
    ReactNode;
}) {
  let className =
    "flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-black transition-colors disabled:cursor-not-allowed disabled:opacity-40";

  if (
    danger
  ) {
    className +=
      " border-danger bg-danger-soft text-danger hover:opacity-80";
  } else if (
    highlighted
  ) {
    className +=
      " border-brand-border bg-brand-soft text-brand-active hover:bg-surface-hover";
  } else {
    className +=
      " border-line bg-surface text-ink hover:bg-surface-hover";
  }

  return (
    <button
      type="button"
      disabled={
        disabled
      }
      onClick={
        onClick
      }
      className={
        className
      }
    >
      {
        children
      }

      {
        label
      }
    </button>
  );
}
