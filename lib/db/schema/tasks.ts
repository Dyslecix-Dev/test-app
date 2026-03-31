import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { projects } from "@/lib/db/schema/projects";
import { users } from "@/lib/db/schema/users";

export const taskStatusEnum = pgEnum("task_status", ["todo", "in_progress", "in_review", "done"]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high", "urgent"]);

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  // nullable — unassigned tasks are valid
  assigneeId: uuid("assignee_id").references(() => users.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default("todo"),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  dueDate: timestamp("due_date"),
  // Supabase Storage public URL for an attached file
  attachmentUrl: text("attachment_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
