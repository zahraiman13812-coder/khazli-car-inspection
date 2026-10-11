
import { randomUUID } from "node:crypto";
import sharp from "sharp";

import {
  uploadMedia,
  deleteMedia,
} from "@/lib/supabase-storage";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function saveEquipmentImage(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("فرمت تصویر معتبر نیست.");
  }

  if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
    throw new Error("حجم تصویر نامعتبر است.");
  }

  const input = Buffer.from(await file.arrayBuffer());

  // Sharp also verifies the actual image format.
  const output = await sharp(input)
    .rotate()
    .resize({
      width: 1800,
      height: 1350,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 84 })
    .toBuffer();

  const objectPath = `equipment/${Date.now()}-${randomUUID()}.webp`;

  return uploadMedia(objectPath, output);
}

export async function deleteEquipmentImage(
  imageUrl: string | null | undefined,
) {
  if (!imageUrl) return;

  // Legacy local images are not deleted from Supabase.
  if (imageUrl.startsWith("/uploads/equipment/")) return;

  await deleteMedia(imageUrl);
}
