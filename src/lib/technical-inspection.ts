import {
  prisma,
} from "@/lib/prisma";

export const TECHNICAL_INSPECTION_PAGE_ID =
  "main";

export const technicalInspectionDefaults = {
  title:
    "بررسی فنی خودرو",

  description:
    "در بررسی فنی خودرو، بخش‌های اصلی مانند موتور، گیربکس، سیستم برق، ترمز و سایر قسمت‌های مهم خودرو بررسی می‌شوند تا وضعیت واقعی خودرو پیش از خرید با دقت بیشتری مشخص شود.",

  videoTitle:
    "ویدیوی بررسی فنی خودرو",

  galleryTitle:
    "تصاویر بررسی خودروها",
};

export async function getTechnicalInspectionPage() {
  const page =
    await prisma.technicalInspectionPage.findUnique({
      where: {
        id:
          TECHNICAL_INSPECTION_PAGE_ID,
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
      TECHNICAL_INSPECTION_PAGE_ID,

    title:
      technicalInspectionDefaults.title,

    description:
      technicalInspectionDefaults.description,

    videoTitle:
      technicalInspectionDefaults.videoTitle,

    videoUrl:
      null,

    galleryTitle:
      technicalInspectionDefaults.galleryTitle,

    createdAt:
      new Date(0),

    updatedAt:
      new Date(0),

    images:
      [],
  };
}

export async function getAdminTechnicalInspectionPage() {
  return prisma.technicalInspectionPage.upsert({
    where: {
      id:
        TECHNICAL_INSPECTION_PAGE_ID,
    },

    update:
      {},

    create: {
      id:
        TECHNICAL_INSPECTION_PAGE_ID,

      title:
        technicalInspectionDefaults.title,

      description:
        technicalInspectionDefaults.description,

      videoTitle:
        technicalInspectionDefaults.videoTitle,

      galleryTitle:
        technicalInspectionDefaults.galleryTitle,
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