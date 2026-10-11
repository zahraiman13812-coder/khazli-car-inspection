import ArticleManager from "@/components/admin/ArticleManager";

import {
  prisma,
} from "@/lib/prisma";

export default async function AdminArticlesPage() {
  const items =
    await prisma.article.findMany({
      orderBy: {
        createdAt:
          "desc",
      },
    });

  const initialItems =
    items.map(
      (
        item,
      ) => ({
        id:
          item.id,

        title:
          item.title,

        slug:
          item.slug,

        excerpt:
          item.excerpt,

        content:
          item.content,

        coverImageUrl:
          item.coverImageUrl,

        status:
          item.status,

        isFeatured:
          item.isFeatured,

        publishedAt:
          item.publishedAt?.toISOString() ??
          null,

        createdAt:
          item.createdAt.toISOString(),

        updatedAt:
          item.updatedAt.toISOString(),
      }),
    );

  return (
    <ArticleManager
      initialItems={
        initialItems
      }
    />
  );
}