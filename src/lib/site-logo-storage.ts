import {
  unlink,
} from "node:fs/promises";

import {
  resolve,
} from "node:path";

const SITE_UPLOAD_PREFIX =
  "/uploads/site/";

export function isManagedSiteLogoUrl(
  value:
    | string
    | null
    | undefined,
) {
  return Boolean(
    value &&
      value.startsWith(
        SITE_UPLOAD_PREFIX,
      ),
  );
}

export async function deleteManagedSiteLogo(
  value:
    | string
    | null
    | undefined,
) {
  if (
    !isManagedSiteLogoUrl(
      value,
    )
  ) {
    return;
  }

  const uploadDirectory =
    resolve(
      process.cwd(),
      "public",
      "uploads",
      "site",
    );

  const relativeName =
    value!.slice(
      SITE_UPLOAD_PREFIX.length,
    );

  if (
    !relativeName ||
    relativeName.includes(
      "/",
    ) ||
    relativeName.includes(
      "\\",
    ) ||
    relativeName.includes(
      "..",
    )
  ) {
    return;
  }

  const absolutePath =
    resolve(
      uploadDirectory,
      relativeName,
    );

  if (
    !absolutePath.startsWith(
      `${uploadDirectory}\\`,
    ) &&
    !absolutePath.startsWith(
      `${uploadDirectory}/`,
    )
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
