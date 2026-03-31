"use client";

import { getFormProps, getInputProps, getSelectProps, getTextareaProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useActionState } from "react";

import { createTask, taskSchema } from "@/app/protected/projects/[id]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TaskFormProps {
  projectId: string;
  // Optional list of users that can be assigned to the task
  assignableUsers?: { id: string; name: string | null; email: string }[];
}

export function TaskForm({ projectId, assignableUsers = [] }: TaskFormProps) {
  const boundAction = createTask.bind(null, projectId);
  const [lastResult, action, isPending] = useActionState(boundAction, null);

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: taskSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <form {...getFormProps(form)} action={action} className="flex flex-col gap-5">
      <div className="grid gap-2">
        <Label htmlFor={fields.title.id}>Title</Label>
        <Input {...getInputProps(fields.title, { type: "text" })} placeholder="What needs to be done?" autoFocus />
        {fields.title.errors && <p className="text-destructive text-sm">{fields.title.errors[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor={fields.description.id}>Description</Label>
        <textarea
          {...getTextareaProps(fields.description)}
          placeholder="Add more detail..."
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          rows={3}
        />
        {fields.description.errors && <p className="text-destructive text-sm">{fields.description.errors[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor={fields.status.id}>Status</Label>
          <select
            {...getSelectProps(fields.status)}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="done">Done</option>
          </select>
          {fields.status.errors && <p className="text-destructive text-sm">{fields.status.errors[0]}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor={fields.priority.id}>Priority</Label>
          <select
            {...getSelectProps(fields.priority)}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          {fields.priority.errors && <p className="text-destructive text-sm">{fields.priority.errors[0]}</p>}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={fields.dueDate.id}>Due Date</Label>
        <Input {...getInputProps(fields.dueDate, { type: "date" })} />
        {fields.dueDate.errors && <p className="text-destructive text-sm">{fields.dueDate.errors[0]}</p>}
      </div>

      {assignableUsers.length > 0 && (
        <div className="grid gap-2">
          <Label htmlFor={fields.assigneeId.id}>Assign To</Label>
          <select
            {...getSelectProps(fields.assigneeId)}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <option value="">Unassigned</option>
            {assignableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name ?? u.email}
              </option>
            ))}
          </select>
          {fields.assigneeId.errors && <p className="text-destructive text-sm">{fields.assigneeId.errors[0]}</p>}
        </div>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create Task"}
      </Button>
    </form>
  );
}
