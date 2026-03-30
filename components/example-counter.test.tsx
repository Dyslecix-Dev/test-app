// NOTE: example component test — demonstrates the recommended pattern for testing interactive client components with Testing Library and user-event.

// Key patterns shown:
// - Rendering a component that depends on a Zustand store
// - Simulating user clicks with userEvent
// - Asserting on DOM content and accessible roles
// - Resetting shared state between tests

// TODO: replace this example with tests for your own components

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { useExampleStore } from "@/lib/stores/example-store";
import { ExampleCounter } from "./example-counter";

describe("ExampleCounter", () => {
  afterEach(() => {
    // Reset Zustand store between tests to prevent state leaking
    useExampleStore.setState({ count: 0 });
  });

  it("renders with initial count of 0", () => {
    render(<ExampleCounter />);

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("Zustand Counter")).toBeInTheDocument();
  });

  it("increments the count when + is clicked", async () => {
    const user = userEvent.setup();
    render(<ExampleCounter />);

    await user.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText("1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("decrements the count when - is clicked", async () => {
    const user = userEvent.setup();
    render(<ExampleCounter />);

    await user.click(screen.getByRole("button", { name: "-" }));
    expect(screen.getByText("-1")).toBeInTheDocument();
  });

  it("resets the count to 0 when Reset is clicked", async () => {
    const user = userEvent.setup();
    render(<ExampleCounter />);

    // Increment a few times, then reset
    await user.click(screen.getByRole("button", { name: "+" }));
    await user.click(screen.getByRole("button", { name: "+" }));
    await user.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText("3")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /reset/i }));
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("reflects external store changes", () => {
    render(<ExampleCounter />);

    // NOTE: simulate another component updating the store — wrap in act() since the state change happens outside of React's event system
    act(() => useExampleStore.setState({ count: 42 }));
    expect(screen.getByText("42")).toBeInTheDocument();
  });
});
