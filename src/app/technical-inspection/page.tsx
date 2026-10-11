import {

 CarFront,

 Play,

 Wrench,

} from "lucide-react";



import Image from "next/image";



import type {

 Metadata,

} from "next";



import Footer from "@/components/layout/Footer";

import Header from "@/components/layout/Header";



import {

 getSiteSettings,

} from "@/lib/site-settings";



import {

 getTechnicalInspectionPage,

} from "@/lib/technical-inspection";



export const dynamic =

 "force-dynamic";



export const metadata: Metadata = {
  title:
    "بررسی فنی خودرو",

  description:
    "بررسی فنی تخصصی خودرو، مشاهده ویدیوی کارشناسی و نمونه تصاویر بررسی خودرو در کارشناسی خودرو خزلی.",

  alternates: {
    canonical:
      "/technical-inspection",
  },

  openGraph: {
    type:
      "website",
    locale:
      "fa_IR",
    url:
      "/technical-inspection",
    title:
      "بررسی فنی خودرو",
    description:
      "بررسی فنی تخصصی خودرو، مشاهده ویدیوی کارشناسی و نمونه تصاویر بررسی خودرو در کارشناسی خودرو خزلی.",
    images: [
      {
        url:
          "/brand/logo.png",
        alt:
          "کارشناسی خودرو خزلی",
      },
    ],
  },

  twitter: {
    card:
      "summary",
    title:
      "بررسی فنی خودرو",
    description:
      "بررسی فنی تخصصی خودرو، مشاهده ویدیوی کارشناسی و نمونه تصاویر بررسی خودرو در کارشناسی خودرو خزلی.",
    images: [
      "/brand/logo.png",
    ],
  },
};



type VideoSource =
  | {
      type: "video";
      url: string;
      originalUrl: string;
    }
  | {
      type: "iframe";
      url: string;
      originalUrl: string;
    }
  | {
      type: "external";
      url: string;
      originalUrl: string;
    };

function extractVideoUrl(
  value: string,
) {
  const trimmed =
    value.trim();

  if (
    !trimmed
  ) {
    return "";
  }

  const iframeMatch =
    trimmed.match(
      /<iframe[^>]+src=["']([^"']+)["']/i,
    );

  const extracted =
    iframeMatch?.[1] ??
    trimmed;

  if (
    extracted.startsWith(
      "//",
    )
  ) {
    return `https:${extracted}`;
  }

  return extracted;
}

function isValidVideoId(
  value: string,
) {
  return /^[A-Za-z0-9_-]{5,}$/.test(
    value,
  );
}

