import {
  NextResponse,
} from "next/server";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  normalizeArticleSlug,
} from "@/lib/article-slug";

import {
  prisma,
} from "@/lib/prisma";

import {
  isArticleContentValid,
  sanitizeArticleHtml,
} from "@/lib/article-content";

type CreateArticleBody = {
  title?: unknown;
  slug?: unknown;
  excerpt?: unknown;
  content?: unknown;
  coverImageUrl?: unknown;
  status?: unknown;
  isFeatured?: unknown;
};

const validStatuses =
  new Set([
    "draft",
    "published",
  ]);

export async function GET() {
  try {
    const authenticated =
      await isAdminAuthenticated();

    if (
      !authenticated
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "دسترسی غیرمجاز است.",
        },
        {
          status: 401,
        },
      );
    }

    const items =
      await prisma.article.findMany({
        orderBy: {
          createdAt:
            "desc",
        },
      });

    return NextResponse.json({
      ok: true,
      items,
    });
  } catch (error) {
    console.error(
      "ADMIN_ARTICLES_GET_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "دریافت مقالات انجام نشد.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  request: Request,
) {
  try {
    const authenticated =
      await isAdminAuthenticated();

    if (
      !authenticated
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "دسترسی غیرمجاز است.",
        },
        {
          status: 401,
        },
      );
    }

    const body =
      (await request.json()) as CreateArticleBody;

    const title =
      String(
        body.title ?? "",
      ).trim();

    const slug =
      normalizeArticleSlug(
        String(
          body.slug ?? "",
        ),
      );

    const excerpt =
      String(
        body.excerpt ?? "",
      ).trim();

    const content =
  sanitizeArticleHtml(
    String(
      body.content ?? "",
    ),
  );

    const coverImageUrl =
      String(
        body.coverImageUrl ?? "",
      ).trim();

    const status =
      String(
        body.status ?? "draft",
      );

    const isFeatured =
      body.isFeatured ===
      true;

    if (
      title.length < 5 ||
      title.length > 200
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "عنوان مقاله باید بین ۵ تا ۲۰۰ کاراکتر باشد.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      slug.length < 3
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "آدرس مقاله معتبر نیست.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      excerpt.length < 10 ||
      excerpt.length > 500
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "خلاصه مقاله باید بین ۱۰ تا ۵۰۰ کاراکتر باشد.",
        },
        {
          status: 400,
        },
      );
    }

    if (
  !isArticleContentValid(
    content,
  )
) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "متن مقاله خیلی کوتاه است.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !validStatuses.has(
        status,
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "وضعیت مقاله معتبر نیست.",
        },
        {
          status: 400,
        },
      );
    }

    const duplicate =
      await prisma.article.findUnique({
        where: {
          slug,
        },
      });

    if (
      duplicate
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "این آدرس مقاله قبلاً استفاده شده است.",
        },
        {
          status: 409,
        },
      );
    }

    const article =
      await prisma.article.create({
        data: {
          title,
          slug,
          excerpt,
          content,

          coverImageUrl:
            coverImageUrl ||
            null,

          status,

          isFeatured,

          publishedAt:
            status ===
            "published"
              ? new Date()
              : null,
        },
      });

    return NextResponse.json(
      {
        ok: true,

        message:
          status ===
          "published"
            ? "مقاله با موفقیت منتشر شد."
            : "پیش‌نویس مقاله ذخیره شد.",

        item:
          article,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "ADMIN_ARTICLE_POST_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "ثبت مقاله انجام نشد.",
      },
      {
        status: 500,
      },
    );
  }
}