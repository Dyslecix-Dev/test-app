import { describe, expect, it, vi } from "vitest";

// TODO: mock the db module before importing the function under test
const mockFindFirst = vi.fn();
const mockInsert = vi.fn();
const mockValues = vi.fn();
const mockOnConflictDoNothing = vi.fn();
const mockReturning = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      users: {
        findFirst: (...args: unknown[]) => mockFindFirst(...args),
      },
    },
    insert: (...args: unknown[]) => {
      mockInsert(...args);
      return {
        values: (...vArgs: unknown[]) => {
          mockValues(...vArgs);
          return {
            onConflictDoNothing: () => {
              mockOnConflictDoNothing();
              return { returning: () => mockReturning() };
            },
          };
        },
      };
    },
  },
}));

vi.mock("@/lib/db/schema", () => ({
  users: { id: "id" },
}));

vi.mock("drizzle-orm", () => ({
  eq: (col: unknown, val: unknown) => ({ col, val }),
}));

import { beforeEach } from "vitest";
import { createOrGetUser } from "./ensure-user";

describe("createOrGetUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns existing user without inserting", async () => {
    const existingUser = { id: "abc-123", email: "test@example.com", name: "Test" };
    mockFindFirst.mockResolvedValueOnce(existingUser);

    const result = await createOrGetUser({ id: "abc-123", email: "test@example.com" });

    expect(result).toEqual(existingUser);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("inserts and returns new user when not found", async () => {
    const newUser = { id: "new-123", email: "new@example.com", name: null };
    mockFindFirst.mockResolvedValueOnce(undefined);
    mockReturning.mockResolvedValueOnce([newUser]);

    const result = await createOrGetUser({ id: "new-123", email: "new@example.com" });

    expect(result).toEqual(newUser);
    expect(mockValues).toHaveBeenCalledWith({ id: "new-123", email: "new@example.com" });
  });

  it("falls back to findFirst when insert returns nothing (race condition)", async () => {
    const user = { id: "race-123", email: "race@example.com", name: null };
    mockFindFirst
      .mockResolvedValueOnce(undefined) // first check — not found
      .mockResolvedValueOnce(user); // fallback after conflict
    mockReturning.mockResolvedValueOnce([undefined]);

    const result = await createOrGetUser({ id: "race-123", email: "race@example.com" });

    expect(result).toEqual(user);
    expect(mockFindFirst).toHaveBeenCalledTimes(2);
  });
});