function getVideoSource(
  value: string,
): VideoSource | null {
  const url =
    extractVideoUrl(
      value,
    );

  if (
    !url
  ) {
    return null;
  }

  if (
    /\.(mp4|webm|ogg|m4v)(?:[?#].*)?$/i.test(
      url,
    )
  ) {
    return {
      type:
        "video",

      url,

      originalUrl:
        url,
    };
  }

  let parsed:
    URL;

  try {
    parsed =
      new URL(
        url,
      );
  } catch {
    return null;
  }

  if (
    parsed.protocol !==
      "https:" &&
    parsed.protocol !==
      "http:"
  ) {
    return null;
  }

  const hostname =
    parsed.hostname
      .toLowerCase()
      .replace(
        /^www\./,
        "",
      );

  if (
    hostname ===
    "youtu.be"
  ) {
    const id =
      parsed.pathname
        .split("/")
        .filter(Boolean)[0];

    if (
      id &&
      isValidVideoId(
        id,
      )
    ) {
      return {
        type:
          "iframe",

        url:
          `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1`,

        originalUrl:
          url,
      };
    }
  }

  if (
    hostname ===
      "youtube.com" ||
    hostname ===
      "m.youtube.com" ||
    hostname ===
      "music.youtube.com" ||
    hostname ===
      "youtube-nocookie.com"
  ) {
    const queryId =
      parsed.searchParams.get(
        "v",
      );

    if (
      queryId &&
      isValidVideoId(
        queryId,
      )
    ) {
      return {
        type:
          "iframe",

        url:
          `https://www.youtube-nocookie.com/embed/${queryId}?rel=0&playsinline=1`,

        originalUrl:
          url,
      };
    }

    const parts =
      parsed.pathname
        .split("/")
        .filter(Boolean);

    const supportedPrefixes =
      new Set([
        "embed",
        "shorts",
        "live",
        "v",
      ]);

    if (
      parts.length >=
        2 &&
      supportedPrefixes.has(
        parts[0],
      ) &&
      isValidVideoId(
        parts[1],
      )
    ) {
      return {
        type:
          "iframe",

        url:
          `https://www.youtube-nocookie.com/embed/${parts[1]}?rel=0&playsinline=1`,

        originalUrl:
          url,
      };
    }
  }

  if (
    hostname ===
      "aparat.com" ||
    hostname.endsWith(
      ".aparat.com",
    )
  ) {
    const parts =
      parsed.pathname
        .split("/")
        .filter(Boolean);

    let hash:
      string | null =
      null;

    const videoIndex =
      parts.indexOf(
        "v",
      );

    if (
      videoIndex >=
        0 &&
      parts[
        videoIndex +
          1
      ]
    ) {
      hash =
        parts[
          videoIndex +
            1
        ];
    }

    if (
      !hash
    ) {
      const hashIndex =
        parts.indexOf(
          "videohash",
        );

      if (
        hashIndex >=
          0 &&
        parts[
          hashIndex +
            1
        ]
      ) {
        hash =
          parts[
            hashIndex +
              1
          ];
      }
    }

    hash ??=
      parsed.searchParams.get(
        "videohash",
      );

    if (
      hash &&
      isValidVideoId(
        hash,
      )
    ) {
      return {
        type:
          "iframe",

        url:
          `https://www.aparat.com/video/video/embed/videohash/${hash}/vt/frame?recom=none`,

        originalUrl:
          url,
      };
    }

    return {
      type:
        "external",

      url,

      originalUrl:
        url,
    };
  }

  return {
    type:
      "external",

    url,

    originalUrl:
      url,
  };
}


export default async function TechnicalInspectionPage() {

 const [

  settings,

  page,

 ] =

  await Promise.all([

   getSiteSettings(),

   getTechnicalInspectionPage(),

  ]);



 const video =

  page.videoUrl

   ? getVideoSource(

     page.videoUrl,

    )

   : null;



 return (

  <>

   <Header

    settings={

     settings

    }

   />



   <main className="min-h-screen bg-page">

    {/* Hero */}



    <section className="border-b border-line bg-surface">

     <div className="site-container py-12 sm:py-16 lg:py-20">

      <div className="mx-auto max-w-4xl text-center">

       <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-active">

        <Wrench

         size={23}

        />

       </div>



       <p className="mt-5 text-sm font-black text-brand-active">

        کارشناسی تخصصی

       </p>



       <h1 className="mt-3 text-3xl font-black leading-[1.5] text-ink sm:text-4xl lg:text-5xl">

        {

         page.title

        }

       </h1>



       <p className="mx-auto mt-5 max-w-3xl whitespace-pre-line text-sm leading-8 text-ink-secondary sm:text-base sm:leading-9">

        {

         page.description

        }

       </p>

      </div>

     </div>

    </section>



    {/* Video */}



    <section className="py-10 sm:py-14 lg:py-16">

     <div className="site-container">

      <div className="mx-auto max-w-5xl">

       <div className="mb-5 flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-active">

         <Play

          size={18}

         />

        </div>



        <h2 className="text-xl font-black text-ink sm:text-2xl">

         {

          page.videoTitle

         }

        </h2>

       </div>



       {video ? (

        <div className="overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-card">

         <div className="aspect-video bg-surface-muted">

          {video.type ===
          "video" ? (
           <video
            src={
             video.url
            }
            controls
            playsInline
            preload="metadata"
            className="h-full w-full bg-ink object-contain"
           >
            مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
           </video>
          ) : video.type ===
            "iframe" ? (
           <iframe
            src={
             video.url
            }
            title={
             page.videoTitle
            }
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-full w-full border-0"
           />
          ) : (
           <div className="flex h-full w-full items-center justify-center p-6">
            <div className="max-w-md text-center">
             <Play
              size={30}
              className="mx-auto text-ink-muted"
             />

             <p className="mt-3 text-sm font-bold leading-7 text-ink-secondary">
              این لینک امکان پخش مستقیم داخل سایت را ندارد.
             </p>

             <a
              href={
               video.url
              }
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-black text-on-brand transition-colors hover:bg-brand-hover"
             >
              باز کردن ویدیو
             </a>
            </div>
           </div>
          )}

         </div>

        </div>

       ) : (

        <div className="flex aspect-video items-center justify-center rounded-[1.5rem] border border-line bg-surface-muted">

         <div className="text-center">

          <Play

           size={30}

           className="mx-auto text-ink-muted"

          />



          <p className="mt-3 text-sm font-bold text-ink-muted">

           ویدیوی بررسی فنی

           به‌زودی اضافه می‌شود.

          </p>

         </div>

        </div>

       )}

      </div>

     </div>

    </section>



    {/* Gallery */}



    <section className="border-t border-line bg-surface-muted py-10 sm:py-14 lg:py-16">

     <div className="site-container">

      <div className="flex items-end justify-between gap-5">

       <div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-active">

         <CarFront

          size={19}

         />

        </div>



        <h2 className="mt-4 text-2xl font-black text-ink sm:text-3xl">

         {

          page.galleryTitle

         }

        </h2>



        <p className="mt-2 text-sm leading-7 text-ink-muted">

         نمونه‌هایی از بررسی

         بدنه و وضعیت خودروها.

        </p>

       </div>

      </div>



      {page.images.length >

      0 ? (

       <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

        {page.images.map(

         (

          item,

         ) => (

          <article

           key={

            item.id

           }

           className="overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-card"

          >

           <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">

            <Image

             src={

              item.imageUrl

             }

             alt={

              item.altText ||

              item.title ||

              "تصویر بررسی خودرو"

             }

             fill

             sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"

             className="object-cover transition-transform duration-300 hover:scale-[1.02]"

            />

           </div>



           {(item.title ||

            item.caption) && (

            <div className="p-5">

             {item.title && (

              <h3 className="font-black text-ink">

               {

                item.title

               }

              </h3>

             )}



             {item.caption && (

              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-ink-secondary">

               {

                item.caption

               }

              </p>

             )}

            </div>

           )}

          </article>

         ),

        )}

       </div>

      ) : (

       <div className="mt-7 rounded-[1.5rem] border border-line bg-surface p-8 text-center">

        <CarFront

         size={30}

         className="mx-auto text-ink-muted"

        />



        <p className="mt-4 font-black text-ink">

         هنوز تصویری ثبت نشده است.

        </p>

       </div>

      )}

     </div>

    </section>

   </main>



   <Footer

    settings={

     settings

    }

   />

  </>

 );

}