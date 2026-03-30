"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadFileAction } from "@/lib/storage/actions";

// NOTE: example file upload component using Supabase Storage.
// Demonstrates the recommended pattern for file uploads in this full-stack boilerplate.

// TODO: replace this demo with your app's actual upload UI (e.g., avatar, document upload)

export function FileUpload() {
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      const result = await uploadFileAction(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`File uploaded: ${result.path}`);
        formRef.current?.reset();
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Upload File</CardTitle>
        <CardDescription>Upload a file to Supabase Storage (max 5 MB).</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="file">File</Label>
              <Input id="file" name="file" type="file" required />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
