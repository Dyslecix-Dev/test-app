import { setupServer } from "msw/node";

import { handlers } from "@/lib/msw/handlers";

// NOTE: use this in Vitest tests:
//   import { server } from "@/lib/msw/server";
//   beforeAll(() => server.listen());
//   afterEach(() => server.resetHandlers());
//   afterAll(() => server.close());
export const server = setupServer(...handlers);
