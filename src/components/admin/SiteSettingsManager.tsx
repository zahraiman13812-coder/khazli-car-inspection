"use client";







import {



  Building2,



  Camera,



  CheckCircle2,



  Clock3,



  ExternalLink,



  ImagePlus,



  Loader2,



  MapPin,



  MessageCircle,



  Phone,



  Save,



  Trash2,



  TriangleAlert,



} from "lucide-react";







import Image from "next/image";







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



} from "react";







type SiteSettings = {



  businessName:



    string;







  description:



    string;







  phone:



    string;







  whatsappPhone:



    string;







  address:



    string;







  businessHours:



    string;







  instagramUrl:



    string;







  logoUrl:



    string;







  mapUrl:



    string;







  baladMapUrl:



    string;







  neshanMapUrl:



    string;



};







type ApiResponse = {



  ok:



    boolean;







  message?:



    string;







  settings?:



    SiteSettings;



};







type UploadResponse = {



  ok:



    boolean;







  message?:



    string;







  url?:



    string;



};








async function readApiResponse<
  T extends {
    ok: boolean;
    message?: string;
  },
>(
  response: Response,
): Promise<T> {
  const raw =
    await response.text();

  const contentType =
    response.headers.get(
      "content-type",
    ) ?? "";

  if (
    !contentType.includes(
      "application/json",
    )
  ) {
    console.error(
      "ADMIN_SETTINGS_NON_JSON_RESPONSE",
      {
        status:
          response.status,

        contentType,

        body:
          raw.slice(
            0,
            1000,
          ),
      },
    );

    return {
      ok: false,

      message:
        response.status ===
        404
          ? "مسیر API موردنیاز روی سرور پیدا نشد."
          : "پاسخ نامعتبر از سرور دریافت شد. لاگ سرور را بررسی کنید.",
    } as T;
  }

  try {
    return JSON.parse(
      raw,
    ) as T;
  } catch (
    parseError
  ) {
    console.error(
      "ADMIN_SETTINGS_JSON_PARSE_ERROR",
      {
        status:
          response.status,

        body:
          raw.slice(
            0,
            1000,
          ),

        error:
          parseError,
      },
    );

    return {
      ok: false,

      message:
        "پاسخ سرور قابل پردازش نیست.",
    } as T;
  }
}

