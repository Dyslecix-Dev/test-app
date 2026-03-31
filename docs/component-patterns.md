# Component Patterns

## Stack

- **Component library**: shadcn/ui (New York style)
- **Primitives**: Radix UI
- **Styling**: Tailwind CSS v4 with CSS variables
- **Icons**: Lucide React
- **Class utilities**: `cn()` from `lib/utils.ts` (clsx + tailwind-merge)
- **Animations**: Motion (Framer Motion)
- **Toasts**: Sonner
- **Dark mode**: next-themes
- **Charts**: Recharts

## Directory Structure

```text
components/
  ui/              # shadcn/ui primitives (don't edit these directly)
    button.tsx
    card.tsx
    input.tsx
    label.tsx
    checkbox.tsx
    dropdown-menu.tsx
    badge.tsx
    sonner.tsx
  auth-button.tsx   # Feature components
  login-form.tsx
  sign-up-form.tsx
  ...
```

## Adding shadcn/ui Components

Use the shadcn CLI via the MCP server or directly:

```bash
pnpm dlx shadcn@latest add [component-name]
```

Components are installed to `components/ui/`. The `components.json` config controls aliases, style, and icon library.

## Styling Approach

### CSS Variables

Theme colors are defined as HSL values in `app/globals.css` using CSS variables. Both light and dark themes are configured:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  /* ... */
}
.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... */
}
```

These are mapped to Tailwind via `@theme inline` in `globals.css`, making classes like `bg-background`, `text-foreground`, `bg-primary` available.

### The `cn()` utility

Always use `cn()` for conditional/merged class names:

```tsx
import { cn } from "@/lib/utils";

<div className={cn("flex flex-col gap-6", className)} />;
```

### Tailwind v4

This project uses Tailwind CSS v4 with `@tailwindcss/postcss`. There is no `tailwind.config.ts` — configuration is done via CSS in `globals.css` using `@theme inline`.

## Server vs Client Components

- **Default to Server Components** — they render on the server with zero client JS
- **Use `"use client"` only when needed** — for interactivity (useState, useEffect, event handlers, browser APIs)

Examples in this codebase:

- `AuthButton` — **server** component (fetches user session on server)
- `LoginForm` — **client** component (form state, event handlers)
- `ThemeSwitcher` — **client** component (uses next-themes hook)

## Dark Mode

Configured via `next-themes` in `app/layout.tsx`:

```tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
  {children}
</ThemeProvider>
```

The `ThemeSwitcher` component provides a dropdown to switch between light, dark, and system themes.

## Toasts

Sonner is configured globally in `app/layout.tsx`:

```tsx
<Toaster position="top-right" />
```

Use it anywhere:

```tsx
import { toast } from "sonner";

toast.success("Saved!");
toast.error("Something went wrong");
```

## URL State with nuqs

The `NuqsAdapter` is configured in `app/layout.tsx`. Use `nuqs` to sync component state with URL query parameters:

```tsx
import { useQueryState } from "nuqs";

const [search, setSearch] = useQueryState("q");
```

## Global State with Zustand

Zustand is available for client-side state management. Create stores in `lib/` or a `stores/` directory:

```tsx
import { create } from "zustand";

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

## Forms with Conform + Zod

For server action forms, use Conform with Zod validation. The recommended pattern has three pieces:

1. **`actions.ts`** — define the Zod schema and server action
2. **Form component** — use `useActionState` + `useForm` from Conform for client-side validation
3. **Page** — render the form, passing any default values from the server

### Example: complete form with server action

**1. Define the schema and action (`actions.ts`):**

```ts
"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { parseWithZod } from "@conform-to/zod";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

export async function updateProfile(_prev: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const submission = parseWithZod(formData, { schema: profileSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  if (!user) {
    return submission.reply({ formErrors: ["Not authenticated"] });
  }

  await db.update(users).set({ name: submission.value.name }).where(eq(users.id, user.id));

  return submission.reply();
}
```

**2. Build the form component:**

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useActionState } from "react";
import { toast } from "sonner";
import { profileSchema, updateProfile } from "./actions";

