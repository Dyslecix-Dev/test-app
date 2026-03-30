"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useExampleStore } from "@/lib/stores/example-store";

// NOTE: example client component consuming the Zustand store.
// Demonstrates the recommended pattern for global client-side state.

// TODO: replace this demo with your app's actual Zustand-powered component

export function ExampleCounter() {
  const { count, increment, decrement, reset } = useExampleStore();

  return (
    <Card className="max-w-xs">
      <CardHeader>
        <CardTitle>Zustand Counter</CardTitle>
        <CardDescription>Global state shared across components.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={decrement}>
            -
          </Button>
          <span className="min-w-[3ch] text-center text-2xl font-bold tabular-nums">{count}</span>
          <Button variant="outline" size="sm" onClick={increment}>
            +
          </Button>
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
