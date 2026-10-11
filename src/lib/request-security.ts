function getConfiguredSiteOrigin() {
  const siteUrl =
    process.env.SITE_URL;

  if (!siteUrl) {
    return null;
  }

  try {
    return new URL(
      siteUrl,
    ).origin;
  } catch {
    return null;
  }
}

export function isTrustedMutationRequest(
  request: Request,
) {
  const origin =
    request.headers.get(
      "origin",
    );

  /*
   * Browserهای معمولی روی POST Fetch
   * Origin را ارسال می‌کنند.
   */
  if (origin) {
    let requestOrigin:
      string;

    try {
      requestOrigin =
        new URL(
          request.url,
        ).origin;
    } catch {
      return false;
    }

    const configuredOrigin =
      getConfiguredSiteOrigin();

    return (
      origin ===
        requestOrigin ||
      Boolean(
        configuredOrigin &&
          origin ===
            configuredOrigin,
      )
    );
  }

  const fetchSite =
    request.headers.get(
      "sec-fetch-site",
    );

  if (
    fetchSite ===
      "same-origin" ||
    fetchSite ===
      "none"
  ) {
    return true;
  }

  /*
   * در Development ابزارهایی مثل Postman
   * یا بعضی درخواست‌های محلی Origin ندارند.
   */
  return (
    process.env.NODE_ENV !==
    "production"
  );
}