import type { Metadata } from "next";
import Link from "next/link";

import { ProjectForm } from "@/components/project-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "New Project | TaskFlow",
};

export default function NewProjectPage() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/protected/projects">&larr; Back</Link>
        </Button>
        <h1 className="text-2xl font-bold">New Project</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create a Project</CardTitle>
          <CardDescription>Give your project a name, description, and a color to identify it quickly.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm />
        </CardContent>
      </Card>
    </div>
  );
}
