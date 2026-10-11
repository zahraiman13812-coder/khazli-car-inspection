import {
  NextResponse,
} from "next/server";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  MAX_PORTFOLIO_FILE_SIZE,
  savePortfolioImage,
} from "@/lib/portfolio-image-storage";

export const runtime =
  "nodejs";
  
export async function POST(
  request: Request,
) {
  try {
    /*
     * ===========================================
     * AUTH
     * ===========================================
     */

    const authenticated =
      await isAdminAuthenticated();

    if (
      !authenticated
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "دسترسی غیرمجاز است.",
        },
        {
          status:
            401,
        },
      );
    }

    /*
     * ===========================================
     * FILE
     * ===========================================
     */

    const formData =
      await request.formData();

    const uploadedFile =
      formData.get(
        "file",
      );

    if (
      !(uploadedFile instanceof File)
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "فایل تصویر ارسال نشده است.",
        },
        {
          status:
            400,
        },
      );
    }

    if (
      uploadedFile.size <=
      0
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "فایل انتخاب‌شده خالی است.",
        },
        {
          status:
            400,
        },
      );
    }

    if (
      uploadedFile.size >
      MAX_PORTFOLIO_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "حجم تصویر اولیه نباید بیشتر از ۸ مگابایت باشد.",
        },
        {
          status:
            400,
        },
      );
    }

    /*
     * ===========================================
     * OPTIMIZE + SAVE
     * ===========================================
     */

    const savedImage =
      await savePortfolioImage(
        uploadedFile,
      );

    return NextResponse.json(
      {
        ok:
          true,

        message:
          "تصویر با موفقیت بهینه و آپلود شد.",

        url:
          savedImage.url,

        image: {
          url:
            savedImage.url,

          width:
            savedImage.width,

          height:
            savedImage.height,

          size:
            savedImage.size,

          format:
            savedImage.format,
        },
      },
      {
        status:
          201,
      },
    );
  } catch (
    error
  ) {
    console.error(
      "PORTFOLIO_IMAGE_UPLOAD_ERROR",
      error,
    );

    /*
     * ===========================================
     * KNOWN VALIDATION ERRORS
     * ===========================================
     */

    if (
      error instanceof
      Error
    ) {
      switch (
        error.message
      ) {
        case "EMPTY_FILE":
          return NextResponse.json(
            {
              ok:
                false,

              message:
                "فایل انتخاب‌شده خالی است.",
            },
            {
              status:
                400,
            },
          );

        case "FILE_TOO_LARGE":
          return NextResponse.json(
            {
              ok:
                false,

              message:
                "حجم تصویر بیشتر از حد مجاز است.",
            },
            {
              status:
                400,
            },
          );

        case "INVALID_FILE_TYPE":
          return NextResponse.json(
            {
              ok:
                false,

              message:
                "فرمت تصویر مجاز نیست. JPG، PNG، WEBP یا AVIF انتخاب کنید.",
            },
            {
              status:
                400,
            },
          );

        case "INVALID_IMAGE":
          return NextResponse.json(
            {
              ok:
                false,

              message:
                "فایل ارسال‌شده یک تصویر معتبر نیست.",
            },
            {
              status:
                400,
            },
          );
      }
    }

    return NextResponse.json(
      {
        ok:
          false,

        message:
          "آپلود و پردازش تصویر با خطا مواجه شد.",
      },
      {
        status:
          500,
      },
    );
  }
}