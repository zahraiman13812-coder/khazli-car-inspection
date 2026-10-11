/*
 * ============================================================
 * ARTICLE DATA
 * اطلاعات موقت مقالات
 * ============================================================
 *
 * This file is temporary until the CMS is connected.
 * این فایل تا زمان اتصال CMS به صورت موقت استفاده می‌شود.
 */

export type ArticleTextBlock = {
  type: "text";
  title?: string;
  content: string;
};

export type ArticleVideoBlock = {
  type: "video";

  title?: string;

  /*
   * Video source type.
   * نوع منبع ویدیو.
   */
  source: "youtube" | "local";

  /*
   * YouTube embed URL or local video path.
   * لینک Embed یوتیوب یا مسیر فایل ویدیویی.
   */
  url: string;

  poster?: string;
};

export type ArticleContentBlock =
  | ArticleTextBlock
  | ArticleVideoBlock;

export type Article = {
  id: string;

  slug: string;

  title: string;

  excerpt: string;

  category: string;

  content: ArticleContentBlock[];
};

export const articles: Article[] = [
  {
    id: "article-01",

    slug: "how-to-detect-car-paint",

    title:
      "چطور رنگ‌شدگی خودرو را تشخیص دهیم؟",

    excerpt:
      "با مهم‌ترین نشانه‌های رنگ‌شدگی بدنه و نقش دستگاه ضخامت‌سنج در کارشناسی خودرو آشنا شوید.",

    category: "کارشناسی رنگ",

    content: [
      {
        type: "text",

        content:
          "تشخیص رنگ‌شدگی خودرو فقط با نگاه کردن به بدنه همیشه امکان‌پذیر نیست. در بسیاری از خودروها ترمیم و رنگ مجدد به شکلی انجام می‌شود که تشخیص آن برای خریدار عادی دشوار است.",
      },

      {
        type: "text",

        title: "بررسی اختلاف رنگ قطعات",

        content:
          "یکی از اولین نشانه‌ها اختلاف جزئی در طیف رنگ بین قطعات مختلف خودرو است. این اختلاف ممکن است در نور طبیعی بیشتر قابل مشاهده باشد، اما به تنهایی برای نتیجه‌گیری کافی نیست.",
      },

      {
        type: "text",

        title: "استفاده از ضخامت‌سنج",

        content:
          "دستگاه ضخامت‌سنج یکی از ابزارهای مهم کارشناسی رنگ است. با اندازه‌گیری ضخامت پوشش روی نقاط مختلف بدنه می‌توان تفاوت‌های غیرعادی را شناسایی و احتمال رنگ‌شدگی یا بتونه‌کاری را بررسی کرد.",
      },

      {
        type: "video",

        title:
          "نمونه ویدیویی بررسی رنگ خودرو",

        source: "youtube",

        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      },

      {
        type: "text",

        title:
          "چرا کارشناسی تخصصی مهم است؟",

        content:
          "رنگ‌شدگی بعضی قطعات ممکن است فقط نتیجه یک آسیب سطحی باشد، اما در بعضی موارد می‌تواند نشانه برخورد شدیدتر باشد. به همین دلیل نتیجه نهایی باید همراه با بررسی بدنه، ستون‌ها و شاسی تفسیر شود.",
      },
    ],
  },

  {
    id: "article-02",

    slug: "used-car-buying-checklist",

    title:
      "قبل از خرید خودرو دست دوم چه چیزهایی را بررسی کنیم؟",

    excerpt:
      "چک‌لیستی کاربردی از مواردی که بهتر است قبل از نهایی کردن معامله خودرو بررسی شوند.",

    category: "راهنمای خرید",

    content: [
      {
        type: "text",

        content:
          "خرید خودرو دست دوم بدون بررسی دقیق می‌تواند هزینه‌های پیش‌بینی‌نشده زیادی ایجاد کند. ظاهر مناسب خودرو لزوماً نشان‌دهنده سلامت کامل آن نیست.",
      },

      {
        type: "text",

        title: "وضعیت رنگ و بدنه",

        content:
          "رنگ‌شدگی، تعویض قطعات، آثار تصادف و وضعیت شاسی از مهم‌ترین بخش‌هایی هستند که باید قبل از معامله بررسی شوند.",
      },

      {
        type: "text",

        title: "مدارک و سوابق خودرو",

        content:
          "علاوه بر وضعیت فیزیکی خودرو، اطلاعات مربوط به مدارک، سوابق سرویس و وضعیت قانونی خودرو نیز باید بررسی شود.",
      },
    ],
  },

  {
    id: "article-03",

    slug: "car-paint-value-loss",

    title:
      "رنگ‌شدگی چه تأثیری روی قیمت خودرو دارد؟",

    excerpt:
      "محل و شدت رنگ‌شدگی می‌تواند تأثیر متفاوتی روی ارزش خودرو داشته باشد.",

    category: "آموزش",

    content: [
      {
        type: "text",

        content:
          "افت قیمت ناشی از رنگ‌شدگی مقدار ثابتی ندارد و به عوامل مختلفی مانند قطعه آسیب‌دیده، نوع خودرو، شدت آسیب و وضعیت بازار بستگی دارد.",
      },

      {
        type: "text",

        title:
          "رنگ قطعات مختلف یکسان نیست",

        content:
          "برای مثال رنگ‌شدگی یک قطعه جانبی معمولاً با آسیب به ستون یا شاسی ارزش‌گذاری یکسانی ندارد. به همین دلیل باید محل و نوع تعمیر به‌طور دقیق مشخص شود.",
      },
    ],
  },
];

/*
 * Find an article by slug.
 * پیدا کردن مقاله بر اساس Slug.
 */
export function getArticleBySlug(
  slug: string,
) {
  return articles.find(
    (article) =>
      article.slug === slug,
  );
}