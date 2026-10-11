import Link from "next/link";

import {
  ArrowLeft,
  BookOpen,
} from "lucide-react";

import type { Article } from "@/data/articles";

type Props = {
  article: Article;
};

export default function ArticleCard({
  article,
}: Props) {
  return (
    <article className="group flex h-full flex-col rounded-[1.5rem] border border-line bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-border hover:shadow-card sm:p-6">
      {/* Article icon / آیکن مقاله */}
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-active">
        <BookOpen
          size={21}
          strokeWidth={1.8}
        />
      </div>

      {/* Category / دسته‌بندی */}
      <span className="mt-6 text-xs font-black text-brand-active">
        {article.category}
      </span>

      {/* Title / عنوان */}
      <h3 className="mt-3 text-lg font-black leading-8 text-ink sm:text-xl">
        {article.title}
      </h3>

      {/* Excerpt / خلاصه */}
      <p className="mt-3 text-sm leading-7 text-ink-secondary">
        {article.excerpt}
      </p>

      {/* Read article / مطالعه مطلب */}
      <Link
        href={`/blog/${article.slug}`}
        className="group/link mt-auto flex items-center justify-between border-t border-line pt-5 text-sm font-black text-ink"
      >
        مطالعه مطلب

        <ArrowLeft
          size={17}
          className="transition-transform duration-300 group-hover/link:-translate-x-1"
        />
      </Link>
    </article>
  );
}