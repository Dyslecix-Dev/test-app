// NOTE: health check endpoint for uptime monitoring (e.g., Better Stack).
// Returns 200 if the app and database are reachable, 503 otherwise.
import { sql } from "drizzle-orm";

import { db } from "@/lib/db";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return Response.json({ status: "ok" });
  } catch {
    return Response.json({ status: "error", message: "Database connection failed" }, { status: 503 });
  }
}
