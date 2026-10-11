import {
  readdir,
  stat,
  unlink,
} from "node:fs/promises";

import path from "node:path";

import {
  prisma,
} from "@/lib/prisma";

import {
  PORTFOLIO_UPLOAD_PREFIX,
} from "@/lib/portfolio-image-storage";

/*
 * فایل تازه آپلودشده را فوری حذف نمی‌کنیم،
 * چون ممکن است مدیر هنوز فرم را ذخیره نکرده باشد.
 */
const ORPHAN_MIN_AGE =
  24 * 60 * 60 * 1000;

export async function cleanupPortfolioOrphans() {
  const directory =
    path.join(
      process.cwd(),
      "public",
      "uploads",
      "portfolio",
    );

  let fileNames:
    string[];

  try {
    fileNames =
      await readdir(
        directory,
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
      return {
        deleted:
          0,
      };
    }

    throw error;
  }

  const items =
    await prisma.portfolioItem.findMany({
      select: {
        beforeImageUrl:
          true,

        afterImageUrl:
          true,
      },
    });

  const usedUrls =
    new Set<string>();

  for (
    const item
    of items
  ) {
    if (
      item.beforeImageUrl
    ) {
      usedUrls.add(
        item.beforeImageUrl,
      );
    }

    if (
      item.afterImageUrl
    ) {
      usedUrls.add(
        item.afterImageUrl,
      );
    }
  }

  const now =
    Date.now();

  let deleted =
    0;

  for (
    const fileName
    of fileNames
  ) {
    const publicUrl =
      `${PORTFOLIO_UPLOAD_PREFIX}${fileName}`;

    if (
      usedUrls.has(
        publicUrl,
      )
    ) {
      continue;
    }

    const absolutePath =
      path.join(
        directory,
        fileName,
      );

    try {
      const info =
        await stat(
          absolutePath,
        );

      /*
       * فایل باید حداقل ۲۴ ساعت بلااستفاده
       * مانده باشد.
       */
      if (
        now -
          info.mtimeMs <
        ORPHAN_MIN_AGE
      ) {
        continue;
      }

      await unlink(
        absolutePath,
      );

      deleted +=
        1;
    } catch (
      error
    ) {
      console.error(
        "PORTFOLIO_ORPHAN_FILE_ERROR",
        fileName,
        error,
      );
    }
  }

  return {
    deleted,
  };
}