
import "server-only";

import { createClient } from "@supabase/supabase-js";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "khazali-media";

function getStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase Storage is not configured.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function uploadMedia(
  objectPath: string,
  data: Buffer,
  contentType = "image/webp",
) {
  const client = getStorageClient();

  const { error } = await client.storage
    .from(BUCKET)
    .upload(objectPath, data, {
      contentType,
      upsert: false,
    });

  if (error) throw error;

  const { data: result } = client.storage
    .from(BUCKET)
    .getPublicUrl(objectPath);

  return result.publicUrl;
}

export async function deleteMedia(publicUrl: string) {
  const client = getStorageClient();
  const { data } = client.storage
    .from(BUCKET)
    .getPublicUrl("");

  const prefix = data.publicUrl.replace(/\/$/, "") + "/";

  // Never delete objects from arbitrary external URLs.
  if (!publicUrl.startsWith(prefix)) return;

  const objectPath = publicUrl.slice(prefix.length).split("?")[0];

  if (!objectPath || objectPath.includes("..")) return;

  const { error } = await client.storage
    .from(BUCKET)
    .remove([objectPath]);

  if (error) throw error;
}
