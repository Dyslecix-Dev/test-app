import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { tasks } from "@/lib/db/schema/tasks";
import { users } from "@/lib/db/schema/users";

export const taskComments = pgTable("task_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
