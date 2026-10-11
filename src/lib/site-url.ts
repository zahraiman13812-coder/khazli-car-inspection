const DEVELOPMENT_SITE_URL = "http://localhost:3000";

export function getSiteUrl() {
  const configured =
    process.env.SITE_URL?.trim();

  if (configured) {
    try {
      const url =
        new URL(configured);

      if (
        url.protocol !== "http:" &&
        url.protocol !== "https:"
      ) {
        throw new Error(
          "SITE_URL must use http or https.",
        );
      }

      return url.origin;
    } catch (error) {
      throw new Error(
        `SITE_URL is invalid: ${configured}`,
        { cause: error },
      );
    }
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (
    process.env.NODE_ENV ===
    "production"
  ) {
    throw new Error(
      "SITE_URL must be configured in production.",
    );
  }

  return DEVELOPMENT_SITE_URL;
}
