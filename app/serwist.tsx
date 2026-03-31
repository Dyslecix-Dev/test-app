"use client";

import { SerwistProvider as BaseSerwistProvider } from "@serwist/turbopack/react";
import type { ComponentProps, ReactNode } from "react";

export function SerwistProvider({ children, ...props }: ComponentProps<typeof BaseSerwistProvider> & { children: ReactNode }) {
  if (process.env.NODE_ENV !== "production") {
    return <>{children}</>;
  }
  return <BaseSerwistProvider {...props}>{children}</BaseSerwistProvider>;
}
