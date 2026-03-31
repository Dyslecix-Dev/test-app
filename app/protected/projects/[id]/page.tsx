import { and, desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteProject } from "@/app/protected/projects/actions";
import { ProjectTasks } from "@/components/project-tasks";
import { TaskForm } from "@/components/task-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { projects, tasks, users } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const [project] = await db.select({ name: projects.name }).from(projects).where(eq(projects.id, id));
  return { title: project ? `${project.name} | TaskFlow` : "Project | TaskFlow" };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, user!.id)));

  if (!project) notFound();

  const projectTasks = await db.select().from(tasks).where(eq(tasks.projectId, id)).orderBy(desc(tasks.createdAt));

  // users that could be assigned to tasks (all app users)
  const allUsers = await db.select({ id: users.id, name: users.name, email: users.email }).from(users);

  const todoCount = projectTasks.filter((t) => t.status === "todo").length;
  const inProgressCount = projectTasks.filter((t) => t.status === "in_progress" || t.status === "in_review").length;
  const doneCount = projectTasks.filter((t) => t.status === "done").length;

  return (
    <div className="flex w-full flex-1 flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/protected/projects">&larr; Projects</Link>
          </Button>
          <span className="inline-block h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} aria-hidden="true" />
          <h1 className="text-2xl font-bold">{project.name}</h1>
        </div>
        <form action={deleteProject.bind(null, project.id)}>
          <Button type="submit" variant="destructive" size="sm">
            Delete Project
          </Button>
        </form>
      </div>

      {project.description && <p className="text-muted-foreground -mt-4 text-sm">{project.description}</p>}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wide uppercase">To Do</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{todoCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wide uppercase">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{inProgressCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Done</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{doneCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* New task form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Task</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm projectId={project.id} assignableUsers={allUsers} />
        </CardContent>
      </Card>

      {/* Task board */}
      <ProjectTasks tasks={projectTasks} projectId={project.id} />
    </div>
  );
}
