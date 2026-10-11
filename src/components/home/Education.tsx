import Link from "next/link";

type ArticleItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;

  coverImageUrl:
    | string
    | null;

  publishedAt:
    | Date
    | null;

  createdAt:
    Date;
};

export default function Education({
  items,
}: {
  items:
    ArticleItem[];
}) {
  if (
    items.length ===
    0
  ) {
    return null;
  }

  return (
    <section
      id="education"
      className="section-space scroll-mt-24 bg-page"
    >
      <div className="site-container">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="text-sm font-black text-brand-active">
              آموزش و راهنما
            </span>

            <h2 className="mt-4 text-3xl font-black leading-[1.5] text-ink sm:text-4xl">
              قبل از خرید خودرو بیشتر بدانید
            </h2>

            <p className="mt-4 text-sm leading-8 text-ink-secondary">
              آموزش‌های کاربردی برای تشخیص
              بهتر وضعیت خودرو و خرید
              مطمئن‌تر.
            </p>
          </div>

          <Link
            href="/blog"
            className="text-sm font-black text-brand-active"
          >
            مشاهده همه مقالات ←
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map(
            (
              item,
            ) => (
              <Link
                key={
                  item.id
                }
                href={`/blog/${item.slug}`}
                className="group overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-card"
              >
                {item.coverImageUrl ? (
                  <div className="aspect-[16/9] overflow-hidden bg-surface-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        item.coverImageUrl
                      }
                      alt={
                        item.title
                      }
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] bg-surface-muted" />
                )}

                <div className="p-5">
                  <h3 className="text-lg font-black leading-8 text-ink">
                    {
                      item.title
                    }
                  </h3>

                  <p className="mt-3 line-clamp-3 text-sm leading-8 text-ink-secondary">
                    {
                      item.excerpt
                    }
                  </p>

                  <span className="mt-5 inline-block text-xs font-black text-brand-active">
                    مطالعه مقاله ←
                  </span>
                </div>
              </Link>
            ),
          )}
        </div>
      </div>
    </section>
  );
}