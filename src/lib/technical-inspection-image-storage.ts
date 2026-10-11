import {
  randomUUID,
} from "node:crypto";

import {
  mkdir,
  unlink,
} from "node:fs/promises";

import path from "node:path";

import sharp from "sharp";

const MAX_FILE_SIZE =
  8 * 1024 * 1024;

const UPLOAD_DIRECTORY =
  path.join(
    process.cwd(),
    "public",
    "uploads",
    "technical-inspection",
  );

const PUBLIC_PREFIX =
  "/uploads/technical-inspection/";

const ALLOWED_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

export async function saveTechnicalInspectionImage(
  file: File,
) {
  if (
    !ALLOWED_TYPES.has(
      file.type,
    )
  ) {
    throw new Error(
      "فرمت تصویر معتبر نیست.",
    );
  }

  if (
    file.size <=
    0
  ) {
    throw new Error(
      "فایل تصویر خالی است.",
    );
  }

  if (
    file.size >
    MAX_FILE_SIZE
  ) {
    throw new Error(
      "حجم تصویر نباید بیشتر از ۸ مگابایت باشد.",
    );
  }

  const buffer =
    Buffer.from(
      await file.arrayBuffer(),
    );

  await mkdir(
    UPLOAD_DIRECTORY,
    {
      recursive:
        true,
    },
  );

  const fileName =
    `${Date.now()}-${randomUUID()}.webp`;

  const absolutePath =
    path.join(
      UPLOAD_DIRECTORY,
      fileName,
    );

  await sharp(
    buffer,
  )
    .rotate()
    .resize({
      width:
        1800,

      height:
        1350,

      fit:
        "inside",

      withoutEnlargement:
        true,
    })
    .webp({
      quality:
        84,
    })
    .toFile(
      absolutePath,
    );

  return `${PUBLIC_PREFIX}${fileName}`;
}

export async function deleteTechnicalInspectionImage(
  imageUrl:
    string | null | undefined,
) {
  if (
    !imageUrl ||
    !imageUrl.startsWith(
      PUBLIC_PREFIX,
    )
  ) {
    return;
  }

  const fileName =
    path.basename(
      imageUrl,
    );

  const absolutePath =
    path.join(
      UPLOAD_DIRECTORY,
      fileName,
    );

  try {
    await unlink(
      absolutePath,
    );
  } catch (
    error
  ) {
    const nodeError =
      error as NodeJS.ErrnoException;

    if (
      nodeError.code !==
      "ENOENT"
    ) {
      throw error;
    }
  }
}