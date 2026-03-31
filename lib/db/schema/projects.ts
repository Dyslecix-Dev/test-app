import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "@/lib/db/schema/users";

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  // hex color string — used to color-code project cards
  color: text("color").notNull().default("#6366f1"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
