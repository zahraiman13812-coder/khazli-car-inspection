export function normalizeDigits(
  value: string,
) {
  const persianDigits =
    "۰۱۲۳۴۵۶۷۸۹";

  const arabicDigits =
    "٠١٢٣٤٥٦٧٨٩";

  return value
    .replace(
      /[۰-۹]/g,
      (digit) =>
        String(
          persianDigits.indexOf(
            digit,
          ),
        ),
    )
    .replace(
      /[٠-٩]/g,
      (digit) =>
        String(
          arabicDigits.indexOf(
            digit,
          ),
        ),
    );
}

export function normalizePhone(
  value: string,
) {
  return normalizeDigits(
    value,
  )
    .replace(/\D/g, "")
    .slice(0, 11);
}

export function normalizeFullName(
  value: string,
) {
  return value
    .normalize("NFKC")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200C/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase(
      "fa",
    );
}

export function createDailyIdentityKey({
  date,
  phone,
  fullName,
}: {
  date: string;
  phone: string;
  fullName: string;
}) {
  return [
    date,
    normalizePhone(phone),
    normalizeFullName(
      fullName,
    ),
  ].join(":");
}