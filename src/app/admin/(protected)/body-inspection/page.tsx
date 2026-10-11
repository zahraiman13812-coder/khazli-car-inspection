import BodyInspectionManager from "@/components/admin/BodyInspectionManager";

import {
  getAdminBodyInspectionPage,
} from "@/lib/body-inspection";

export const dynamic =
  "force-dynamic";

export default async function AdminBodyInspectionPage() {
  const page =
    await getAdminBodyInspectionPage();

  return (
    <BodyInspectionManager
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