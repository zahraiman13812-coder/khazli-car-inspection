import {
  prisma,
} from "@/lib/prisma";

export const BODY_INSPECTION_PAGE_ID =
  "main";

export const bodyInspectionDefaults = {
  title:
    "بررسی بدنه خودرو",

  description:
    "در بررسی تخصصی بدنه خودرو، رنگ، شاسی، ستون‌ها، قطعات تعویضی و آثار تعمیر یا آسیب احتمالی بررسی می‌شوند تا وضعیت واقعی بدنه خودرو با دقت بیشتری مشخص شود.",

  videoTitle:
    "ویدیوی بررسی بدنه خودرو",

  galleryTitle:
    "نمونه تصاویر بررسی بدنه",
};

export async function getBodyInspectionPage() {
  const page =
    await prisma.bodyInspectionPage.findUnique({
      where: {
        id:
          BODY_INSPECTION_PAGE_ID,
      },

      include: {
        images: {
          where: {
            isActive:
              true,
          },

          orderBy: [
            {
              sortOrder:
                "asc",
            },

            {
              createdAt:
                "desc",
            },
          ],
        },
      },
    });

  if (
    page
  ) {
    return page;
  }

  return {
    id:
      BODY_INSPECTION_PAGE_ID,

    title:
      bodyInspectionDefaults.title,

    description:
      bodyInspectionDefaults.description,

    videoTitle:
      bodyInspectionDefaults.videoTitle,

    videoUrl:
      null,

    galleryTitle:
      bodyInspectionDefaults.galleryTitle,

    createdAt:
      new Date(0),

    updatedAt:
      new Date(0),

    images:
      [],
  };
}

export async function getAdminBodyInspectionPage() {
  return prisma.bodyInspectionPage.upsert({
    where: {
      id:
        BODY_INSPECTION_PAGE_ID,
    },

    update:
      {},

    create: {
      id:
        BODY_INSPECTION_PAGE_ID,

      title:
        bodyInspectionDefaults.title,

      description:
        bodyInspectionDefaults.description,

      videoTitle:
        bodyInspectionDefaults.videoTitle,

      galleryTitle:
        bodyInspectionDefaults.galleryTitle,
    },

    include: {
      images: {
        orderBy: [
          {
            sortOrder:
              "asc",
          },

          {
            createdAt:
              "desc",
          },
        ],
      },
    },
  });
}