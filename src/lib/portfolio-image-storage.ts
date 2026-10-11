import {
  mkdir,
  unlink,
  writeFile,
} from "node:fs/promises";

import path from "node:path";

import {
  randomUUID,
} from "node:crypto";

import sharp from "sharp";

/*
 * ============================================================
 * CONFIG
 * ============================================================
 */

export const PORTFOLIO_UPLOAD_PREFIX =
  "/uploads/portfolio/";

export const MAX_PORTFOLIO_FILE_SIZE =
  8 * 1024 * 1024;

const MAX_IMAGE_DIMENSION =
  1800;

const WEBP_QUALITY =
  82;

const allowedMimeTypes =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ]);

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

export type SavedPortfolioImage = {
  url: string;

  width: number | null;

  height: number | null;

  size: number;

  format: "webp";
};

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

export function isManagedPortfolioImage(
  value:
    | string
    | null
    | undefined,
) {
  if (
    !value
  ) {
    return false;
  }

  return value.startsWith(
    PORTFOLIO_UPLOAD_PREFIX,
  );
}

function getUploadDirectory() {
  return path.join(
    process.cwd(),
    "public",
    "uploads",
    "portfolio",
  );
}

function publicUrlToAbsolutePath(
  url: string,
) {
  if (
    !isManagedPortfolioImage(
      url,
    )
  ) {
    return null;
  }

  /*
   * فقط filename را قبول می‌کنیم.
   * بنابراین امکان ../ traversal نداریم.
   */
  const fileName =
    path.basename(
      url,
    );

  if (
    !fileName
  ) {
    return null;
  }

  return path.join(
    getUploadDirectory(),
    fileName,
  );
}

/*
 * ============================================================
 * SAVE IMAGE
 * ============================================================
 */

export async function savePortfolioImage(
  file: File,
): Promise<SavedPortfolioImage> {
  if (
    file.size <=
    0
  ) {
    throw new Error(
      "EMPTY_FILE",
    );
  }

  if (
    file.size >
    MAX_PORTFOLIO_FILE_SIZE
  ) {
    throw new Error(
      "FILE_TOO_LARGE",
    );
  }

  if (
    !allowedMimeTypes.has(
      file.type,
    )
  ) {
    throw new Error(
      "INVALID_FILE_TYPE",
    );
  }

  const inputBuffer =
    Buffer.from(
      await file.arrayBuffer(),
    );

  /*
   * limitInputPixels از Decode تصاویر بسیار عظیم
   * و مصرف شدید RAM جلوگیری می‌کند.
   */
  const processor =
    sharp(
      inputBuffer,
      {
        limitInputPixels:
          40_000_000,
      },
    );

  /*
   * metadata علاوه بر اعتبار تصویر،
   * باعث می‌شود فایل جعلی با MIME ساختگی هم رد شود.
   */
  try {
    await processor.metadata();
  } catch {
    throw new Error(
      "INVALID_IMAGE",
    );
  }

  const optimized =
    await processor
      /*
       * EXIF orientation
       */
      .rotate()

      /*
       * محدود کردن تصاویر بسیار بزرگ
       * بدون Upscale تصاویر کوچک.
       */
      .resize({
        width:
          MAX_IMAGE_DIMENSION,

        height:
          MAX_IMAGE_DIMENSION,

        fit:
          "inside",

        withoutEnlargement:
          true,
      })

      /*
       * تمام تصاویر به WebP تبدیل می‌شوند.
       */
      .webp({
        quality:
          WEBP_QUALITY,

        effort:
          4,
      })

      .toBuffer({
        resolveWithObject:
          true,
      });

  const uploadDirectory =
    getUploadDirectory();

  await mkdir(
    uploadDirectory,
    {
      recursive:
        true,
    },
  );

  const fileName =
    `${Date.now()}-${randomUUID()}.webp`;

  const absolutePath =
    path.join(
      uploadDirectory,
      fileName,
    );

  await writeFile(
    absolutePath,
    optimized.data,
  );

  return {
    url:
      `${PORTFOLIO_UPLOAD_PREFIX}${fileName}`,

    width:
      optimized.info.width ??
      null,

    height:
      optimized.info.height ??
      null,

    size:
      optimized.data.length,

    format:
      "webp",
  };
}

/*
 * ============================================================
 * DELETE IMAGE
 * ============================================================
 */

export async function deleteManagedPortfolioImage(
  url:
    | string
    | null
    | undefined,
) {
  if (
    !url ||
    !isManagedPortfolioImage(
      url,
    )
  ) {
    return;
  }

  const absolutePath =
    publicUrlToAbsolutePath(
      url,
    );

  if (
    !absolutePath
  ) {
    return;
  }

  try {
    await unlink(
      absolutePath,
    );
  } catch (
    error
  ) {
    /*
     * اگر قبلاً حذف شده بود،
     * عملیات اصلی نباید Fail شود.
     */
    if (
      typeof error ===
        "object" &&
      error !==
        null &&
      "code" in error &&
      error.code ===
        "ENOENT"
    ) {
      return;
    }

    console.error(
      "DELETE_PORTFOLIO_IMAGE_ERROR",
      error,
    );
  }
}