function normalizeDigits(



  value: string,



) {



  const persian =



    "۰۱۲۳۴۵۶۷۸۹";







  const arabic =



    "٠١٢٣٤٥٦٧٨٩";







  return value



    .replace(



      /[۰-۹]/g,



      (



        digit,



      ) =>



        String(



          persian.indexOf(



            digit,



          ),



        ),



    )



    .replace(



      /[٠-٩]/g,



      (



        digit,



      ) =>



        String(



          arabic.indexOf(



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







export default function SiteSettingsManager({



  initialSettings,



}: {



  initialSettings:



    SiteSettings;



}) {



  const router =



    useRouter();







  const [



    form,



    setForm,



  ] =



    useState<SiteSettings>(



      initialSettings,



    );







  const [



    saving,



    setSaving,



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



    success,



    setSuccess,



  ] =



    useState(



      "",



    );







  const [



    uploadingLogo,



    setUploadingLogo,



  ] =



    useState(



      false,



    );







  const logoInputRef =



    useRef<HTMLInputElement | null>(



      null,



    );







  function updateField<



    Key extends keyof SiteSettings,



  >(



    key:



      Key,







    value:



      SiteSettings[Key],



  ) {



    setForm(



      (



        current,



      ) => ({



        ...current,







        [key]:



          value,



      }),



    );







    setError(



      "",



    );







    setSuccess(



      "",



    );



  }







  async function uploadLogo(



    file: File,



  ) {



    if (



      uploadingLogo



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



        "فرمت لوگو باید JPG، PNG، WEBP یا AVIF باشد.",



      );







      return;



    }







    if (



      file.size >



      5 *



        1024 *



        1024



    ) {



      setError(



        "حجم لوگو نباید بیشتر از ۵ مگابایت باشد.",



      );







      return;



    }







    setUploadingLogo(



      true,



    );







    setError(



      "",



    );







    setSuccess(



      "",



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



          "/api/admin/uploads/site-logo",



          {



            method:



              "POST",







            body,



          },



        );







      if (



        response.status ===



        401



      ) {



        router.replace(



          "/admin/login",



        );







        router.refresh();







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



            "آپلود لوگو انجام نشد.",



        );







        return;



      }







      setForm(



        (



          current,



        ) => ({



          ...current,







          logoUrl:



            data.url!,



        }),



      );







      setSuccess(



        "لوگو آپلود شد. برای نهایی شدن، تنظیمات را ذخیره کنید.",



      );



    } catch (



      uploadError



    ) {



      console.error(



        "UPLOAD_SITE_LOGO_ERROR",



        uploadError,



      );







      setError(



        "ارتباط با سرور برای آپلود لوگو برقرار نشد.",



      );



    } finally {



      setUploadingLogo(



        false,



      );







      if (



        logoInputRef.current



      ) {



        logoInputRef.current.value =



          "";



      }



    }



  }







  function handleLogoFile(



    event:



      ChangeEvent<HTMLInputElement>,



  ) {



    const file =



      event.target.files?.[0];







    if (



      file



    ) {



      void uploadLogo(



        file,



      );



    }



  }







  function removeLogo() {



    if (



      uploadingLogo



    ) {



      return;



    }







    setForm(



      (



        current,



      ) => ({



        ...current,







        logoUrl:



          "",



      }),



    );







    setError(



      "",



    );







    setSuccess(



      "لوگو از تنظیمات حذف شد. برای نهایی شدن، ذخیره تنظیمات را بزنید.",



    );



  }







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



          "/api/admin/settings",



          {



            method:



              "PATCH",







            headers: {



              "Content-Type":



                "application/json",



            },







            body:



              JSON.stringify(



                form,



              ),



          },



        );







      if (



        response.status ===



        401



      ) {



        router.replace(



          "/admin/login",



        );







        router.refresh();







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



            "ذخیره تنظیمات انجام نشد.",



        );







        return;



      }







      if (



        data.settings



      ) {



        setForm({



          businessName:



            data.settings.businessName,







          description:



            data.settings.description,







          phone:



            data.settings.phone,







          whatsappPhone:



            data.settings.whatsappPhone ??



            "",







          address:



            data.settings.address,







          businessHours:



            data.settings.businessHours,







          instagramUrl:



            data.settings.instagramUrl ??



            "",







          logoUrl:



            data.settings.logoUrl ??



            "",







          mapUrl:



            data.settings.mapUrl ??



            "",







          baladMapUrl:



            data.settings.baladMapUrl ??



            "",







          neshanMapUrl:



            data.settings.neshanMapUrl ??



            "",



        });



      }







      setSuccess(



        data.message ??



          "تنظیمات با موفقیت ذخیره شد.",



      );







      router.refresh();



    } catch (



      requestError



    ) {



      console.error(



        "SAVE_SITE_SETTINGS_ERROR",



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







  return (



    <div className="min-h-screen p-4 sm:p-6 lg:p-8">



      <div>



        <span className="text-sm font-black text-brand-active">



          مدیریت سایت



        </span>







        <h1 className="mt-2 text-3xl font-black text-ink">



          تنظیمات عمومی



        </h1>







        <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-secondary">



          اطلاعات تماس، آدرس، ساعات کاری و



          لینک‌های عمومی سایت را از این بخش



          مدیریت کنید.



        </p>



      </div>







      <form



        onSubmit={



          handleSubmit



        }



        className="mt-7 space-y-6"



      >



        {/* General */}



        <SettingsSection



          icon={



            <Building2



              size={21}



            />



          }



          title="اطلاعات مجموعه"



          description="نام و توضیح اصلی کسب‌وکار"



        >



          <div className="grid gap-5">



            <Field



              label="نام مجموعه"



              icon={



                <Building2



                  size={18}



                />



              }



            >



              <input



                type="text"



                maxLength={



                  120



                }



                value={



                  form.businessName



                }



                onChange={(



                  event,



                ) =>



                  updateField(



                    "businessName",



                    event



                      .target



                      .value,



                  )



                }



                className="h-12 w-full rounded-xl border border-line bg-input px-4 text-sm text-ink outline-none focus:border-focus focus:ring-4 focus:ring-brand-soft"



              />



            </Field>







            <Field



              label="توضیحات مجموعه"



              icon={



                <Building2



                  size={18}



                />



              }



            >



              <textarea



                rows={



                  4



                }



                maxLength={



                  500



                }



                value={



                  form.description



                }



                onChange={(



                  event,



                ) =>



                  updateField(



                    "description",



                    event



                      .target



                      .value,



                  )



                }



                className="w-full resize-none rounded-xl border border-line bg-input px-4 py-3 text-sm leading-7 text-ink outline-none focus:border-focus focus:ring-4 focus:ring-brand-soft"



              />



            </Field>



          </div>



        </SettingsSection>







        {/* Brand identity */}



        <SettingsSection



          icon={



            <ImagePlus



              size={21}



            />



          }



          title="لوگوی مجموعه"



          description="آپلود، پیش‌نمایش و تغییر لوگوی سایت"



        >



          <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">



            <div className="flex min-h-36 items-center justify-center overflow-hidden rounded-2xl border border-line bg-surface-muted p-5">



              {form.logoUrl ? (



                <Image



                  src={



                    form.logoUrl



                  }



                  alt={`لوگوی ${form.businessName}`}



                  width={360}



                  height={140}



                  unoptimized



                  className="max-h-24 w-auto max-w-full object-contain"



                />



              ) : (



                <div className="text-center">



                  <ImagePlus



                    size={30}



                    className="mx-auto text-ink-muted"



                  />







                  <p className="mt-3 text-xs font-black text-ink-secondary">



                    هنوز لوگویی ثبت نشده است



                  </p>



                </div>



              )}



            </div>







            <div>



              <input



                ref={



                  logoInputRef



                }



                type="file"



                accept="image/jpeg,image/png,image/webp,image/avif"



                onChange={



                  handleLogoFile



                }



                className="hidden"



              />







              <div className="flex flex-wrap gap-3">



                <button



                  type="button"



                  disabled={



                    uploadingLogo ||



                    saving



                  }



                  onClick={() =>



                    logoInputRef.current?.click()



                  }



                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-black text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-wait disabled:opacity-60"



                >



                  {uploadingLogo ? (



                    <Loader2



                      size={17}



                      className="animate-spin"



                    />



                  ) : (



                    <ImagePlus



                      size={17}



                    />



                  )}







                  {form.logoUrl



                    ? "تغییر لوگو"



                    : "آپلود لوگو"}



                </button>







                {form.logoUrl && (



                  <button



                    type="button"



                    disabled={



                      uploadingLogo ||



                      saving



                    }



                    onClick={



                      removeLogo



                    }



                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-danger bg-danger-soft px-4 text-sm font-black text-danger transition-opacity hover:opacity-80 disabled:opacity-50"



                  >



                    <Trash2



                      size={17}



                    />







                    حذف لوگو



                  </button>



                )}



              </div>







              <p className="mt-4 max-w-xl text-xs leading-7 text-ink-muted">



                فرمت‌های JPG، PNG، WEBP و AVIF تا ۵ مگابایت پشتیبانی می‌شوند. برای لوگوی شفاف، PNG یا WEBP پیشنهاد می‌شود. پس از آپلود یا حذف، دکمه «ذخیره تنظیمات» را بزنید.



              </p>



            </div>



          </div>



        </SettingsSection>







        {/* Contact */}



        <SettingsSection



          icon={



            <Phone



              size={21}



            />



          }



          title="اطلاعات تماس"



          description="شماره اصلی و واتساپ"



        >



          <div className="grid gap-5 md:grid-cols-2">



            <Field



              label="شماره تماس"



              icon={



                <Phone



                  size={18}



                />



              }



            >



              <input



                type="tel"



                dir="ltr"



                inputMode="numeric"



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



                className="h-12 w-full rounded-xl border border-line bg-input px-4 text-left text-sm text-ink outline-none focus:border-focus focus:ring-4 focus:ring-brand-soft"



              />



            </Field>







            <Field



              label="شماره واتساپ"



              optional



              icon={



                <MessageCircle



                  size={18}



                />



              }



            >



              <input



                type="tel"



                dir="ltr"



                inputMode="numeric"



                maxLength={



                  11



                }



                value={



                  form.whatsappPhone



                }



                onChange={(



                  event,



                ) =>



                  updateField(



                    "whatsappPhone",



                    sanitizePhone(



                      event



                        .target



                        .value,



                    ),



                  )



                }



                placeholder="09123456789"



                className="h-12 w-full rounded-xl border border-line bg-input px-4 text-left text-sm text-ink outline-none focus:border-focus focus:ring-4 focus:ring-brand-soft"



              />



            </Field>



          </div>



        </SettingsSection>







        {/* Location */}



        <SettingsSection



          icon={



            <MapPin



              size={21}



            />



          }



          title="آدرس و ساعات کاری"



          description="اطلاعات مراجعه حضوری"



        >



          <div className="grid gap-5">



            <Field



              label="آدرس"



              icon={



                <MapPin



                  size={18}



                />



              }



            >



              <textarea



                rows={



                  3



                }



                maxLength={



                  500



                }



                value={



                  form.address



                }



                onChange={(



                  event,



                ) =>



                  updateField(



                    "address",



                    event



                      .target



                      .value,



                  )



                }



                className="w-full resize-none rounded-xl border border-line bg-input px-4 py-3 text-sm leading-7 text-ink outline-none focus:border-focus focus:ring-4 focus:ring-brand-soft"



              />



            </Field>







            <Field



              label="ساعات کاری"



              icon={



                <Clock3



                  size={18}



                />



              }



            >



              <input



                type="text"



                maxLength={



                  200



                }



                value={



                  form.businessHours



                }



                onChange={(



                  event,



                ) =>



                  updateField(



                    "businessHours",



                    event



                      .target



                      .value,



                  )



                }



                placeholder="شنبه تا پنجشنبه، ۹ صبح تا ۸ شب"



                className="h-12 w-full rounded-xl border border-line bg-input px-4 text-sm text-ink outline-none focus:border-focus focus:ring-4 focus:ring-brand-soft"



              />



            </Field>



          </div>



        </SettingsSection>







        {/* Links */}

        <SettingsSection

          icon={

            <ExternalLink

              size={21}

            />

          }

          title="لینک‌ها"

          description="شبکه اجتماعی و لینک مسیریاب‌ها"

        >

          <div className="grid gap-5 md:grid-cols-2">

            <Field

              label="لینک اینستاگرام"

              optional

              icon={

                <Camera

                  size={18}

                />

              }

            >

              <input

                type="url"

                dir="ltr"

                value={

                  form.instagramUrl

                }

                onChange={(

                  event,

                ) =>

                  updateField(

                    "instagramUrl",

                    event.target.value,

                  )

                }

                placeholder="https://instagram.com/..."

                className="h-12 w-full rounded-xl border border-line bg-input px-4 text-left text-sm text-ink outline-none focus:border-focus focus:ring-4 focus:ring-brand-soft"

              />

            </Field>



            <Field

              label="لینک Google Maps"

              optional

              icon={

                <MapPin

                  size={18}

                />

              }

            >

              <input

                type="url"

                dir="ltr"

                value={

                  form.mapUrl

                }

                onChange={(

                  event,

                ) =>

                  updateField(

                    "mapUrl",

                    event.target.value,

                  )

                }

                placeholder="https://maps.app.goo.gl/..."

                className="h-12 w-full rounded-xl border border-line bg-input px-4 text-left text-sm text-ink outline-none focus:border-focus focus:ring-4 focus:ring-brand-soft"

              />

            </Field>



            <Field

              label="لینک بلد"

              optional

              icon={

                <MapPin

                  size={18}

                />

              }

            >

              <input

                type="url"

                dir="ltr"

                value={

                  form.baladMapUrl

                }

                onChange={(

                  event,

                ) =>

                  updateField(

                    "baladMapUrl",

                    event.target.value,

                  )

                }

                placeholder="https://balad.ir/..."

                className="h-12 w-full rounded-xl border border-line bg-input px-4 text-left text-sm text-ink outline-none focus:border-focus focus:ring-4 focus:ring-brand-soft"

              />

            </Field>



            <Field

              label="لینک نشان"

              optional

              icon={

                <MapPin

                  size={18}

                />

              }

            >

              <input

                type="url"

                dir="ltr"

                value={

                  form.neshanMapUrl

                }

                onChange={(

                  event,

                ) =>

                  updateField(

                    "neshanMapUrl",

                    event.target.value,

                  )

                }

                placeholder="https://nshn.ir/..."

                className="h-12 w-full rounded-xl border border-line bg-input px-4 text-left text-sm text-ink outline-none focus:border-focus focus:ring-4 focus:ring-brand-soft"

              />

            </Field>

          </div>



          <div className="mt-4 rounded-xl border border-line-soft bg-surface-muted p-4">

            <p className="text-xs font-black text-ink">

              راهنمای لینک نقشه

            </p>



            <p className="mt-2 text-xs leading-6 text-ink-muted">

              از داخل Google Maps، بلد و نشان موقعیت مجموعه را باز کنید و گزینه اشتراک‌گذاری را بزنید؛ لینک هر برنامه را در فیلد مربوط به خودش قرار دهید. در سایت، کاربر هنگام زدن «مسیریابی» می‌تواند برنامه موردنظرش را انتخاب کند.

            </p>

          </div>

        </SettingsSection>







        {/* Error */}



        {error && (



          <div



            role="alert"



            className="flex items-start gap-3 rounded-xl border border-danger bg-danger-soft p-4"



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



        {success && (



          <div



            role="status"



            className="flex items-start gap-3 rounded-xl border border-success bg-success-soft p-4"



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







        {/* Save */}



        <div className="sticky bottom-4 z-20 flex justify-end">



          <button



            type="submit"



            disabled={



              saving



            }



            className="flex h-12 min-w-44 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-black text-on-brand shadow-float transition-colors hover:bg-brand-hover disabled:cursor-wait disabled:opacity-60"



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



                <Save



                  size={



                    18



                  }



                />







                ذخیره تنظیمات



              </>



            )}



          </button>



        </div>



      </form>



    </div>



  );



}







function SettingsSection({



  icon,



  title,



  description,



  children,



}: {



  icon:



    ReactNode;







  title:



    string;







  description:



    string;







  children:



    ReactNode;



}) {



  return (



    <section className="rounded-[1.5rem] border border-line bg-surface p-5 shadow-card sm:p-6">



      <div className="flex items-start gap-3">



        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-active">



          {



            icon



          }



        </div>







        <div>



          <h2 className="font-black text-ink">



            {



              title



            }



          </h2>







          <p className="mt-1 text-xs leading-6 text-ink-muted">



            {



              description



            }



          </p>



        </div>



      </div>







      <div className="mt-6">



        {



          children



        }



      </div>



    </section>



  );



}







function Field({



  label,



  optional = false,



  icon,



  children,



}: {



  label:



    string;







  optional?:



    boolean;







  icon:



    ReactNode;







  children:



    ReactNode;



}) {



  return (



    <label className="block min-w-0">



      <div className="mb-2 flex items-center gap-2">



        <span className="text-brand-active">



          {



            icon



          }



        </span>







        <span className="text-xs font-black text-ink-secondary">



          {



            label



          }



        </span>







        {optional && (



          <span className="text-[10px] text-ink-muted">



            اختیاری



          </span>



        )}



      </div>







      {



        children



      }



    </label>



  );



}