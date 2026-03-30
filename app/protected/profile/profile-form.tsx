"use client";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useActionState, useOptimistic } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileSchema, updateProfile } from "./actions";

// NOTE:example form using Conform + Zod for validation, a Server Action for submission, and useOptimistic for instant UI feedback.
// This demonstrates the recommended pattern for forms in this boilerplate:
// 1. Define the Zod schema and server action in a separate `actions.ts` file
// 2. Use `useActionState` to connect the form to the server action
// 3. Use `useForm` from Conform for client-side validation with the same Zod schema
// 4. Use `useOptimistic` to show the new value immediately while the action runs
// 5. Use `getInputProps` to wire up inputs with proper validation attributes

// TODO: replace this demo form with your app's actual profile form

export function ProfileForm({ defaultName }: { defaultName: string }) {
  const [optimisticName, setOptimisticName] = useOptimistic(defaultName);

  const [lastResult, formAction, isPending] = useActionState(async (prev: unknown, formData: FormData) => {
    const name = formData.get("name") as string;
    setOptimisticName(name);

    const result = await updateProfile(prev, formData);
    if (result.status === "success") {
      toast.success("Profile updated");
    }
    return result;
  }, null);

  const [form, fields] = useForm({
    lastResult,
    defaultValue: { name: defaultName },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: profileSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>
          Display name: <span className="font-medium">{optimisticName || "Not set"}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id={form.id} onSubmit={form.onSubmit} action={formAction}>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor={fields.name.id}>Name</Label>
              <Input
                key={fields.name.key}
                id={fields.name.id}
                name={fields.name.name}
                defaultValue={fields.name.initialValue}
                aria-invalid={!!fields.name.errors}
                aria-describedby={fields.name.errors ? `${fields.name.id}-error` : undefined}
              />
              {fields.name.errors && (
                <p id={`${fields.name.id}-error`} className="text-sm text-red-500" role="alert">
                  {fields.name.errors[0]}
                </p>
              )}
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
