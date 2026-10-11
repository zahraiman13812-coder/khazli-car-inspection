export const siteConfig = {
  name: "کارشناسی خودرو خزلی",

  shortName: "خزلی",

  description:
    "کارشناسی تخصصی رنگ، بدنه و وضعیت خودرو قبل از خرید.",

  phone: {
    /*
     * Visible phone number.
     * شماره‌ای که در سایت نمایش داده می‌شود.
     */
    display: "۰۹۱۲ ۰۰۰ ۰۰۰۰",

    /*
     * Phone link value.
     * شماره برای لینک تماس مستقیم.
     */
    href: "tel:+989120000000",
  },

  whatsapp: {
    /*
     * WhatsApp direct conversation URL.
     * لینک مستقیم گفتگوی واتساپ.
     */
    href: "https://wa.me/989120000000",
  },

  address:
    "آدرس دقیق مرکز کارشناسی خودرو در این قسمت قرار می‌گیرد.",

  businessHours:
    "شنبه تا پنجشنبه، ۹ صبح تا ۸ شب",

  mapUrl: "#",

  instagramUrl: "#",
} as const;