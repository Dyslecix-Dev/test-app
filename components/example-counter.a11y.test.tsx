// NOTE: example accessibility test — demonstrates how to use vitest-axe to catch a11y violations in component renders.
// This complements Lighthouse CI (which tests pages at initial render) by testing components in specific interactive states: error messages visible, dialogs open, form fields filled, etc.

// Key patterns shown:
// - Running axe on the rendered DOM
// - Testing multiple component states for a11y violations

// TODO: replace this example with a11y tests for your own components

import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import type { NoViolationsMatcherResult } from "vitest-axe/matchers";

declare module "vitest" {
  // NOTE: extends Vitest's Assertion interface with vitest-axe matchers
  interface Assertion<T> {
    toHaveNoViolations(): NoViolationsMatcherResult;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): NoViolationsMatcherResult;
  }
}

import { ExampleCounter } from "./example-counter";

describe("ExampleCounter a11y", () => {
  it("has no accessibility violations in default state", async () => {
    const { container } = render(<ExampleCounter />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations after interaction", async () => {
    const user = userEvent.setup();
    const { container } = render(<ExampleCounter />);

    // NOTE: test a11y after state changes — important for components that conditionally render content (error messages, expanded sections, etc.)
    await user.click(container.querySelector("button")!);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
