"use client";

import { getFormProps, getTextareaProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useActionState } from "react";

import { addComment, commentSchema } from "@/app/protected/projects/[id]/tasks/[taskId]/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface CommentFormProps {
  projectId: string;
  taskId: string;
}

export function CommentForm({ projectId, taskId }: CommentFormProps) {
  const boundAction = addComment.bind(null, projectId, taskId);
  const [lastResult, action, isPending] = useActionState(boundAction, null);

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: commentSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <form {...getFormProps(form)} action={action} className="flex flex-col gap-3">
      <div className="grid gap-2">
        <Label htmlFor={fields.body.id}>Add a comment</Label>
        <textarea
          {...getTextareaProps(fields.body)}
          placeholder="Write a comment..."
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          rows={3}
        />
        {fields.body.errors && <p className="text-destructive text-sm">{fields.body.errors[0]}</p>}
      </div>
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </form>
  );
}
