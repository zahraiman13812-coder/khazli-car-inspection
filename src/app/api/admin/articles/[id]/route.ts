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

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateArticleBody = {
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

export async function PATCH(
  request: Request,
  {
    params,
  }: RouteContext,
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

    const {
      id,
    } =
      await params;

    const existing =
      await prisma.article.findUnique({
        where: {
          id,
        },
      });

    if (
      !existing
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "مقاله پیدا نشد.",
        },
        {
          status: 404,
        },
      );
    }

    const body =
      (await request.json()) as UpdateArticleBody;

    const data: {
      title?: string;
      slug?: string;
      excerpt?: string;
      content?: string;
      coverImageUrl?:
        | string
        | null;
      status?: string;
      isFeatured?: boolean;
      publishedAt?:
        | Date
        | null;
    } = {};

    if (
      body.title !==
      undefined
    ) {
      const value =
        String(
          body.title,
        ).trim();

      if (
        value.length < 5 ||
        value.length > 200
      ) {
        return NextResponse.json(
          {
            ok: false,
            message:
              "عنوان مقاله معتبر نیست.",
          },
          {
            status: 400,
          },
        );
      }

      data.title =
        value;
    }

    if (
      body.slug !==
      undefined
    ) {
      const value =
        normalizeArticleSlug(
          String(
            body.slug,
          ),
        );

      if (
        value.length <
        3
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

      const duplicate =
        await prisma.article.findFirst({
          where: {
            slug:
              value,

            id: {
              not:
                id,
            },
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

      data.slug =
        value;
    }

    if (
      body.excerpt !==
      undefined
    ) {
      const value =
        String(
          body.excerpt,
        ).trim();

      if (
        value.length < 10 ||
        value.length > 500
      ) {
        return NextResponse.json(
          {
            ok: false,
            message:
              "خلاصه مقاله معتبر نیست.",
          },
          {
            status: 400,
          },
        );
      }

      data.excerpt =
        value;
    }

    if (
  body.content !==
  undefined
) {
  const value =
    sanitizeArticleHtml(
      String(
        body.content,
      ),
    );

  if (
    !isArticleContentValid(
      value,
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

  data.content =
    value;
}
    if (
      body.coverImageUrl !==
      undefined
    ) {
      const value =
        String(
          body.coverImageUrl ??
            "",
        ).trim();

      data.coverImageUrl =
        value ||
        null;
    }

    if (
      typeof body.isFeatured ===
      "boolean"
    ) {
      data.isFeatured =
        body.isFeatured;
    }

    if (
      body.status !==
      undefined
    ) {
      const value =
        String(
          body.status,
        );

      if (
        !validStatuses.has(
          value,
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

      data.status =
        value;

      if (
        value ===
          "published" &&
        existing.status !==
          "published"
      ) {
        data.publishedAt =
          new Date();
      }

      if (
        value ===
        "draft"
      ) {
        data.publishedAt =
          null;
      }
    }

    const article =
      await prisma.article.update({
        where: {
          id,
        },

        data,
      });

    return NextResponse.json({
      ok: true,
      message:
        "تغییرات مقاله ذخیره شد.",
      item:
        article,
    });
  } catch (error) {
    console.error(
      "ADMIN_ARTICLE_PATCH_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "ویرایش مقاله انجام نشد.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  _request: Request,
  {
    params,
  }: RouteContext,
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

    const {
      id,
    } =
      await params;

    const existing =
      await prisma.article.findUnique({
        where: {
          id,
        },
      });

    if (
      !existing
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "مقاله پیدا نشد.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.article.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      ok: true,
      message:
        "مقاله با موفقیت حذف شد.",
    });
  } catch (error) {
    console.error(
      "ADMIN_ARTICLE_DELETE_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "حذف مقاله انجام نشد.",
      },
      {
        status: 500,
      },
    );
  }
}