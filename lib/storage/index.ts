import { createClient } from "@/lib/supabase/server";

// NOTE: Supabase Storage helper for server-side file operations.
// Free tier: 1 GB storage, 2 GB bandwidth/month.

// TODO: before using, create a storage bucket in the Supabase dashboard or via SQL:
// INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', false);

// NOTE: for public files (e.g., avatars), set `public: true` on the bucket.

// Usage:
// ```ts
// import { uploadFile, getPublicUrl, deleteFile } from "@/lib/storage";
// const { path } = await uploadFile("uploads", `avatars/${userId}.png`, file);
// const url = getPublicUrl("uploads", path);
// await deleteFile("uploads", path);
// ```

const DEFAULT_BUCKET = "uploads";

export async function uploadFile(bucket: string = DEFAULT_BUCKET, path: string, file: File | Blob | Buffer) {
  const supabase = await createClient();

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
  });

  if (error) throw error;
  return { path: data.path };
}

export async function deleteFile(bucket: string = DEFAULT_BUCKET, path: string) {
  const supabase = await createClient();

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

export async function getPublicUrl(bucket: string = DEFAULT_BUCKET, path: string) {
  const supabase = await createClient();

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function getSignedUrl(bucket: string = DEFAULT_BUCKET, path: string, expiresIn: number = 3600) {
  const supabase = await createClient();

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}
