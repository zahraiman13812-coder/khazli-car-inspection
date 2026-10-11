import {
  randomUUID,
} from "node:crypto";

import {
  mkdir,
  unlink,
  writeFile,
} from "node:fs/promises";

import path from "node:path";

import {
  NextResponse,
} from "next/server";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  isTrustedMutationRequest,
} from "@/lib/request-security";

import {
  getSiteSettings,
} from "@/lib/site-settings";

import {
  prisma,
} from "@/lib/prisma";

import {
  siteDefaults,
} from "@/config/site-defaults";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const MIME_EXTENSIONS:
  Record<string, string> = {
    "image/jpeg":
      "jpg",

    "image/png":
      "png",

    "image/webp":
      "webp",

    "image/avif":
      "avif",
  };

function hasValidSignature(
  mimeType: string,
  buffer: Buffer,
) {
  if (
    mimeType ===
    "image/jpeg"
  ) {
    return (
      buffer.length >=
        3 &&
      buffer[0] ===
        0xff &&
      buffer[1] ===
        0xd8 &&
      buffer[2] ===
        0xff
    );
  }

  if (
    mimeType ===
    "image/png"
  ) {
    const signature = [
      0x89,
      0x50,
      0x4e,
      0x47,
      0x0d,
      0x0a,
      0x1a,
      0x0a,
    ];

    return (
      buffer.length >=
        signature.length &&
      signature.every(
        (
          value,
          index,
        ) =>
          buffer[index] ===
          value,
      )
    );
  }

  if (
    mimeType ===
    "image/webp"
  ) {
    return (
      buffer.length >=
        12 &&
      buffer
        .subarray(
          0,
          4,
        )
        .toString(
          "ascii",
        ) ===
        "RIFF" &&
      buffer
        .subarray(
          8,
          12,
        )
        .toString(
          "ascii",
        ) ===
        "WEBP"
    );
  }

  if (
    mimeType ===
    "image/avif"
  ) {
    if (
      buffer.length <
      16
    ) {
      return false;
    }

    const boxType =
      buffer
        .subarray(
          4,
          8,
        )
        .toString(
          "ascii",
        );

    const brands =
      buffer
        .subarray(
          8,
          Math.min(
            buffer.length,
            32,
          ),
        )
        .toString(
          "ascii",
        );

    return (
      boxType ===
        "ftyp" &&
      (
        brands.includes(
          "avif",
        ) ||
        brands.includes(
          "avis",
        )
      )
    );
  }

  return false;
}

async function deleteManagedLogo(
  logoUrl:
    | string
    | null,
) {
  if (
    !logoUrl ||
    !logoUrl.startsWith(
      "/uploads/site-logo/",
    )
  ) {
    return;
  }

  const uploadRoot =
    path.resolve(
      process.cwd(),
      "public",
      "uploads",
      "site-logo",
    );

  const relativePath =
    logoUrl.replace(
      /^\/+/,
      "",
    );

  const filePath =
    path.resolve(
      process.cwd(),
      "public",
      relativePath,
    );

  if (
    filePath !==
      uploadRoot &&
    !filePath.startsWith(
      `${uploadRoot}${path.sep}`,
    )
  ) {
    return;
  }

  try {
    await unlink(
      filePath,
    );
  } catch (
    error
  ) {
    const code =
      error &&
      typeof error ===
        "object" &&
      "code" in error
        ? String(
            error.code,
          )
        : "";

    if (
      code !==
      "ENOENT"
    ) {
      console.error(
        "DELETE_OLD_SITE_LOGO_ERROR",
        error,
      );
    }
  }
}

export async function POST(
  request: Request,
) {
  let newFilePath:
    string | null =
    null;

  try {
    if (
      !isTrustedMutationRequest(
        request,
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "درخواست معتبر نیست.",
        },
        {
          status: 403,
        },
      );
    }

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

    const file =
      formData.get(
        "file",
      );

    if (
      !(file instanceof File)
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "فایل لوگو ارسال نشده است.",
        },
        {
          status: 400,
        },
      );
    }

    const extension =
      MIME_EXTENSIONS[
        file.type
      ];

    if (
      !extension
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "فرمت لوگو باید JPG، PNG، WEBP یا AVIF باشد.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      file.size <=
        0 ||
      file.size >
        MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "حجم لوگو باید بیشتر از صفر و حداکثر ۵ مگابایت باشد.",
        },
        {
          status: 400,
        },
      );
    }

    const buffer =
      Buffer.from(
        await file.arrayBuffer(),
      );

    if (
      !hasValidSignature(
        file.type,
        buffer,
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "محتوای فایل با فرمت تصویر انتخاب‌شده مطابقت ندارد.",
        },
        {
          status: 400,
        },
      );
    }

    const currentSettings =
      await getSiteSettings();

    const uploadDirectory =
      path.resolve(
        process.cwd(),
        "public",
        "uploads",
        "site-logo",
      );

    await mkdir(
      uploadDirectory,
      {
        recursive:
          true,
      },
    );

    const filename =
      `${Date.now()}-${randomUUID()}.${extension}`;

    newFilePath =
      path.join(
        uploadDirectory,
        filename,
      );

    await writeFile(
      newFilePath,
      buffer,
    );

    const logoUrl =
      `/uploads/site-logo/${filename}`;

    /*
     * Logo persistence happens here immediately.
     * This makes the upload action atomic from the admin's point of view
     * and does not depend on a later "save settings" request.
     */
    const settings =
      await prisma.siteSetting.update({
        where: {
          id:
            siteDefaults.id,
        },

        data: {
          logoUrl,
        },
      });

    newFilePath =
      null;

    if (
      currentSettings.logoUrl &&
      currentSettings.logoUrl !==
        logoUrl
    ) {
      await deleteManagedLogo(
        currentSettings.logoUrl,
      );
    }

    return NextResponse.json({
      ok: true,
      message:
        "لوگو با موفقیت آپلود و ذخیره شد.",
      url:
        logoUrl,
      settings,
    });
  } catch (
    error
  ) {
    if (
      newFilePath
    ) {
      try {
        await unlink(
          newFilePath,
        );
      } catch {
        // Best-effort rollback for an upload that failed before DB persistence.
      }
    }

    console.error(
      "ADMIN_SITE_LOGO_UPLOAD_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "آپلود یا ذخیره لوگو با خطا مواجه شد.",
      },
      {
        status: 500,
      },
    );
  }
}
