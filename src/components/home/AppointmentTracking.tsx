"use client";



import {

  CalendarDays,

  CarFront,

  ClipboardCheck,

  Clock3,

  Loader2,

  Phone,

  Search,

  ShieldCheck,

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


import {
  APPOINTMENT_TRACKING_CODE_MAX_LENGTH,
  isValidAppointmentTrackingCode,
  normalizeAppointmentTrackingCode,
} from "@/lib/appointment-tracking-code";



/*

 * ============================================================

 * TYPES

 * ============================================================

 */



type TrackingMethod =

  | "code"

  | "identity";



type AppointmentResult = {

  trackingCode: string;



  fullName: string;



  phone: string;



  serviceId: string;



  date: string;



  time: string;



  carBrand: string;



  carModel: string;



  carYear:

    | string

    | null;



  status: string;

};



type TrackingResponse = {

  ok: boolean;



  code?: string;



  message?: string;



  appointments?: AppointmentResult[];

};



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



function sanitizeName(

  value: string,

) {

  return value.replace(

    /[^\p{L}\s\u200C]/gu,

    "",

  );

}



function sanitizeTrackingCode(

  value: string,

) {

  return normalizeAppointmentTrackingCode(
    value,
  ).slice(
    0,
    APPOINTMENT_TRACKING_CODE_MAX_LENGTH,
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



function formatDate(

  value: string,

) {

  const [

    year,

    month,

    day,

  ] = value

    .split("-")

    .map(Number);



  if (

    !year ||

    !month ||

    !day

  ) {

    return value;

  }



  const date =

    new Date(

      Date.UTC(

        year,

        month - 1,

        day,

        12,

      ),

    );



  return new Intl.DateTimeFormat(

    "fa-IR-u-ca-persian",

    {

      weekday:

        "long",



      year:

        "numeric",



      month:

        "long",



      day:

        "numeric",



      timeZone:

        "Asia/Tehran",

    },

  ).format(

    date,

  );

}



function getServiceLabel(

  value: string,

) {

  switch (

    value

  ) {

    case "paint":

      return "کارشناسی رنگ و بدنه";



    case "body":

      return "کارشناسی بدنه و شاسی";



    case "full":

      return "کارشناسی کامل خودرو";



    default:

      return "کارشناسی خودرو";

  }

}



function getStatusLabel(

  status: string,

) {

  switch (

    status

  ) {

    case "pending":

      return "در انتظار تأیید";



    case "confirmed":

      return "در انتظار";



    case "completed":

      return "انجام شده";



    case "cancelled":

      return "لغو شده";



    default:

      return status;

  }

}



function getStatusClasses(

  status: string,

) {

  switch (

    status

  ) {

    case "completed":

      return "bg-success-soft text-success";



    case "confirmed":

      return "bg-warning-soft text-warning";



    case "cancelled":

      return "bg-danger-soft text-danger";



    default:

      return "bg-warning-soft text-warning";

  }

}



/*

 * ============================================================

 * COMPONENT

 * ============================================================

 */



export default function AppointmentTracking() {

  const [

    method,

    setMethod,

  ] =

    useState<TrackingMethod>(

      "code",

    );



  const [

    trackingCode,

    setTrackingCode,

  ] =

    useState(

      "",

    );



  const [

    fullName,

    setFullName,

  ] =

    useState(

      "",

    );



  const [

    phone,

    setPhone,

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

    error,

    setError,

  ] =

    useState(

      "",

    );



  const [

    appointments,

    setAppointments,

  ] =

    useState<

      AppointmentResult[]

    >(

      [],

    );



  async function handleSubmit(

    event:

      FormEvent<HTMLFormElement>,

  ) {

    event.preventDefault();



    if (

      loading

    ) {

      return;

    }



    setError(

      "",

    );



    setAppointments(

      [],

    );



    /*

     * Code validation.

     */

    if (

      method === "code"

    ) {

      const normalized =

        normalizeAppointmentTrackingCode(
          trackingCode,
        );



      if (

        !isValidAppointmentTrackingCode(
          normalized,
        )

      ) {

        setError(

          "کد پیگیری واردشده معتبر نیست.",

        );



        return;

      }

    }



    /*

     * Identity validation.

     */

    if (

      method ===

      "identity"

    ) {

      if (

        !fullName.trim()

      ) {

        setError(

          "نام و نام خانوادگی را وارد کنید.",

        );



        return;

      }



      if (

        !/^09\d{9}$/.test(

          phone,

        )

      ) {

        setError(

          "شماره موبایل باید ۱۱ رقم باشد و با 09 شروع شود.",

        );



        return;

      }

    }



    setLoading(

      true,

    );



    try {

      const response =

        await fetch(

          "/api/appointments/track",

          {

            method:

              "POST",



            headers: {

              "Content-Type":

                "application/json",

            },



            body:

              JSON.stringify(

                method ===

                  "code"

                  ? {

                      method:

                        "code",



                      trackingCode:

                        normalizeAppointmentTrackingCode(
                          trackingCode,
                        ),

                    }

                  : {

                      method:

                        "identity",



                      fullName:

                        fullName.trim(),



                      phone,

                    },

              ),

          },

        );



      const data =

        (await response.json()) as TrackingResponse;



      if (

        !response.ok ||

        !data.ok

      ) {

        setError(

          data.message ??

            "نوبتی با این اطلاعات پیدا نشد.",

        );



        return;

      }



      setAppointments(

        Array.isArray(

          data.appointments,

        )

          ? data.appointments

          : [],

      );

    } catch (

      requestError

    ) {

      console.error(

        "TRACK_APPOINTMENT_ERROR",

        requestError,

      );



      setError(

        "ارتباط با سرور برقرار نشد. دوباره تلاش کنید.",

      );

    } finally {

      setLoading(

        false,

      );

    }

  }



  function changeMethod(

    next:

      TrackingMethod,

  ) {

    setMethod(

      next,

    );



    setError(

      "",

    );



    setAppointments(

      [],

    );

  }



  return (

    <section

      id="track-appointment"

      className="section-space scroll-mt-24 border-y border-line bg-surface-muted"

    >

      <div className="site-container">

        <div className="mx-auto max-w-3xl text-center">

          <span className="text-sm font-black text-brand-active">

            پیگیری نوبت

          </span>



          <h2 className="mt-4 text-3xl font-black leading-[1.4] text-ink sm:text-4xl">

            وضعیت نوبت خود را بررسی کنید

          </h2>



          <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-ink-secondary">

            با کد پیگیری یا با نام و شماره

            موبایل، اطلاعات نوبت ثبت‌شده را

            مشاهده کنید.

          </p>

        </div>



        <div className="mx-auto mt-10 max-w-3xl rounded-[1.75rem] border border-line bg-surface p-5 shadow-card sm:p-7">

          {/* Tabs */}

          <div className="grid grid-cols-2 rounded-2xl bg-surface-muted p-1">

            <button

              type="button"

              onClick={() =>

                changeMethod(

                  "code",

                )

              }

              className={`h-11 rounded-xl text-sm font-black transition-colors ${

                method ===

                "code"

                  ? "bg-surface text-ink shadow-card"

                  : "text-ink-muted"

              }`}

            >

              کد پیگیری

            </button>



            <button

              type="button"

              onClick={() =>

                changeMethod(

                  "identity",

                )

              }

              className={`h-11 rounded-xl text-sm font-black transition-colors ${

                method ===

                "identity"

                  ? "bg-surface text-ink shadow-card"

                  : "text-ink-muted"

              }`}

            >

              نام + شماره موبایل

            </button>

          </div>



          <form

            onSubmit={

              handleSubmit

            }

            className="mt-6"

          >

            {method ===

            "code" ? (

              <div>

                <label className="mb-2 block text-xs font-bold text-ink-secondary">

                  کد پیگیری

                </label>



                <div className="relative">

                  <ClipboardCheck

                    size={

                      19

                    }

                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted"

                  />



                  <input

                    type="text"

                    dir="ltr"

                    value={

                      trackingCode

                    }

                    maxLength={
                      APPOINTMENT_TRACKING_CODE_MAX_LENGTH
                    }

                    onChange={(

                      event,

                    ) =>

                      setTrackingCode(

                        sanitizeTrackingCode(

                          event

                            .target

                            .value,

                        ),

                      )

                    }

                    placeholder="KHZ-XXXXXX-XXXXXXXX"

                    className="h-12 w-full rounded-xl border border-line bg-input px-4 pr-12 text-left font-bold uppercase tracking-wider text-ink outline-none placeholder:text-placeholder focus:border-focus focus:ring-4 focus:ring-brand-soft"

                  />

                </div>

              </div>

            ) : (

              <div className="grid gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-xs font-bold text-ink-secondary">

                    نام و نام خانوادگی

                  </label>



                  <div className="relative">

                    <UserRound

                      size={

                        19

                      }

                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted"

                    />



                    <input

                      type="text"

                      value={

                        fullName

                      }

                      onChange={(

                        event,

                      ) =>

                        setFullName(

                          sanitizeName(

                            event

                              .target

                              .value,

                          ),

                        )

                      }

                      placeholder="مثلاً علی رضایی"

                      className="h-12 w-full rounded-xl border border-line bg-input px-4 pr-12 text-base text-ink outline-none placeholder:text-placeholder focus:border-focus focus:ring-4 focus:ring-brand-soft"

                    />

                  </div>

                </div>



                <div>

                  <label className="mb-2 block text-xs font-bold text-ink-secondary">

                    شماره موبایل

                  </label>



                  <div className="relative">

                    <Phone

                      size={

                        19

                      }

                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted"

                    />



                    <input

                      type="tel"

                      inputMode="numeric"

                      dir="ltr"

                      maxLength={

                        11

                      }

                      value={

                        phone

                      }

                      onChange={(

                        event,

                      ) =>

                        setPhone(

                          sanitizePhone(

                            event

                              .target

                              .value,

                          ),

                        )

                      }

                      placeholder="09123456789"

                      className="h-12 w-full rounded-xl border border-line bg-input px-4 pr-12 text-left text-base text-ink outline-none placeholder:text-placeholder focus:border-focus focus:ring-4 focus:ring-brand-soft"

                    />

                  </div>

                </div>

              </div>

            )}



            {error && (

              <div className="mt-4 flex items-start gap-3 rounded-xl border border-danger bg-danger-soft p-3">

                <TriangleAlert

                  size={

                    18

                  }

                  className="mt-0.5 shrink-0 text-danger"

                />



                <p className="text-xs font-bold leading-6 text-ink-secondary">

                  {

                    error

                  }

                </p>

              </div>

            )}



            <button

              type="submit"

              disabled={

                loading

              }

              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-black text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-wait disabled:opacity-60"

            >

              {loading ? (

                <>

                  <Loader2

                    size={

                      18

                    }

                    className="animate-spin"

                  />



                  در حال بررسی...

                </>

              ) : (

                <>

                  <Search

                    size={

                      18

                    }

                  />



                  پیگیری نوبت

                </>

              )}

            </button>

          </form>

        </div>



        {/* Results */}

        {appointments.length >

          0 && (

          <div className="mx-auto mt-6 max-w-3xl space-y-4">

            <p className="text-sm font-black text-ink">

              {toPersianDigits(

                String(

                  appointments.length,

                ),

              )}{" "}

              نوبت پیدا شد

            </p>



            {appointments.map(

              (

                appointment,

              ) => (

                <article

                  key={

                    appointment.trackingCode

                  }

                  className="rounded-[1.5rem] border border-line bg-surface p-5 shadow-card sm:p-6"

                >

                  <div className="flex flex-wrap items-start justify-between gap-3">

                    <div>

                      <h3 className="font-black text-ink">

                        {

                          appointment.fullName

                        }

                      </h3>



                      <p className="mt-1 text-sm font-bold text-ink-secondary">

                        {getServiceLabel(

                          appointment.serviceId,

                        )}

                      </p>

                    </div>



                    <span

                      className={`rounded-full px-3 py-1.5 text-xs font-black ${getStatusClasses(

                        appointment.status,

                      )}`}

                    >

                      {getStatusLabel(

                        appointment.status,

                      )}

                    </span>

                  </div>



                  <div className="mt-5 grid gap-3 sm:grid-cols-2">

                    <ResultItem

                      icon={

                        <CalendarDays

                          size={

                            18

                          }

                        />

                      }

                      label="تاریخ مراجعه"

                      value={formatDate(

                        appointment.date,

                      )}

                    />



                    <ResultItem

                      icon={

                        <Clock3

                          size={

                            18

                          }

                        />

                      }

                      label="ساعت"

                      value={toPersianDigits(

                        appointment.time,

                      )}

                    />



                    <ResultItem

                      icon={

                        <CarFront

                          size={

                            18

                          }

                        />

                      }

                      label="خودرو"

                      value={[

                        appointment.carBrand,

                        appointment.carModel,

                        appointment.carYear,

                      ]

                        .filter(

                          Boolean,

                        )

                        .join(

                          " ",

                        )}

                    />



                    <ResultItem

                      icon={

                        <Phone

                          size={

                            18

                          }

                        />

                      }

                      label="شماره موبایل"

                      value={

                        appointment.phone

                      }

                    />

                  </div>



                  <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-brand-border bg-brand-soft p-3">

                    <div>

                      <p className="text-[11px] font-bold text-ink-muted">

                        کد پیگیری

                      </p>



                      <p

                        dir="ltr"

                        className="mt-1 font-black tracking-wider text-ink"

                      >

                        {

                          appointment.trackingCode

                        }

                      </p>

                    </div>



                    <ShieldCheck

                      size={

                        21

                      }

                      className="text-brand-active"

                    />

                  </div>

                </article>

              ),

            )}

          </div>

        )}

      </div>

    </section>

  );

}



/*

 * ============================================================

 * RESULT ITEM

 * ============================================================

 */



function ResultItem({

  icon,

  label,

  value,

}: {

  icon:

    ReactNode;



  label:

    string;



  value:

    string;

}) {

  return (

    <div className="flex items-start gap-3 rounded-xl bg-surface-muted p-3">

      <div className="mt-0.5 shrink-0 text-brand-active">

        {

          icon

        }

      </div>



      <div className="min-w-0">

        <p className="text-[11px] text-ink-muted">

          {

            label

          }

        </p>



        <p className="mt-1 break-words text-sm font-black leading-6 text-ink">

          {

            value

          }

        </p>

      </div>

    </div>

  );

}