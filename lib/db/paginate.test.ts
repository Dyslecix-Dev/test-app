import { describe, expect, it } from "vitest";

import { paginate } from "@/lib/db/paginate";

// NOTE: minimal mock PgSelect that records limit/offset and returns fake data
function createMockQuery(data: unknown[]) {
  const state = { limitVal: 0, offsetVal: 0 };

  const query = {
    limit(n: number) {
      state.limitVal = n;
      return query;
    },
    offset(n: number) {
      state.offsetVal = n;
      return data;
    },
  };

  return { query, state };
}

describe("paginate", () => {
  it("returns first page with correct metadata", async () => {
    const items = [{ id: 1 }, { id: 2 }];
    const { query } = createMockQuery(items);

    const result = await paginate(query as never, 25, { page: 1, pageSize: 10 });

    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.totalCount).toBe(25);
    expect(result.totalPages).toBe(3);
    expect(result.hasNextPage).toBe(true);
    expect(result.hasPreviousPage).toBe(false);
    expect(result.data).toEqual(items);
  });

  it("returns last page correctly", async () => {
    const items = [{ id: 5 }];
    const { query } = createMockQuery(items);

    const result = await paginate(query as never, 25, { page: 3, pageSize: 10 });

    expect(result.page).toBe(3);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPreviousPage).toBe(true);
  });

  it("clamps page to minimum of 1", async () => {
    const { query } = createMockQuery([]);

    const result = await paginate(query as never, 10, { page: -5, pageSize: 10 });

    expect(result.page).toBe(1);
  });

  it("clamps pageSize between 1 and 100", async () => {
    const { query: q1 } = createMockQuery([]);
    const result1 = await paginate(q1 as never, 10, { page: 1, pageSize: 0 });
    expect(result1.pageSize).toBe(1);

    const { query: q2 } = createMockQuery([]);
    const result2 = await paginate(q2 as never, 10, { page: 1, pageSize: 999 });
    expect(result2.pageSize).toBe(100);
  });

  it("defaults to page 1 and pageSize 10", async () => {
    const { query } = createMockQuery([]);

    const result = await paginate(query as never, 50, {});

    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.totalPages).toBe(5);
  });

  it("handles zero totalCount", async () => {
    const { query } = createMockQuery([]);

    const result = await paginate(query as never, 0, { page: 1, pageSize: 10 });

    expect(result.totalPages).toBe(0);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPreviousPage).toBe(false);
    expect(result.data).toEqual([]);
  });
});
