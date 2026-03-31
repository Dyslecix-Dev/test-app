import { count, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { projects, tasks } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

async function DashboardStats({ userId }: { userId: string }) {
  const [projectCount] = await db.select({ count: count() }).from(projects).where(eq(projects.userId, userId));

  const taskStats = await db
    .select({ status: tasks.status, count: count() })
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .where(eq(projects.userId, userId))
    .groupBy(tasks.status);

  const statsByStatus = Object.fromEntries(taskStats.map((s) => [s.status, Number(s.count)]));
  const totalTasks = taskStats.reduce((sum, s) => sum + Number(s.count), 0);
  const doneTasks = statsByStatus["done"] ?? 0;
  const completionPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const recentProjects = await db
    .select({ id: projects.id, name: projects.name, color: projects.color, taskCount: count(tasks.id) })
    .from(projects)
    .leftJoin(tasks, eq(tasks.projectId, projects.id))
    .where(eq(projects.userId, userId))
    .groupBy(projects.id)
    .orderBy(projects.createdAt)
    .limit(3);

  return (
    <div className="flex flex-col gap-8">
      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{projectCount.count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wide uppercase">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{(statsByStatus["in_progress"] ?? 0) + (statsByStatus["in_review"] ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completionPct}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      {totalTasks > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall completion</span>
            <span className="font-medium">
              {doneTasks} / {totalTasks} tasks done
            </span>
          </div>
          <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${completionPct}%` }}
              role="progressbar"
              aria-valuenow={completionPct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      {/* Task breakdown */}
      {totalTasks > 0 && (
        <div className="flex flex-wrap gap-3">
          {[
            { key: "todo", label: "To Do" },
            { key: "in_progress", label: "In Progress" },
            { key: "in_review", label: "In Review" },
            { key: "done", label: "Done" },
          ].map(({ key, label }) => (
            <Badge key={key} variant="secondary">
              {label}: {statsByStatus[key] ?? 0}
            </Badge>
          ))}
        </div>
      )}

      {/* Recent projects */}
      {recentProjects.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Recent Projects</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {recentProjects.map((p) => (
              <Link key={p.id} href={`/protected/projects/${p.id}`} className="group">
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                      <CardTitle className="text-sm">{p.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-xs">
                      {p.taskCount} task{p.taskCount !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recentProjects.length === 0 && (
        <div className="border-border rounded-xl border-2 border-dashed py-12 text-center">
          <p className="text-muted-foreground text-sm">No projects yet. Get started by creating one.</p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/protected/projects/new">Create your first project</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Welcome back, {data.claims.email}</p>
        </div>
        <Button asChild>
          <Link href="/protected/projects">View Projects</Link>
        </Button>
      </div>
      <DashboardStats userId={data.claims.sub as string} />
    </div>
  );
}
