import type { PgSelect } from "drizzle-orm/pg-core";

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// NOTE: adds offset pagination to any Drizzle SELECT query.
// The caller is responsible for computing `totalCount` using the same filters applied to the data query — this avoids filter/count mismatches.

// Usage:
// ```ts
// const where = eq(users.role, "member");
// const totalCount = await db.select({ count: count() }).from(users).where(where);
// const result = await paginate(
//   db.select().from(users).where(where).orderBy(desc(users.createdAt)).$dynamic(),
//   Number(totalCount[0].count),
//   { page: 2, pageSize: 10 },
// );
// // result.data, result.totalCount, result.totalPages, etc.
// ```

export async function paginate<T extends PgSelect>(query: T, totalCount: number, params: PaginationParams): Promise<PaginatedResult<Awaited<T>>> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 10));
  const offset = (page - 1) * pageSize;

  const data = await query.limit(pageSize).offset(offset);
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    data: data as PaginatedResult<Awaited<T>>["data"],
    page,
    pageSize,
    totalCount,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
