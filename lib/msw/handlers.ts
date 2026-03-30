import { http, HttpResponse } from "msw";

// NOTE: define your API mock handlers here.
// See https://mswjs.io/docs/basics/intercepting-requests
export const handlers = [
  http.get("/api/health", () => {
    return HttpResponse.json({ status: "ok" });
  }),
];