export function ProfileForm({ defaultName }: { defaultName: string }) {
  const [lastResult, formAction, isPending] = useActionState(async (prev: unknown, formData: FormData) => {
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
  );
}
```

**Key points:**

- The same Zod schema validates on both client (`onValidate`) and server (`parseWithZod` in the action)
- `useActionState` connects the form to the server action and provides `isPending` for loading state
- `useForm` from Conform wires up validation attributes, error display, and form state
- `shouldValidate: "onBlur"` gives immediate feedback without being intrusive

See `app/protected/profile/` for a working example that also uses `useOptimistic` for instant UI feedback.

## Adding a Protected Page

Pages under `app/protected/` are automatically guarded by the proxy — unauthenticated users are redirected to `/auth/login`. To add a new protected page:

**1. Create the page file:**

```tsx
// app/protected/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome, {data.claims.email}</p>
    </div>
  );
}
```

**Key points:**

- Default to a **Server Component** (no `"use client"`) — fetch data and check auth on the server
- Use `getClaims()` for fast, local JWT validation (no network call). Use `getUser()` only when you need guaranteed-current data (see [Auth Patterns](auth-patterns.md#getclaims-vs-getuser))
- Always create the Supabase client inside the function, never in a global variable (Fluid Compute requirement)
- Add a navigation link in `app/protected/layout.tsx` if the page should appear in the sidebar/nav

**2. If the page needs client interactivity**, extract interactive parts into a separate client component:

```tsx
// app/protected/dashboard/counter.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return <Button onClick={() => setCount(count + 1)}>Count: {count}</Button>;
}
```

Then import it in the server page:

```tsx
// app/protected/dashboard/page.tsx
import { Counter } from "./counter";

export default async function DashboardPage() {
  // ... auth check ...
  return (
    <div>
      <h1>Dashboard</h1>
      <Counter />
    </div>
  );
}
```

This pattern keeps the page as a Server Component (fast, no client JS for the shell) while allowing interactivity where needed.

## API Route Handlers

Use Route Handlers (`app/api/*/route.ts`) for endpoints that must be called from the client, third-party webhooks, or non-Next.js consumers. For everything else (form submissions, mutations triggered by user interaction), prefer **Server Actions** — they're simpler and co-locate with the component.

### When to use a Route Handler vs. Server Action

| Scenario                                                     | Use           |
| ------------------------------------------------------------ | ------------- |
| Form submission / mutation from a React component            | Server Action |
| Webhook receiver (Stripe, Resend, etc.)                      | Route Handler |
| Public REST endpoint consumed by a mobile app or third party | Route Handler |
| File download / streaming response                           | Route Handler |
| Server-to-server fetch (called from another server)          | Route Handler |

### Example Route Handler

```ts
// app/api/example/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ userId: data.claims.sub });
}

export async function POST(request: Request) {
  const body = await request.json();

  // validate with Zod
  // const result = schema.safeParse(body);

  return NextResponse.json({ received: body }, { status: 201 });
}
```

### Conventions

- One file per resource: `app/api/[resource]/route.ts`
- Always authenticate with `createClient()` from `@/lib/supabase/server` — never trust client-supplied user IDs
- Return `NextResponse.json()` with explicit status codes
- Validate request bodies with Zod before using them

## Utility Hooks

### `useOnlineStatus`

**Location**: `lib/hooks/use-online-status.ts`

Returns `true` when the browser is online and `false` when offline. Reactively updates when connectivity changes. SSR-safe — returns `true` on the server (assumes online during initial render).

```tsx
import { useOnlineStatus } from "@/lib/hooks/use-online-status";

function SaveButton() {
  const isOnline = useOnlineStatus();

  return <button disabled={!isOnline}>{isOnline ? "Save" : "Offline — cannot save"}</button>;
}
```

Built on `useSyncExternalStore` to avoid hydration mismatches between the server snapshot (`true`) and client snapshot (`navigator.onLine`).

The `<OfflineBanner />` component uses this hook internally. If you need offline-aware UI in your own components, import the hook directly rather than coupling to the banner.

## General Conventions

- Import paths use the `@/` alias (e.g., `@/components/ui/button`)
- No relative parent imports (`../` is banned by ESLint)
- Feature components go in `components/`, UI primitives in `components/ui/`
- Prefer composition over props for complex components
