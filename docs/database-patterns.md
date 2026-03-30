# Database Patterns

## Stack

- **ORM**: Drizzle ORM (`drizzle-orm`)
- **Driver**: `postgres` (postgres.js)
- **Database**: PostgreSQL hosted on Supabase
- **Migrations**: Drizzle Kit (`drizzle-kit`)

## Schema

Schemas live in `lib/db/schema/`. Each domain gets its own file (e.g., `users.ts`). All schemas are re-exported from `lib/db/schema/index.ts`.

```ts
// lib/db/schema/users.ts
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "member", "viewer"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: userRoleEnum("role").notNull().default("member"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

### Adding a new table

1. Create a new file in `lib/db/schema/` (e.g., `posts.ts`)
2. Export the table from `lib/db/schema/index.ts`
3. Run `pnpm db:generate` to create a migration
4. Run `pnpm db:migrate` to apply it

## Database Client

The client is initialized in `lib/db/index.ts`:

```ts
import * as schema from "@/lib/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.POSTGRES_URL!, { prepare: false, max: 1 });
export const db = drizzle({ client, schema });
```

**Important**: `prepare: false` is required for Supabase transaction pool mode. Do not enable prepared statements.

## Drizzle Kit Configuration

`drizzle.config.ts` uses `POSTGRES_URL_NON_POOLING` for migrations (direct connection, not pooled). The runtime `lib/db/index.ts` uses `POSTGRES_URL` (pooled connection).

- **Migrations output**: `./drizzle/` directory
- **Schema source**: `./lib/db/schema`

## Commands

| Command            | Description                              |
| ------------------ | ---------------------------------------- |
| `pnpm db:push`     | Push schema directly (dev only)          |
| `pnpm db:generate` | Generate a migration from schema changes |
| `pnpm db:migrate`  | Run pending migrations                   |
| `pnpm db:studio`   | Open Drizzle Studio GUI                  |

## Querying

Import `db` from `@/lib/db` and use Drizzle's query builder:

```ts
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Select
const allUsers = await db.select().from(users);
const user = await db.select().from(users).where(eq(users.email, "test@example.com"));

// Insert
await db.insert(users).values({ email: "new@example.com", name: "New User" });

// Update
await db.update(users).set({ name: "Updated" }).where(eq(users.id, userId));

// Delete
await db.delete(users).where(eq(users.id, userId));
```

## Seeding

The seed script lives in `lib/db/seed.ts` and is run with:

```bash
pnpm db:seed
```

By default it inserts three placeholder users (admin, member, viewer) to demonstrate the `user_role` enum. The seed uses `onConflictDoNothing()` so it is safe to run multiple times without duplicate key errors. Replace the seed data with whatever your app needs for local development:

```ts
// lib/db/seed.ts
async function seed() {
  await db
    .insert(schema.users)
    .values([
      { email: "admin@example.com", name: "Admin User", role: "admin" },
      // add your own seed data here
    ])
    .onConflictDoNothing();
}
```

The seed script uses `POSTGRES_URL_NON_POOLING` (direct connection) to avoid pooling issues during bulk inserts.

## Conventions

- Use `uuid` primary keys with `defaultRandom()`
- Include `createdAt` and `updatedAt` timestamps on all tables
- Use snake_case for column names in the database, camelCase in TypeScript
- One schema file per domain/table in `lib/db/schema/`
