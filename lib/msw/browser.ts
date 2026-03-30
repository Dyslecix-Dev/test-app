import { setupWorker } from "msw/browser";

import { handlers } from "@/lib/msw/handlers";

// NOTE: use this for in-browser API mocking during development.
// See https://mswjs.io/docs/integrations/browser
export const worker = setupWorker(...handlers);
