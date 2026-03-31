import { count, desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { projects, tasks } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Projects | TaskFlow",
};

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      color: projects.color,
      createdAt: projects.createdAt,
      taskCount: count(tasks.id),
    })
    .from(projects)
    .leftJoin(tasks, eq(tasks.projectId, projects.id))
    .where(eq(projects.userId, user!.id))
    .groupBy(projects.id)
    .orderBy(desc(projects.createdAt));

  return (
    <div className="flex w-full flex-1 flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your work across projects</p>
        </div>
        <Button asChild>
          <Link href="/protected/projects/new">+ New Project</Link>
        </Button>
      </div>

      {userProjects.length === 0 ? (
        <div className="border-border rounded-xl border-2 border-dashed py-16 text-center">
          <p className="text-muted-foreground text-sm">No projects yet.</p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/protected/projects/new">Create your first project</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userProjects.map((project) => (
            <Link key={project.id} href={`/protected/projects/${project.id}`} className="group">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: project.color }} aria-hidden="true" />
                      <CardTitle className="text-base leading-snug">{project.name}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {project.taskCount} task{project.taskCount !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  {project.description && <CardDescription className="line-clamp-2 text-sm">{project.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-xs">Created {project.createdAt.toLocaleDateString()}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
