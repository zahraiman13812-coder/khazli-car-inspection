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

export const ARTICLE_UPLOAD_PREFIX =
  "/uploads/articles/";

export const MAX_ARTICLE_IMAGE_SIZE =
  8 * 1024 * 1024;

const MAX_IMAGE_WIDTH =
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

export function isManagedArticleImage(
  url:
    | string
    | null
    | undefined,
) {
  return Boolean(
    url?.startsWith(
      ARTICLE_UPLOAD_PREFIX,
    ),
  );
}

function getUploadDirectory() {
  return path.join(
    process.cwd(),
    "public",
    "uploads",
    "articles",
  );
}

export async function saveArticleImage(
  file: File,
) {
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
    MAX_ARTICLE_IMAGE_SIZE
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

  const buffer =
    Buffer.from(
      await file.arrayBuffer(),
    );

  let optimized:
    Awaited<
      ReturnType<
        ReturnType<
          typeof sharp
        >["toBuffer"]
      >
    >;

  try {
    optimized =
      await sharp(
        buffer,
        {
          limitInputPixels:
            40_000_000,
        },
      )
        .rotate()
        .resize({
          width:
            MAX_IMAGE_WIDTH,

          withoutEnlargement:
            true,
        })
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
  } catch {
    throw new Error(
      "INVALID_IMAGE",
    );
  }

  const directory =
    getUploadDirectory();

  await mkdir(
    directory,
    {
      recursive:
        true,
    },
  );

  const fileName =
    `${Date.now()}-${randomUUID()}.webp`;

  await writeFile(
    path.join(
      directory,
      fileName,
    ),
    optimized.data,
  );

  return {
    url:
      `${ARTICLE_UPLOAD_PREFIX}${fileName}`,

    width:
      optimized.info.width ??
      null,

    height:
      optimized.info.height ??
      null,

    size:
      optimized.data.length,
  };
}

export async function deleteManagedArticleImage(
  url:
    | string
    | null
    | undefined,
) {
  if (
    !url ||
    !isManagedArticleImage(
      url,
    )
  ) {
    return;
  }

  const fileName =
    path.basename(
      url,
    );

  const filePath =
    path.join(
      getUploadDirectory(),
      fileName,
    );

  try {
    await unlink(
      filePath,
    );
  } catch (
    error
  ) {
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
      "ARTICLE_IMAGE_DELETE_ERROR",
      error,
    );
  }
}