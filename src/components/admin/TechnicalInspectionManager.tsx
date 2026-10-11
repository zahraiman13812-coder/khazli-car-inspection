"use client";

import {
  Check,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";

import Image from "next/image";

import {
  useRef,
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

type PageData = {
  title: string;
  description: string;
  videoTitle: string;
  videoUrl: string;
  galleryTitle: string;
};

type GalleryImage = {
  id: string;
  imageUrl: string;

  title:
    | string
    | null;

  caption:
    | string
    | null;

  altText:
    | string
    | null;

  sortOrder: number;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};

type ImageForm = {
  imageUrl: string;
  title: string;
  caption: string;
  altText: string;
  sortOrder: string;
  isActive: boolean;
};

const EMPTY_IMAGE_FORM: ImageForm = {
  imageUrl: "",
  title: "",
  caption: "",
  altText: "",
  sortOrder: "0",
  isActive: true,
};

type ApiResponse = {
  ok: boolean;
  message?: string;
  imageUrl?: string;
  image?: GalleryImage;
};

async function readResponse(
  response: Response,
): Promise<ApiResponse> {
  const raw =
    await response.text();

  try {
    return JSON.parse(
      raw,
    ) as ApiResponse;
  } catch {
    return {
      ok: false,

      message:
        `پاسخ نامعتبر از سرور دریافت شد. HTTP ${response.status}`,
    };
  }
}

export default function TechnicalInspectionManager({
  initialPage,
  initialImages,
}: {
  initialPage:
    PageData;

  initialImages:
    GalleryImage[];
}) {
  const [
    page,
    setPage,
  ] =
    useState(
      initialPage,
    );

  const [
    images,
    setImages,
  ] =
    useState(
      initialImages,
    );

  const [
    imageForm,
    setImageForm,
  ] =
    useState<ImageForm>(
      EMPTY_IMAGE_FORM,
    );

  const [
    editingImageId,
    setEditingImageId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    savingPage,
    setSavingPage,
  ] =
    useState(false);

  const [
    savingImage,
    setSavingImage,
  ] =
    useState(false);

  const [
    uploading,
    setUploading,
  ] =
    useState(false);

  const [
    deletingId,
    setDeletingId,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  async function savePage(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      savingPage
    ) {
      return;
    }

    setSavingPage(
      true,
    );

    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          "/api/admin/technical-inspection",
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                page,
              ),
          },
        );

      const data =
        await readResponse(
          response,
        );

      if (
        !response.ok ||
        !data.ok
      ) {
        setError(
          data.message ??
            "ذخیره اطلاعات انجام نشد.",
        );

        return;
      }

      setSuccess(
        "اطلاعات صفحه بررسی فنی ذخیره شد.",
      );
    } catch (
      saveError
    ) {
      console.error(
        "SAVE_TECHNICAL_PAGE_ERROR",
        saveError,
      );

      setError(
        "ارتباط با سرور برقرار نشد.",
      );
    } finally {
      setSavingPage(
        false,
      );
    }
  }

  async function uploadImage(
    file: File,
  ) {
    setUploading(
      true,
    );

    setError("");

    try {
      const body =
        new FormData();

      body.append(
        "file",
        file,
      );

      const response =
        await fetch(
          "/api/admin/uploads/technical-inspection",
          {
            method:
              "POST",

            body,
          },
        );

      const data =
        await readResponse(
          response,
        );

      if (
        !response.ok ||
        !data.ok ||
        !data.imageUrl
      ) {
        setError(
          data.message ??
            "آپلود تصویر انجام نشد.",
        );

        return;
      }

      setImageForm(
        (
          current,
        ) => ({
          ...current,

          imageUrl:
            data.imageUrl ??
            "",
        }),
      );
    } finally {
      setUploading(
        false,
      );
    }
  }

  function handleImageFile(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (
      file
    ) {
      void uploadImage(
        file,
      );
    }
  }

  function resetImageForm() {
    setImageForm(
      EMPTY_IMAGE_FORM,
    );

    setEditingImageId(
      null,
    );

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  function editImage(
    item:
      GalleryImage,
  ) {
    setEditingImageId(
      item.id,
    );

    setImageForm({
      imageUrl:
        item.imageUrl,

      title:
        item.title ??
        "",

      caption:
        item.caption ??
        "",

      altText:
        item.altText ??
        "",

      sortOrder:
        String(
          item.sortOrder,
        ),

      isActive:
        item.isActive,
    });

    setError("");
    setSuccess("");
  }

  async function saveImage(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      savingImage ||
      uploading
    ) {
      return;
    }

    if (
      !imageForm.imageUrl
    ) {
      setError(
        "ابتدا تصویر را انتخاب کنید.",
      );

      return;
    }

    setSavingImage(
      true,
    );

    setError("");
    setSuccess("");

    try {
      const editing =
        Boolean(
          editingImageId,
        );

      const response =
        await fetch(
          editing
            ? `/api/admin/technical-inspection/images/${editingImageId}`
            : "/api/admin/technical-inspection/images",
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
                ...imageForm,

                sortOrder:
                  Number(
                    imageForm.sortOrder,
                  ) ||
                  0,
              }),
          },
        );

      const data =
        await readResponse(
          response,
        );

      if (
        !response.ok ||
        !data.ok ||
        !data.image
      ) {
        setError(
          data.message ??
            "ذخیره تصویر انجام نشد.",
        );

        return;
      }

      const saved =
        data.image;

      setImages(
        (
          current,
        ) => {
          const next =
            editing
              ? current.map(
                  (
                    item,
                  ) =>
                    item.id ===
                    saved.id
                      ? saved
                      : item,
                )
              : [
                  ...current,
                  saved,
                ];

          return next.sort(
            (
              a,
              b,
            ) =>
              a.sortOrder -
              b.sortOrder,
          );
        },
      );

      setSuccess(
        editing
          ? "تصویر ویرایش شد."
          : "تصویر به گالری اضافه شد.",
      );

      resetImageForm();
    } catch (
      saveError
    ) {
      console.error(
        "SAVE_TECHNICAL_IMAGE_ERROR",
        saveError,
      );

      setError(
        "ارتباط با سرور برقرار نشد.",
      );
    } finally {
      setSavingImage(
        false,
      );
    }
  }

  async function deleteImage(
    item:
      GalleryImage,
  ) {
    if (
      deletingId
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `تصویر «${item.title ?? "بدون عنوان"}» حذف شود؟`,
      );

    if (
      !confirmed
    ) {
      return;
    }

    setDeletingId(
      item.id,
    );

    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          `/api/admin/technical-inspection/images/${item.id}`,
          {
            method:
              "DELETE",
          },
        );

      const data =
        await readResponse(
          response,
        );

      if (
        !response.ok ||
        !data.ok
      ) {
        setError(
          data.message ??
            "حذف تصویر انجام نشد.",
        );

        return;
      }

      setImages(
        (
          current,
        ) =>
          current.filter(
            (
              image,
            ) =>
              image.id !==
              item.id,
          ),
      );

      if (
        editingImageId ===
        item.id
      ) {
        resetImageForm();
      }

      setSuccess(
        "تصویر حذف شد.",
      );
    } finally {
      setDeletingId(
        "",
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
          بررسی فنی
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-secondary">
          محتوای صفحه بررسی فنی، ویدیو
          و تصاویر خودروها را مدیریت کنید.
        </p>
      </div>

      {/* Main page content */}

      <form
        onSubmit={
          savePage
        }
        className="mt-7 rounded-[1.5rem] border border-line bg-surface p-5 shadow-card sm:p-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-active">
            <Video
              size={18}
            />
          </div>

          <div>
            <h2 className="font-black text-ink">
              محتوای اصلی صفحه
            </h2>

            <p className="mt-1 text-xs text-ink-muted">
              متن و ویدیوی صفحه بررسی فنی
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <div>
            <label className="text-xs font-black text-ink">
              عنوان صفحه
            </label>

            <input
              value={
                page.title
              }
              onChange={(
                event,
              ) =>
                setPage(
                  (
                    current,
                  ) => ({
                    ...current,

                    title:
                      event.target.value,
                  }),
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-line bg-input px-4 text-sm text-ink outline-none focus:border-focus focus:ring-4 focus:ring-brand-soft"
            />
          </div>

          <div>
            <label className="text-xs font-black text-ink">
              توضیحات صفحه
            </label>

            <textarea
              value={
                page.description
              }
              rows={7}
              onChange={(
                event,
              ) =>
                setPage(
                  (
                    current,
                  ) => ({
                    ...current,

                    description:
                      event.target.value,
                  }),
                )
              }
              className="mt-2 w-full resize-y rounded-xl border border-line bg-input px-4 py-3 text-sm leading-7 text-ink outline-none focus:border-focus focus:ring-4 focus:ring-brand-soft"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="text-xs font-black text-ink">
                عنوان بخش ویدیو
              </label>

              <input
                value={
                  page.videoTitle
                }
                onChange={(
                  event,
                ) =>
                  setPage(
                    (
                      current,
                    ) => ({
                      ...current,

                      videoTitle:
                        event.target.value,
                    }),
                  )
                }
                className="mt-2 h-11 w-full rounded-xl border border-line bg-input px-4 text-sm text-ink outline-none focus:border-focus"
              />
            </div>

            <div>
              <label className="text-xs font-black text-ink">
                لینک ویدیو
              </label>

              <input
                dir="ltr"
                type="url"
                value={
                  page.videoUrl
                }
                placeholder="https://www.aparat.com/v/..."
                onChange={(
                  event,
                ) =>
                  setPage(
                    (
                      current,
                    ) => ({
                      ...current,

                      videoUrl:
                        event.target.value,
                    }),
                  )
                }
                className="mt-2 h-11 w-full rounded-xl border border-line bg-input px-4 text-left text-sm text-ink outline-none focus:border-focus"
              />

              <p className="mt-1 text-[10px] text-ink-muted">
                لینک آپارات، یوتیوب یا فایل مستقیم MP4/WebM
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-ink">
              عنوان گالری تصاویر
            </label>

            <input
              value={
                page.galleryTitle
              }
              onChange={(
                event,
              ) =>
                setPage(
                  (
                    current,
                  ) => ({
                    ...current,

                    galleryTitle:
                      event.target.value,
                  }),
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-line bg-input px-4 text-sm text-ink outline-none focus:border-focus"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={
            savingPage
          }
          className="mt-6 flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-black text-on-brand hover:bg-brand-hover disabled:opacity-50"
        >
          {savingPage ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <Check
              size={17}
            />
          )}

          ذخیره اطلاعات
        </button>
      </form>

      {/* Gallery editor */}

      <form
        onSubmit={
          saveImage
        }
        className="mt-6 rounded-[1.5rem] border border-line bg-surface p-5 shadow-card sm:p-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-active">
            {editingImageId ? (
              <Pencil
                size={18}
              />
            ) : (
              <Plus
                size={18}
              />
            )}
          </div>

          <h2 className="font-black text-ink">
            {editingImageId
              ? "ویرایش تصویر"
              : "افزودن تصویر به گالری"}
          </h2>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">
            <input
              value={
                imageForm.title
              }
              placeholder="عنوان تصویر - اختیاری"
              onChange={(
                event,
              ) =>
                setImageForm(
                  (
                    current,
                  ) => ({
                    ...current,

                    title:
                      event.target.value,
                  }),
                )
              }
              className="h-11 w-full rounded-xl border border-line bg-input px-4 text-sm text-ink outline-none"
            />

            <textarea
              value={
                imageForm.caption
              }
              rows={4}
              placeholder="توضیح تصویر - اختیاری"
              onChange={(
                event,
              ) =>
                setImageForm(
                  (
                    current,
                  ) => ({
                    ...current,

                    caption:
                      event.target.value,
                  }),
                )
              }
              className="w-full rounded-xl border border-line bg-input px-4 py-3 text-sm leading-7 text-ink outline-none"
            />

            <input
              value={
                imageForm.altText
              }
              placeholder="متن جایگزین تصویر - اختیاری"
              onChange={(
                event,
              ) =>
                setImageForm(
                  (
                    current,
                  ) => ({
                    ...current,

                    altText:
                      event.target.value,
                  }),
                )
              }
              className="h-11 w-full rounded-xl border border-line bg-input px-4 text-sm text-ink outline-none"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="number"
                value={
                  imageForm.sortOrder
                }
                placeholder="ترتیب"
                onChange={(
                  event,
                ) =>
                  setImageForm(
                    (
                      current,
                    ) => ({
                      ...current,

                      sortOrder:
                        event.target.value,
                    }),
                  )
                }
                className="h-11 rounded-xl border border-line bg-input px-4 text-sm text-ink"
              />

              <label className="flex h-11 items-center justify-between rounded-xl border border-line bg-surface-muted px-4">
                <span className="text-sm font-black text-ink">
                  نمایش در سایت
                </span>

                <input
                  type="checkbox"
                  checked={
                    imageForm.isActive
                  }
                  onChange={(
                    event,
                  ) =>
                    setImageForm(
                      (
                        current,
                      ) => ({
                        ...current,

                        isActive:
                          event.target.checked,
                      }),
                    )
                  }
                />
              </label>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-line bg-surface-muted">
            {imageForm.imageUrl ? (
              <div className="relative aspect-[4/3]">
                <Image
                  src={
                    imageForm.imageUrl
                  }
                  alt="پیش‌نمایش"
                  fill
                  sizes="300px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center">
                <ImagePlus
                  size={30}
                  className="text-ink-muted"
                />
              </div>
            )}

            <div className="p-3">
              <input
                ref={
                  fileInputRef
                }
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleImageFile
                }
                className="hidden"
              />

              <button
                type="button"
                disabled={
                  uploading
                }
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface text-sm font-black text-ink"
              >
                {uploading ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Upload
                    size={16}
                  />
                )}

                انتخاب تصویر
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="submit"
            disabled={
              savingImage ||
              uploading
            }
            className="flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-black text-on-brand"
          >
            {savingImage ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Check
                size={16}
              />
            )}

            {editingImageId
              ? "ذخیره تغییرات"
              : "افزودن تصویر"}
          </button>

          {editingImageId && (
            <button
              type="button"
              onClick={
                resetImageForm
              }
              className="flex h-11 items-center gap-2 rounded-xl border border-line px-5 text-sm font-black text-ink"
            >
              <X
                size={16}
              />

              انصراف
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="mt-5 rounded-xl border border-danger bg-danger-soft p-4 text-sm font-bold text-danger">
          {
            error
          }
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-xl border border-success bg-success-soft p-4 text-sm font-bold text-success">
          {
            success
          }
        </div>
      )}

      {/* Existing images */}

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {images.map(
          (
            item,
          ) => (
            <article
              key={
                item.id
              }
              className="overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-card"
            >
              <div className="relative aspect-[4/3] bg-surface-muted">
                <Image
                  src={
                    item.imageUrl
                  }
                  alt={
                    item.altText ||
                    item.title ||
                    "تصویر خودرو"
                  }
                  fill
                  sizes="33vw"
                  className="object-cover"
                />
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-black text-ink">
                    {item.title ||
                      "بدون عنوان"}
                  </p>

                  <span
                    className={
                      item.isActive
                        ? "rounded-full bg-success-soft px-2 py-1 text-[10px] font-black text-success"
                        : "rounded-full bg-surface-muted px-2 py-1 text-[10px] font-black text-ink-muted"
                    }
                  >
                    {item.isActive
                      ? "فعال"
                      : "غیرفعال"}
                  </span>
                </div>

                {item.caption && (
                  <p className="mt-2 line-clamp-2 text-xs leading-6 text-ink-muted">
                    {
                      item.caption
                    }
                  </p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      editImage(
                        item,
                      )
                    }
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-line text-xs font-black text-ink"
                  >
                    <Pencil
                      size={14}
                    />

                    ویرایش
                  </button>

                  <button
                    type="button"
                    disabled={
                      deletingId ===
                      item.id
                    }
                    onClick={() =>
                      void deleteImage(
                        item,
                      )
                    }
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-danger bg-danger-soft text-xs font-black text-danger"
                  >
                    {deletingId ===
                    item.id ? (
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2
                        size={14}
                      />
                    )}

                    حذف
                  </button>
                </div>
              </div>
            </article>
          ),
        )}
      </div>
    </div>
  );
}