import type { InferSelectModel } from "drizzle-orm";
import { count, desc } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { paginate } from "@/lib/db/paginate";
import { users } from "@/lib/db/schema";

type User = InferSelectModel<typeof users>;

export const metadata: Metadata = {
  title: "Users",
};

// NOTE: example paginated server component.
// Demonstrates offset pagination with the Drizzle `paginate()` helper.

// NOTE: URL pattern - /protected/users?page=1&pageSize=10

// TODO: replace this demo page with your app's actual paginated data

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ page?: string; pageSize?: string }> }) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;

  const [{ count: totalCount }] = await db.select({ count: count() }).from(users);
  const result = await paginate(db.select().from(users).orderBy(desc(users.createdAt)).$dynamic(), Number(totalCount), { page, pageSize });

  return (
    <div className="flex w-full flex-1 flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Users</h2>
        <p className="text-muted-foreground text-sm">
          {result.totalCount} total &middot; Page {result.page} of {result.totalPages}
        </p>
      </div>

      <div className="grid gap-3">
        {(result.data as unknown as User[]).map((user) => (
          <Card key={user.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{user.name ?? "Unnamed"}</CardTitle>
                <Badge variant="secondary">{user.role}</Badge>
              </div>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-xs">Joined {user.createdAt.toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
        {result.data.length === 0 && <p className="text-muted-foreground text-sm">No users found. Run `pnpm db:seed` to create example data.</p>}
      </div>

      <div className="flex items-center justify-center gap-2">
        {result.hasPreviousPage ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/protected/users?page=${page - 1}&pageSize=${pageSize}`}>&larr; Previous</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            &larr; Previous
          </Button>
        )}
        {result.hasNextPage ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/protected/users?page=${page + 1}&pageSize=${pageSize}`}>Next &rarr;</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next &rarr;
          </Button>
        )}
      </div>
    </div>
  );
}
