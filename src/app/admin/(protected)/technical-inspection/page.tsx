import TechnicalInspectionManager from "@/components/admin/TechnicalInspectionManager";

import {
  getAdminTechnicalInspectionPage,
} from "@/lib/technical-inspection";

export const dynamic =
  "force-dynamic";

export default async function AdminTechnicalInspectionPage() {
  const page =
    await getAdminTechnicalInspectionPage();

  return (
    <TechnicalInspectionManager
      initialPage={{
        title:
          page.title,

        description:
          page.description,

        videoTitle:
          page.videoTitle,

        videoUrl:
          page.videoUrl ??
          "",

        galleryTitle:
          page.galleryTitle,
      }}
      initialImages={
        page.images.map(
          (
            image,
          ) => ({
            id:
              image.id,

            imageUrl:
              image.imageUrl,

            title:
              image.title,

            caption:
              image.caption,

            altText:
              image.altText,

            sortOrder:
              image.sortOrder,

            isActive:
              image.isActive,

            createdAt:
              image.createdAt.toISOString(),

            updatedAt:
              image.updatedAt.toISOString(),
          }),
        )
      }
    />
  );
}