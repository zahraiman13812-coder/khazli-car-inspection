"use client";

import {
  Check,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  Wrench,
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

type EquipmentItem = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  altText: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  ok: boolean;
  message?: string;
  imageUrl?: string;
  item?: EquipmentItem;
};

type FormState = {
  name: string;
  description: string;
  altText: string;
  sortOrder: string;
  isActive: boolean;
  imageUrl: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  altText: "",
  sortOrder: "0",
  isActive: true,
  imageUrl: "",
};

async function readApiResponse(
  response: Response,
): Promise<ApiResponse> {
  const text =
    await response.text();

  try {
    return JSON.parse(
      text,
    ) as ApiResponse;
  } catch {
    return {
      ok: false,
      message:
        `پاسخ نامعتبر از سرور دریافت شد. HTTP ${response.status}`,
    };
  }
}

export default function EquipmentManager({
  initialItems,
}: {
  initialItems:
    EquipmentItem[];
}) {
  const [
    items,
    setItems,
  ] =
    useState(
      initialItems,
    );

  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      EMPTY_FORM,
    );

  const [
    editingId,
    setEditingId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    deletingId,
    setDeletingId,
  ] =
    useState("");

  const [
    uploading,
    setUploading,
  ] =
    useState(false);

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
      EquipmentItem | null
    >(
      null,
    );

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  function resetForm() {
    setForm(
      EMPTY_FORM,
    );

    setEditingId(
      null,
    );

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  function startEdit(
    item:
      EquipmentItem,
  ) {
    setEditingId(
      item.id,
    );

    setForm({
      name:
        item.name,

      description:
        item.description,

      altText:
        item.altText ??
        "",

      sortOrder:
        String(
          item.sortOrder,
        ),

      isActive:
        item.isActive,

      imageUrl:
        item.imageUrl,
    });

    setError("");
    setSuccess("");

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
    setUploading(
      true,
    );

    setError("");

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file,
      );

      const response =
        await fetch(
          "/api/admin/uploads/equipment",
          {
            method:
              "POST",

            body:
              formData,
          },
        );

      const data =
        await readApiResponse(
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

      setForm(
        (
          current,
        ) => ({
          ...current,

          imageUrl:
            data.imageUrl ??
            current.imageUrl,
        }),
      );
    } catch (
      uploadError
    ) {
      console.error(
        "EQUIPMENT_IMAGE_UPLOAD_ERROR",
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

  function handleFileChange(
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

    const name =
      form.name.trim();

    const description =
      form.description.trim();

    if (
      name.length <
      2
    ) {
      setError(
        "نام تجهیز را وارد کنید.",
      );

      return;
    }

    if (
      description.length <
      2
    ) {
      setError(
        "توضیحات تجهیز را وارد کنید.",
      );

      return;
    }

    if (
      !form.imageUrl
    ) {
      setError(
        "تصویر تجهیز را انتخاب کنید.",
      );

      return;
    }

    setSaving(
      true,
    );

    setError("");
    setSuccess("");

    try {
      const editing =
        Boolean(
          editingId,
        );

      const response =
        await fetch(
          editing
            ? `/api/admin/equipment/${editingId}`
            : "/api/admin/equipment",
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
                name,
                description,

                imageUrl:
                  form.imageUrl,

                altText:
                  form.altText.trim(),

                isActive:
                  form.isActive,

                sortOrder:
                  Number(
                    form.sortOrder,
                  ) ||
                  0,
              }),
          },
        );

      const data =
        await readApiResponse(
          response,
        );

      if (
        !response.ok ||
        !data.ok ||
        !data.item
      ) {
        setError(
          data.message ??
            "ذخیره تجهیز انجام نشد.",
        );

        return;
      }

      const savedItem =
        data.item;

      setItems(
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
                    savedItem.id
                      ? savedItem
                      : item,
                )
              : [
                  ...current,
                  savedItem,
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
          ? "تجهیز با موفقیت ویرایش شد."
          : "تجهیز با موفقیت اضافه شد.",
      );

      resetForm();
    } catch (
      saveError
    ) {
      console.error(
        "EQUIPMENT_SAVE_ERROR",
        saveError,
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

  async function confirmDelete() {
    if (
      !pendingDelete ||
      deletingId
    ) {
      return;
    }

    const item =
      pendingDelete;

    setDeletingId(
      item.id,
    );

    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          `/api/admin/equipment/${item.id}`,
          {
            method:
              "DELETE",
          },
        );

      const data =
        await readApiResponse(
          response,
        );

      if (
        !response.ok ||
        !data.ok
      ) {
        setError(
          data.message ??
            "حذف تجهیز انجام نشد.",
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
        editingId ===
        item.id
      ) {
        resetForm();
      }

      setPendingDelete(
        null,
      );

      setSuccess(
        "تجهیز با موفقیت حذف شد.",
      );
    } catch (
      deleteError
    ) {
      console.error(
        "EQUIPMENT_DELETE_ERROR",
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
        <div>
          <span className="text-sm font-black text-brand-active">
            مدیریت محتوا
          </span>

          <h1 className="mt-2 text-3xl font-black text-ink">
            تجهیزات
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-secondary">
            تجهیزات مورد استفاده در کارشناسی خودرو را اضافه، ویرایش یا حذف کنید.
          </p>
        </div>

        {/* Form */}

        <section className="mt-7 rounded-[1.5rem] border border-line bg-surface p-5 shadow-card sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-active">
              {editingId ? (
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
                {editingId
                  ? "ویرایش تجهیز"
                  : "افزودن تجهیز جدید"}
              </h2>

              <p className="mt-0.5 text-xs text-ink-muted">
                نام، تصویر و توضیحات تجهیز را وارد کنید.
              </p>
            </div>
          </div>

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-6"
          >
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-ink">
                    نام تجهیز
                  </label>

                  <input
                    type="text"
                    value={
                      form.name
                    }
                    maxLength={
                      120
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,

                          name:
                            event.target.value,
                        }),
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-line bg-input px-4 text-sm text-ink outline-none placeholder:text-placeholder focus:border-focus focus:ring-4 focus:ring-brand-soft"
                    placeholder="مثلاً دستگاه ضخامت‌سنج رنگ"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-ink">
                    توضیحات
                  </label>

                  <textarea
                    value={
                      form.description
                    }
                    maxLength={
                      3000
                    }
                    rows={
                      7
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,

                          description:
                            event.target.value,
                        }),
                      )
                    }
                    className="mt-2 w-full resize-y rounded-xl border border-line bg-input px-4 py-3 text-sm leading-7 text-ink outline-none placeholder:text-placeholder focus:border-focus focus:ring-4 focus:ring-brand-soft"
                    placeholder="توضیح دهید این تجهیز چه کاربردی در کارشناسی خودرو دارد..."
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-ink">
                    متن جایگزین تصویر
                  </label>

                  <input
                    type="text"
                    value={
                      form.altText
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,

                          altText:
                            event.target.value,
                        }),
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-line bg-input px-4 text-sm text-ink outline-none focus:border-focus focus:ring-4 focus:ring-brand-soft"
                    placeholder="اختیاری"
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
                        form.sortOrder
                      }
                      onChange={(
                        event,
                      ) =>
                        setForm(
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
                        form.isActive
                      }
                      onChange={(
                        event,
                      ) =>
                        setForm(
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
                  تصویر تجهیز
                </label>

                <div className="mt-2 overflow-hidden rounded-[1.25rem] border border-line bg-surface-muted">
                  {form.imageUrl ? (
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={
                          form.imageUrl
                        }
                        alt={
                          form.altText ||
                          form.name ||
                          "تصویر تجهیز"
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
                        هنوز تصویری انتخاب نشده است.
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
                        handleFileChange
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
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface text-sm font-black text-ink hover:bg-surface-hover disabled:opacity-50"
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

                      {form.imageUrl
                        ? "تغییر تصویر"
                        : "انتخاب تصویر"}
                    </button>

                    <p className="mt-2 text-center text-[10px] leading-5 text-ink-muted">
                      JPG، PNG یا WebP تا ۸ مگابایت
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-danger bg-danger-soft px-4 py-3 text-sm font-bold text-danger"
              >
                {
                  error
                }
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mt-5 rounded-xl border border-success bg-success-soft px-4 py-3 text-sm font-bold text-success"
              >
                {
                  success
                }
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={
                  saving ||
                  uploading
                }
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-black text-on-brand hover:bg-brand-hover disabled:opacity-50"
              >
                {saving ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Check
                    size={17}
                  />
                )}

                {editingId
                  ? "ذخیره تغییرات"
                  : "افزودن تجهیز"}
              </button>

              {editingId && (
                <button
                  type="button"
                  disabled={
                    saving
                  }
                  onClick={
                    resetForm
                  }
                  className="flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-5 text-sm font-black text-ink hover:bg-surface-hover"
                >
                  <X
                    size={16}
                  />

                  انصراف
                </button>
              )}
            </div>
          </form>
        </section>

        {/* List */}

        <section className="mt-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-ink">
                تجهیزات ثبت‌شده
              </h2>

              <p className="mt-1 text-xs text-ink-muted">
                تعداد:{" "}
                {new Intl.NumberFormat(
                  "fa-IR",
                ).format(
                  items.length,
                )}
              </p>
            </div>
          </div>

          {items.length ===
          0 ? (
            <div className="mt-5 rounded-[1.5rem] border border-line bg-surface p-8 text-center">
              <Wrench
                size={30}
                className="mx-auto text-ink-muted"
              />

              <p className="mt-4 font-black text-ink">
                هنوز تجهیزی ثبت نشده است.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {items.map(
                (
                  item,
                ) => (
                  <article
                    key={
                      item.id
                    }
                    className="overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-card"
                  >
                    <div className="grid sm:grid-cols-[180px_minmax(0,1fr)]">
                      <div className="relative aspect-[4/3] bg-surface-muted sm:aspect-auto sm:min-h-44">
                        <Image
                          src={
                            item.imageUrl
                          }
                          alt={
                            item.altText ||
                            item.name
                          }
                          fill
                          sizes="180px"
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-black text-ink">
                              {
                                item.name
                              }
                            </h3>

                            <span
                              className={
                                item.isActive
                                  ? "mt-2 inline-flex rounded-full bg-success-soft px-2.5 py-1 text-[10px] font-black text-success"
                                  : "mt-2 inline-flex rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-black text-ink-muted"
                              }
                            >
                              {item.isActive
                                ? "فعال"
                                : "غیرفعال"}
                            </span>
                          </div>

                          <span className="shrink-0 rounded-lg bg-surface-muted px-2.5 py-1 text-[10px] font-black text-ink-muted">
                            ترتیب{" "}
                            {new Intl.NumberFormat(
                              "fa-IR",
                            ).format(
                              item.sortOrder,
                            )}
                          </span>
                        </div>

                        <p className="mt-3 line-clamp-3 text-xs leading-6 text-ink-secondary">
                          {
                            item.description
                          }
                        </p>

                        <div className="mt-5 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              startEdit(
                                item,
                              )
                            }
                            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-surface text-xs font-black text-ink hover:bg-surface-hover"
                          >
                            <Pencil
                              size={15}
                            />

                            ویرایش
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setPendingDelete(
                                item,
                              )
                            }
                            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-danger bg-danger-soft text-xs font-black text-danger"
                          >
                            <Trash2
                              size={15}
                            />

                            حذف
                          </button>
                        </div>
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
            aria-label="بستن"
            className="absolute inset-0"
            onClick={() => {
              if (
                !deletingId
              ) {
                setPendingDelete(
                  null,
                );
              }
            }}
          />

          <div className="relative z-10 w-full max-w-md rounded-[1.5rem] border border-line bg-surface p-5 shadow-float">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-danger-soft text-danger">
              <Trash2
                size={20}
              />
            </div>

            <h3 className="mt-4 text-lg font-black text-ink">
              حذف تجهیز
            </h3>

            <p className="mt-2 text-sm leading-7 text-ink-secondary">
              آیا مطمئن هستید که «
              {
                pendingDelete.name
              }
              » حذف شود؟ تصویر آن نیز از سرور حذف خواهد شد.
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
                className="h-11 rounded-xl border border-line bg-surface text-sm font-black text-ink"
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
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-danger text-sm font-black text-on-brand disabled:opacity-50"
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

                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}