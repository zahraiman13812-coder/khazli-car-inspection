function normalizeDigits(
  value: string,
) {
  const persian =
    "۰۱۲۳۴۵۶۷۸۹";

  const arabic =
    "٠١٢٣٤٥٦٧٨٩";

  return value
    .replace(
      /[۰-۹]/g,
      (digit) =>
        String(
          persian.indexOf(
            digit,
          ),
        ),
    )
    .replace(
      /[٠-٩]/g,
      (digit) =>
        String(
          arabic.indexOf(
            digit,
          ),
        ),
    );
}

export function normalizeIranPhone(
  value: string,
) {
  return normalizeDigits(
    value,
  ).replace(
    /\D/g,
    "",
  );
}

export function createTelHref(
  phone: string,
) {
  const normalized =
    normalizeIranPhone(
      phone,
    );

  if (
    normalized.startsWith(
      "09",
    )
  ) {
    return `tel:+98${normalized.slice(
      1,
    )}`;
  }

  return `tel:${normalized}`;
}

export function createWhatsappHref(
  phone: string,
) {
  const normalized =
    normalizeIranPhone(
      phone,
    );

  if (
    normalized.startsWith(
      "09",
    )
  ) {
    return `https://wa.me/98${normalized.slice(
      1,
    )}`;
  }

  return `https://wa.me/${normalized}`;
}