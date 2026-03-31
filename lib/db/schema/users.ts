import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// TODO: update user roles to match your app's permission model
export const userRoleEnum = pgEnum("user_role", ["admin", "member", "viewer"]);

export const users = pgTable("users", {
  // WARNING: must match the Supabase Auth user ID (passed explicitly via createOrGetUser()).
  // Do not create rows without providing the Supabase Auth UUID as the id.
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: userRoleEnum("role").notNull().default("member"),
  // NOTE: used by re-engagement push notifications to detect inactive users.
  // Updated automatically by the <ActivityTracker /> component on each visit.
  lastActiveAt: timestamp("last_active_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
