"use client";

import type { InferSelectModel } from "drizzle-orm";
import { useQueryState } from "nuqs";
import { useTransition } from "react";
import { toast } from "sonner";

import { updateTaskStatus } from "@/app/protected/projects/[id]/actions";
import { TaskCard } from "@/components/task-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tasks } from "@/lib/db/schema";
import { useTaskStore } from "@/lib/stores/task-store";
import { cn } from "@/lib/utils";

type Task = InferSelectModel<typeof tasks>;
type TaskStatus = "todo" | "in_progress" | "in_review" | "done";
type TaskPriority = "low" | "medium" | "high" | "urgent";

const STATUS_COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "in_review", label: "In Review" },
  { key: "done", label: "Done" },
];

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
};

interface ProjectTasksProps {
  tasks: Task[];
  projectId: string;
}

export function ProjectTasks({ tasks: allTasks, projectId }: ProjectTasksProps) {
  const { viewMode, setViewMode } = useTaskStore();
  const [statusFilter, setStatusFilter] = useQueryState("status");
  const [priorityFilter, setPriorityFilter] = useQueryState("priority");
  const [isPending, startTransition] = useTransition();

  const filtered = allTasks.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    return true;
  });

  function handleStatusChange(taskId: string, status: TaskStatus) {
    startTransition(async () => {
      try {
        await updateTaskStatus(projectId, taskId, status);
        toast.success("Task moved to " + STATUS_LABELS[status]);
      } catch {
        toast.error("Failed to update task status");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* View mode toggle */}
        <div className="flex rounded-md border">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={cn("rounded-l-md px-3 py-1.5 text-sm transition-colors", viewMode === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setViewMode("kanban")}
            className={cn("rounded-r-md px-3 py-1.5 text-sm transition-colors", viewMode === "kanban" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
          >
            Kanban
          </button>
        </div>

        {/* Status filter */}
        <select
          value={statusFilter ?? ""}
          onChange={(e) => setStatusFilter(e.target.value || null)}
          className="border-input bg-background h-9 rounded-md border px-2 text-sm"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {STATUS_COLUMNS.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>

        {/* Priority filter */}
        <select
          value={priorityFilter ?? ""}
          onChange={(e) => setPriorityFilter(e.target.value || null)}
          className="border-input bg-background h-9 rounded-md border px-2 text-sm"
          aria-label="Filter by priority"
        >
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        {(statusFilter || priorityFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter(null);
              setPriorityFilter(null);
            }}
          >
            Clear filters
          </Button>
        )}

        <span className="text-muted-foreground ml-auto text-sm">
          {filtered.length} task{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* List view */}
      {viewMode === "list" && (
        <div className="flex flex-col gap-2">
          {filtered.length === 0 && <p className="text-muted-foreground text-sm">No tasks match your filters.</p>}
          {filtered.map((task) => (
            <div key={task.id} className="flex items-center gap-3">
              <TaskCard task={task} projectId={projectId} />
              <select
                disabled={isPending}
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                className="border-input bg-background h-8 rounded-md border px-2 text-xs"
                aria-label={`Move ${task.title}`}
              >
                {STATUS_COLUMNS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Kanban view */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATUS_COLUMNS.map((col) => {
            const colTasks = filtered.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="bg-muted/40 flex flex-col gap-2 rounded-lg p-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-sm font-semibold">{col.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {colTasks.length}
                  </Badge>
                </div>
                {colTasks.map((task) => (
                  <div key={task.id}>
                    <TaskCard task={task} projectId={projectId} />
                    {/* Quick move buttons */}
                    <div className="mt-1 flex gap-1">
                      {STATUS_COLUMNS.filter((c) => c.key !== col.key).map((c) => (
                        <button
                          key={c.key}
                          type="button"
                          disabled={isPending}
                          onClick={() => handleStatusChange(task.id, c.key)}
                          className="text-muted-foreground hover:text-foreground rounded px-1 text-xs transition-colors"
                          title={`Move to ${c.label}`}
                        >
                          → {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && <p className="text-muted-foreground py-4 text-center text-xs">Empty</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
