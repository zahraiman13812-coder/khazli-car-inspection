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
  title: string | null;
  caption: string | null;
  altText: string | null;
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

type ApiResponse = {
  ok: boolean;
  message?: string;
  imageUrl?: string;
  image?: GalleryImage;
};

const EMPTY_IMAGE_FORM: ImageForm = {
  imageUrl: "",
  title: "",
  caption: "",
  altText: "",
  sortOrder: "0",
  isActive: true,
};

async function readResponse(
  response: Response,
): Promise<ApiResponse> {
  const raw =
    await response.text();

  if (
    !raw
  ) {
    return {
      ok: false,
      message:
        `پاسخ خالی از سرور دریافت شد. HTTP ${response.status}`,
    };
  }

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

export default function BodyInspectionManager({
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
    useState<PageData>(
      initialPage,
    );

  const [
    images,
    setImages,
  ] =
    useState<GalleryImage[]>(
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

  const [
    pendingDelete,
    setPendingDelete,
  ] =
    useState<
      GalleryImage | null
    >(
      null,
    );

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  function clearMessages() {
    setError("");
    setSuccess("");
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
    item: GalleryImage,
  ) {
    clearMessages();

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

    window.scrollTo({
      top:
        document.body.scrollHeight /
        3,

      behavior:
        "smooth",
    });
  }

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

    clearMessages();

    if (
      page.title
        .trim()
        .length <
      2
    ) {
      setError(
        "عنوان صفحه را وارد کنید.",
      );

      return;
    }

    if (
      page.description
        .trim()
        .length <
      10
    ) {
      setError(
        "توضیحات صفحه کامل نیست.",
      );

      return;
    }

    if (
      page.videoTitle
        .trim()
        .length <
      2
    ) {
      setError(
        "عنوان بخش ویدیو را وارد کنید.",
      );

      return;
    }

    if (
      page.galleryTitle
        .trim()
        .length <
      2
    ) {
      setError(
        "عنوان گالری را وارد کنید.",
      );

      return;
    }

    setSavingPage(
      true,
    );

    try {
      const response =
        await fetch(
          "/api/admin/body-inspection",
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                title:
                  page.title.trim(),

                description:
                  page.description.trim(),

                videoTitle:
                  page.videoTitle.trim(),

                videoUrl:
                  page.videoUrl.trim(),

                galleryTitle:
                  page.galleryTitle.trim(),
              }),
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
        "اطلاعات صفحه بررسی بدنه با موفقیت ذخیره شد.",
      );
    } catch (
      saveError
    ) {
      console.error(
        "SAVE_BODY_INSPECTION_PAGE_ERROR",
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
    if (
      uploading
    ) {
      return;
    }

    clearMessages();

    setUploading(
      true,
    );

    try {
      const body =
        new FormData();

      body.append(
        "file",
        file,
      );

      const response =
        await fetch(
          "/api/admin/uploads/body-inspection",
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

      setSuccess(
        "تصویر با موفقیت آپلود شد. حالا اطلاعات آن را ذخیره کنید.",
      );
    } catch (
      uploadError
    ) {
      console.error(
        "BODY_INSPECTION_IMAGE_UPLOAD_ERROR",
        uploadError,
      );

      setError(
        "ارتباط با سرور برقرار نشد.",
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
      !file
    ) {
      return;
    }

    void uploadImage(
      file,
    );
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

    clearMessages();

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

    try {
      const editing =
        Boolean(
          editingImageId,
        );

      const endpoint =
        editing &&
        editingImageId
          ? `/api/admin/body-inspection/images/${editingImageId}`
          : "/api/admin/body-inspection/images";

      const response =
        await fetch(
          endpoint,
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
                imageUrl:
                  imageForm.imageUrl,

                title:
                  imageForm.title.trim(),

                caption:
                  imageForm.caption.trim(),

                altText:
                  imageForm.altText.trim(),

                sortOrder:
                  Number(
                    imageForm.sortOrder,
                  ) ||
                  0,

                isActive:
                  imageForm.isActive,
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

          return [
            ...next,
          ].sort(
            (
              first,
              second,
            ) => {
              if (
                first.sortOrder !==
                second.sortOrder
              ) {
                return (
                  first.sortOrder -
                  second.sortOrder
                );
              }

              return second.createdAt.localeCompare(
                first.createdAt,
              );
            },
          );
        },
      );

      setSuccess(
        editing
          ? "تصویر با موفقیت ویرایش شد."
          : "تصویر با موفقیت به گالری اضافه شد.",
      );

      resetImageForm();
    } catch (
      saveError
    ) {
      console.error(
        "SAVE_BODY_INSPECTION_IMAGE_ERROR",
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

  async function confirmDelete() {
    if (
      !pendingDelete ||
      deletingId
    ) {
      return;
    }

    const item =
      pendingDelete;

    clearMessages();

    setDeletingId(
      item.id,
    );

    try {
      const response =
        await fetch(
          `/api/admin/body-inspection/images/${item.id}`,
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

      setPendingDelete(
        null,
      );

      setSuccess(
        "تصویر با موفقیت حذف شد.",
      );
    } catch (
      deleteError
    ) {
      console.error(
        "DELETE_BODY_INSPECTION_IMAGE_ERROR",
        deleteError,
      );

      setError(
        "ارتباط با سرور برقرار نشد.",
      );
    } finally {
      setDeletingId(
        "",
      );
    }
  }

  return (
    <>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        {/* Header */}

        <div>
          <span className="text-sm font-black text-brand-active">
            مدیریت محتوا
          </span>

          <h1 className="mt-2 text-3xl font-black text-ink sm:text-4xl">
            بررسی بدنه
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-secondary">
            عنوان، توضیحات، ویدیو و
            تصاویر صفحه بررسی بدنه
            خودرو را مدیریت کنید.
          </p>
        </div>

        {/* Messages */}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-danger bg-danger-soft px-4 py-3 text-sm font-bold leading-7 text-danger"
          >
            {
              error
            }
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-success bg-success-soft px-4 py-3 text-sm font-bold leading-7 text-success"
          >
            {
              success
            }
          </div>
        )}

        {/* Main content */}

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

              <p className="mt-1 text-xs leading-6 text-ink-muted">
                عنوان، توضیحات و ویدیوی
                بررسی بدنه
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5">
            <div>
              <label className="text-xs font-black text-ink">
                عنوان صفحه
              </label>

              <input
                type="text"
                maxLength={160}
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
                className="mt-2 h-11 w-full rounded-xl border border-line bg-input px-4 text-sm text-ink outline-none placeholder:text-placeholder focus:border-focus focus:ring-4 focus:ring-brand-soft"
                placeholder="بررسی بدنه خودرو"
              />
            </div>

            <div>
              <label className="text-xs font-black text-ink">
                توضیحات صفحه
              </label>

              <textarea
                rows={7}
                maxLength={5000}
                value={
                  page.description
                }
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
                className="mt-2 w-full resize-y rounded-xl border border-line bg-input px-4 py-3 text-sm leading-8 text-ink outline-none placeholder:text-placeholder focus:border-focus focus:ring-4 focus:ring-brand-soft"
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <label className="text-xs font-black text-ink">
                  عنوان بخش ویدیو
                </label>

                <input
                  type="text"
                  maxLength={160}
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
                  className="mt-2 h-11 w-full rounded-xl border border-line bg-input px-4 text-sm text-ink outline-none focus:border-focus focus:ring-4 focus:ring-brand-soft"
                />
              </div>

              <div>
                <label className="text-xs font-black text-ink">
                  لینک ویدیو
                </label>

                <input
                  dir="ltr"
                  type="url"
                  maxLength={1000}
                  value={
                    page.videoUrl
                  }
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
                  placeholder="https://www.aparat.com/v/..."
                  className="mt-2 h-11 w-full rounded-xl border border-line bg-input px-4 text-left text-sm text-ink outline-none placeholder:text-placeholder focus:border-focus focus:ring-4 focus:ring-brand-soft"
                />

                <p className="mt-2 text-[10px] leading-5 text-ink-muted">
                  لینک آپارات، یوتیوب یا
                  فایل مستقیم MP4 / WebM
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-ink">
                عنوان بخش تصاویر
              </label>

              <input
                type="text"
                maxLength={160}
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
                className="mt-2 h-11 w-full rounded-xl border border-line bg-input px-4 text-sm text-ink outline-none focus:border-focus focus:ring-4 focus:ring-brand-soft"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={
              savingPage
            }
            className="mt-6 flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-black text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-wait disabled:opacity-50"
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

            ذخیره اطلاعات صفحه
          </button>
        </form>

        {/* Gallery form */}

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

            <div>
              <h2 className="font-black text-ink">
                {editingImageId
                  ? "ویرایش تصویر گالری"
                  : "افزودن تصویر جدید"}
              </h2>

              <p className="mt-1 text-xs leading-6 text-ink-muted">
                تصاویر نمونه بررسی رنگ،
                شاسی و بدنه خودرو
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-ink">
                  عنوان تصویر
                </label>

                <input
                  type="text"
                  maxLength={160}
                  value={
                    imageForm.title
                  }
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
                  placeholder="مثلاً بررسی رنگ درب خودرو"
                  className="mt-2 h-11 w-full rounded-xl border border-line bg-input px-4 text-sm text-ink outline-none placeholder:text-placeholder focus:border-focus"
                />
              </div>

              <div>
                <label className="text-xs font-black text-ink">
                  توضیحات تصویر
                </label>

                <textarea
                  rows={4}
                  maxLength={1500}
                  value={
                    imageForm.caption
                  }
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
                  placeholder="توضیح کوتاه درباره این تصویر..."
                  className="mt-2 w-full resize-y rounded-xl border border-line bg-input px-4 py-3 text-sm leading-7 text-ink outline-none placeholder:text-placeholder focus:border-focus"
                />
              </div>

              <div>
                <label className="text-xs font-black text-ink">
                  متن جایگزین تصویر
                </label>

                <input
                  type="text"
                  maxLength={250}
                  value={
                    imageForm.altText
                  }
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
                  placeholder="اختیاری؛ برای دسترس‌پذیری و SEO"
                  className="mt-2 h-11 w-full rounded-xl border border-line bg-input px-4 text-sm text-ink outline-none placeholder:text-placeholder focus:border-focus"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-black text-ink">
                    ترتیب نمایش
                  </label>

                  <input
                    type="number"
                    value={
                      imageForm.sortOrder
                    }
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
                    className="mt-2 h-11 w-full rounded-xl border border-line bg-input px-4 text-sm text-ink outline-none focus:border-focus"
                  />
                </div>

                <label className="mt-6 flex h-11 cursor-pointer items-center justify-between rounded-xl border border-line bg-surface-muted px-4">
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
                    className="h-4 w-4"
                  />
                </label>
              </div>
            </div>

            {/* Image */}

            <div>
              <label className="text-xs font-black text-ink">
                تصویر
              </label>

              <div className="mt-2 overflow-hidden rounded-[1.25rem] border border-line bg-surface-muted">
                {imageForm.imageUrl ? (
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={
                        imageForm.imageUrl
                      }
                      alt={
                        imageForm.altText ||
                        imageForm.title ||
                        "پیش‌نمایش تصویر"
                      }
                      fill
                      sizes="320px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] flex-col items-center justify-center p-6 text-center">
                    <ImagePlus
                      size={30}
                      className="text-ink-muted"
                    />

                    <p className="mt-3 text-xs font-bold text-ink-muted">
                      هنوز تصویری انتخاب نشده
                      است.
                    </p>
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
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface text-sm font-black text-ink transition-colors hover:bg-surface-hover disabled:cursor-wait disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Upload
                        size={17}
                      />
                    )}

                    {imageForm.imageUrl
                      ? "تغییر تصویر"
                      : "انتخاب تصویر"}
                  </button>

                  <p className="mt-2 text-center text-[10px] leading-5 text-ink-muted">
                    JPG، PNG یا WebP تا ۸
                    مگابایت
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={
                savingImage ||
                uploading
              }
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-black text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-wait disabled:opacity-50"
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
                : "افزودن به گالری"}
            </button>

            {editingImageId && (
              <button
                type="button"
                disabled={
                  savingImage
                }
                onClick={
                  resetImageForm
                }
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-5 text-sm font-black text-ink transition-colors hover:bg-surface-hover"
              >
                <X
                  size={16}
                />

                انصراف
              </button>
            )}
          </div>
        </form>

        {/* Gallery */}

        <section className="mt-7">
          <div>
            <h2 className="text-lg font-black text-ink">
              تصاویر ثبت‌شده
            </h2>

            <p className="mt-1 text-xs text-ink-muted">
              تعداد:{" "}
              {new Intl.NumberFormat(
                "fa-IR",
              ).format(
                images.length,
              )}
            </p>
          </div>

          {images.length ===
          0 ? (
            <div className="mt-5 rounded-[1.5rem] border border-line bg-surface p-10 text-center">
              <ImagePlus
                size={30}
                className="mx-auto text-ink-muted"
              />

              <p className="mt-4 font-black text-ink">
                هنوز تصویری به گالری
                بررسی بدنه اضافه نشده است.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                          "تصویر بررسی بدنه"
                        }
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-black text-ink">
                            {item.title ||
                              "بدون عنوان"}
                          </h3>

                          <p className="mt-1 text-[10px] font-bold text-ink-muted">
                            ترتیب نمایش:{" "}
                            {new Intl.NumberFormat(
                              "fa-IR",
                            ).format(
                              item.sortOrder,
                            )}
                          </p>
                        </div>

                        <span
                          className={
                            item.isActive
                              ? "shrink-0 rounded-full bg-success-soft px-2.5 py-1 text-[10px] font-black text-success"
                              : "shrink-0 rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-black text-ink-muted"
                          }
                        >
                          {item.isActive
                            ? "فعال"
                            : "غیرفعال"}
                        </span>
                      </div>

                      {item.caption && (
                        <p className="mt-3 line-clamp-3 text-xs leading-6 text-ink-secondary">
                          {
                            item.caption
                          }
                        </p>
                      )}

                      <div className="mt-5 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            editImage(
                              item,
                            )
                          }
                          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-surface text-xs font-black text-ink transition-colors hover:bg-surface-hover"
                        >
                          <Pencil
                            size={14}
                          />

                          ویرایش
                        </button>

                        <button
                          type="button"
                          disabled={
                            Boolean(
                              deletingId,
                            )
                          }
                          onClick={() =>
                            setPendingDelete(
                              item,
                            )
                          }
                          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-danger bg-danger-soft text-xs font-black text-danger disabled:opacity-50"
                        >
                          <Trash2
                            size={14}
                          />

                          حذف
                        </button>
                      </div>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </section>
      </div>

      {/* Delete modal */}

      {pendingDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-overlay p-4">
          <button
            type="button"
            aria-label="بستن پنجره حذف"
            onClick={() => {
              if (
                !deletingId
              ) {
                setPendingDelete(
                  null,
                );
              }
            }}
            className="absolute inset-0"
          />

          <div className="relative z-10 w-full max-w-md rounded-[1.5rem] border border-line bg-surface p-5 shadow-float sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-danger-soft text-danger">
              <Trash2
                size={20}
              />
            </div>

            <h3 className="mt-4 text-lg font-black text-ink">
              حذف تصویر
            </h3>

            <p className="mt-2 text-sm leading-7 text-ink-secondary">
              آیا مطمئن هستید که این تصویر
              از گالری بررسی بدنه حذف شود؟
              فایل تصویر نیز از سرور حذف
              خواهد شد.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={
                  Boolean(
                    deletingId,
                  )
                }
                onClick={() =>
                  setPendingDelete(
                    null,
                  )
                }
                className="h-11 rounded-xl border border-line bg-surface text-sm font-black text-ink transition-colors hover:bg-surface-hover disabled:opacity-50"
              >
                انصراف
              </button>

              <button
                type="button"
                disabled={
                  Boolean(
                    deletingId,
                  )
                }
                onClick={() =>
                  void confirmDelete()
                }
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-danger text-sm font-black text-on-brand disabled:cursor-wait disabled:opacity-50"
              >
                {deletingId ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2
                    size={16}
                  />
                )}

                حذف تصویر
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}