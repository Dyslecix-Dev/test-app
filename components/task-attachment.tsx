"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

import { uploadTaskAttachment } from "@/app/protected/projects/[id]/tasks/[taskId]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TaskAttachmentProps {
  projectId: string;
  taskId: string;
  currentUrl?: string | null;
}

export function TaskAttachment({ projectId, taskId, currentUrl }: TaskAttachmentProps) {
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      const result = await uploadTaskAttachment(projectId, taskId, formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Attachment uploaded");
        formRef.current?.reset();
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {currentUrl && (
        <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-primary flex items-center gap-1 text-sm underline underline-offset-2">
          📎 View current attachment
        </a>
      )}
      <form ref={formRef} action={handleSubmit} className="flex items-end gap-3">
        <div className="grid flex-1 gap-1">
          <Label htmlFor={`attachment-${taskId}`}>Attach File</Label>
          <Input id={`attachment-${taskId}`} name="file" type="file" />
        </div>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Uploading..." : "Upload"}
        </Button>
      </form>
    </div>
  );
}
