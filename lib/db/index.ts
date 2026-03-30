import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/db/schema";

// NOTE: for Supabase with transaction pool mode, prepared statements must be disabled
const client = postgres(process.env.POSTGRES_URL!, { prepare: false, max: 1 });

export const db = drizzle({ client, schema });
