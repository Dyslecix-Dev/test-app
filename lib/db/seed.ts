import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/db/schema/index";

const client = postgres(process.env.POSTGRES_URL_NON_POOLING!, { prepare: false });
const db = drizzle({ client, schema });

async function seed() {
  console.log("Seeding database...");

  // TODO: replace with seed data relevant to your app
  await db
    .insert(schema.users)
    .values([
      { email: "admin@example.com", name: "Admin User", role: "admin" },
      { email: "member@example.com", name: "Member User", role: "member" },
      { email: "viewer@example.com", name: "Viewer User", role: "viewer" },
    ])
    .onConflictDoNothing();

  console.log("Seeding complete.");
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
