"use server";

import { uploadFile } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

// NOTE: server action for file uploads.
// Accepts FormData with a "file" field and uploads to Supabase Storage.

// Usage in a client component:
// ```tsx
// const formData = new FormData();
// formData.append("file", selectedFile);
// const result = await uploadFileAction(formData);
// ```

export async function uploadFileAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "No file provided" };
  }

  // NOTE: default 5 MB — override with UPLOAD_MAX_SIZE_MB env var
  const MAX_SIZE = (Number(process.env.UPLOAD_MAX_SIZE_MB) || 5) * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { error: "File too large (max 5 MB)" };
  }

  const rawExt = file.name.split(".").pop() ?? "bin";
  const ext = rawExt.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10) || "bin";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { path: storedPath } = await uploadFile("uploads", path, file);
  return { path: storedPath };
}
