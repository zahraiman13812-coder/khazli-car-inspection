import {
  NextResponse,
} from "next/server";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  cleanupPortfolioOrphans,
} from "@/lib/portfolio-orphan-cleanup";

export async function POST() {
  try {
    const authenticated =
      await isAdminAuthenticated();

    if (
      !authenticated
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "دسترسی غیرمجاز است.",
        },
        {
          status:
            401,
        },
      );
    }

    const result =
      await cleanupPortfolioOrphans();

    return NextResponse.json({
      ok:
        true,

      message:
        result.deleted >
        0
          ? `${result.deleted} فایل بلااستفاده حذف شد.`
          : "فایل بلااستفاده‌ای برای حذف وجود ندارد.",

      deleted:
        result.deleted,
    });
  } catch (
    error
  ) {
    console.error(
      "PORTFOLIO_CLEANUP_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,

        message:
          "پاکسازی فایل‌های بلااستفاده انجام نشد.",
      },
      {
        status:
          500,
      },
    );
  }
}