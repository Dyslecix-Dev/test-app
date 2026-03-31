"use client";

import { parseAsString, useQueryState } from "nuqs";

// NOTE: example nuqs hook — demonstrates URL query state management.
// nuqs keeps URL search params in sync with React state, so users can bookmark or share filtered/sorted views. The NuqsAdapter in the root layout makes this work with the Next.js App Router.

// Usage in a client component:
// ```tsx
// "use client";
// import { useSearchFilter } from "@/lib/hooks/use-search-params";

// function SearchBar() {
//   const [query, setQuery] = useSearchFilter();
//   return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
// }
// ```

// NOTE: the URL updates to `?q=search+term` as the user types.
// See https://nuqs.47ng.com for more parsers (parseAsInteger, parseAsArrayOf, etc.)

// TODO: replace this example with your app's actual URL state (e.g., filters, sort order, pagination, etc.)

export function useSearchFilter() {
  return useQueryState("q", parseAsString.withDefault(""));
}
