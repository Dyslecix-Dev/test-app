"use client";

import { getFormProps, getInputProps, getTextareaProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { useActionState } from "react";

import { createProject, projectSchema } from "@/app/protected/projects/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PROJECT_COLORS = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#ec4899", label: "Pink" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#10b981", label: "Emerald" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#ef4444", label: "Red" },
  { value: "#6b7280", label: "Gray" },
];

export function ProjectForm() {
  const [lastResult, action, isPending] = useActionState(createProject, null);

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: projectSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <form {...getFormProps(form)} action={action} className="flex flex-col gap-5">
      <div className="grid gap-2">
        <Label htmlFor={fields.name.id}>Project Name</Label>
        <Input {...getInputProps(fields.name, { type: "text" })} placeholder="My Awesome Project" autoFocus />
        {fields.name.errors && <p className="text-destructive text-sm">{fields.name.errors[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor={fields.description.id}>Description</Label>
        <textarea
          {...getTextareaProps(fields.description)}
          placeholder="What is this project about?"
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          rows={3}
        />
        {fields.description.errors && <p className="text-destructive text-sm">{fields.description.errors[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {PROJECT_COLORS.map((c) => (
            <label key={c.value} className="cursor-pointer" title={c.label}>
              <input {...getInputProps(fields.color, { type: "radio" })} value={c.value} className="sr-only" defaultChecked={c.value === "#6366f1"} />
              <span className="block h-8 w-8 rounded-full ring-offset-2 transition-all hover:ring-2" style={{ backgroundColor: c.value }} aria-label={c.label} />
            </label>
          ))}
        </div>
        {fields.color.errors && <p className="text-destructive text-sm">{fields.color.errors[0]}</p>}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create Project"}
      </Button>
    </form>
  );
}
