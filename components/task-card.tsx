import type { InferSelectModel } from "drizzle-orm";
import Link from "next/link";

import { tasks } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

type Task = InferSelectModel<typeof tasks>;

const priorityConfig = {
  low: { label: "Low", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  medium: { label: "Medium", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  high: { label: "High", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  urgent: { label: "Urgent", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
};

interface TaskCardProps {
  task: Task;
  projectId: string;
}

export function TaskCard({ task, projectId }: TaskCardProps) {
  const priority = priorityConfig[task.priority];
  const isOverdue = task.dueDate && task.status !== "done" && new Date(task.dueDate) < new Date();

  return (
    <Link href={`/protected/projects/${projectId}/tasks/${task.id}`} className="block">
      <div className="bg-card hover:bg-accent/50 border-border rounded-lg border p-3 transition-colors">
        <p className="text-sm leading-snug font-medium">{task.title}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", priority.className)}>{priority.label}</span>
          {task.attachmentUrl && <span className="text-muted-foreground text-xs">📎</span>}
          {task.dueDate && (
            <span className={cn("text-xs", isOverdue ? "text-destructive font-medium" : "text-muted-foreground")}>
              {isOverdue ? "⚠ " : ""}
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
