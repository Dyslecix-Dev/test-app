import { and, asc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteTask } from "@/app/protected/projects/[id]/actions";
import { CommentForm } from "@/components/comment-form";
import { TaskAttachment } from "@/components/task-attachment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { projects, taskComments, tasks, users } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

const priorityConfig = {
  low: { label: "Low", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  medium: { label: "Medium", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  high: { label: "High", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  urgent: { label: "Urgent", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
};

const statusLabels: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
};

export async function generateMetadata({ params }: { params: Promise<{ id: string; taskId: string }> }): Promise<Metadata> {
  const { taskId } = await params;
  const [task] = await db.select({ title: tasks.title }).from(tasks).where(eq(tasks.id, taskId));
  return { title: task ? `${task.title} | TaskFlow` : "Task | TaskFlow" };
}

export default async function TaskPage({ params }: { params: Promise<{ id: string; taskId: string }> }) {
  const { id: projectId, taskId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user!.id)));

  if (!project) notFound();

  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)));

  if (!task) notFound();

  const comments = await db
    .select({
      id: taskComments.id,
      body: taskComments.body,
      createdAt: taskComments.createdAt,
      authorName: users.name,
      authorEmail: users.email,
    })
    .from(taskComments)
    .innerJoin(users, eq(taskComments.userId, users.id))
    .where(eq(taskComments.taskId, taskId))
    .orderBy(asc(taskComments.createdAt));

  let assignee: { name: string | null; email: string } | null = null;
  if (task.assigneeId) {
    const [a] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, task.assigneeId));
    assignee = a ?? null;
  }

  const isOverdue = task.dueDate && task.status !== "done" && new Date(task.dueDate) < new Date();
  const priority = priorityConfig[task.priority];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/protected/projects" className="text-muted-foreground hover:text-foreground">
          Projects
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link href={`/protected/projects/${projectId}`} className="text-muted-foreground hover:text-foreground">
          {project.name}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground truncate font-medium">{task.title}</span>
      </div>

      {/* Task header */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl leading-snug font-bold">{task.title}</h1>
        <form action={deleteTask.bind(null, projectId, taskId)}>
          <Button type="submit" variant="destructive" size="sm">
            Delete
          </Button>
        </form>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="secondary">{statusLabels[task.status]}</Badge>
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", priority.className)}>{priority.label}</span>
        {task.dueDate && (
          <span className={cn("text-xs", isOverdue ? "text-destructive font-semibold" : "text-muted-foreground")}>
            Due: {new Date(task.dueDate).toLocaleDateString()}
            {isOverdue ? " (overdue)" : ""}
          </span>
        )}
        {assignee && <span className="text-muted-foreground text-xs">Assigned to: {assignee.name ?? assignee.email}</span>}
      </div>

      {/* Description */}
      {task.description && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{task.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Attachment */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Attachment</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskAttachment projectId={projectId} taskId={taskId} currentUrl={task.attachmentUrl} />
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Comments ({comments.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {comments.length > 0 && (
            <div className="flex flex-col gap-3">
              {comments.map((c) => (
                <div key={c.id} className="bg-muted/50 rounded-lg p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-medium">{c.authorName ?? c.authorEmail}</span>
                    <span className="text-muted-foreground text-xs">{c.createdAt.toLocaleString()}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{c.body}</p>
                </div>
              ))}
            </div>
          )}
          <CommentForm projectId={projectId} taskId={taskId} />
        </CardContent>
      </Card>
    </div>
  );
}
