import {
  NextResponse,
} from "next/server";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  MAX_ARTICLE_IMAGE_SIZE,
  saveArticleImage,
} from "@/lib/article-image-storage";

export const runtime =
  "nodejs";

export async function POST(
  request: Request,
) {
  try {
    const authenticated =
      await isAdminAuthenticated();

    if (
      !authenticated
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "دسترسی غیرمجاز است.",
        },
        {
          status: 401,
        },
      );
    }

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
          ok: false,
          message:
            "فایل تصویر ارسال نشده است.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      uploadedFile.size >
      MAX_ARTICLE_IMAGE_SIZE
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "حجم تصویر نباید بیشتر از ۸ مگابایت باشد.",
        },
        {
          status: 400,
        },
      );
    }

    const image =
      await saveArticleImage(
        uploadedFile,
      );

    return NextResponse.json(
      {
        ok: true,

        message:
          "کاور با موفقیت آپلود و بهینه شد.",

        url:
          image.url,

        image,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "ARTICLE_UPLOAD_ERROR",
      error,
    );

    if (
      error instanceof
      Error
    ) {
      if (
        error.message ===
        "FILE_TOO_LARGE"
      ) {
        return NextResponse.json(
          {
            ok: false,
            message:
              "حجم فایل بیشتر از حد مجاز است.",
          },
          {
            status: 400,
          },
        );
      }

      if (
        error.message ===
        "INVALID_FILE_TYPE"
      ) {
        return NextResponse.json(
          {
            ok: false,
            message:
              "فرمت فایل مجاز نیست.",
          },
          {
            status: 400,
          },
        );
      }

      if (
        error.message ===
        "INVALID_IMAGE"
      ) {
        return NextResponse.json(
          {
            ok: false,
            message:
              "فایل انتخاب‌شده تصویر معتبر نیست.",
          },
          {
            status: 400,
          },
        );
      }
    }

    return NextResponse.json(
      {
        ok: false,
        message:
          "آپلود تصویر انجام نشد.",
      },
      {
        status: 500,
      },
    );
  }
}