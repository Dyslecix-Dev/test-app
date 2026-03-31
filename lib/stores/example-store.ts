import { create } from "zustand";

// NOTE: example Zustand store — demonstrates the recommended pattern for this full-stack boilerplate.

// Usage in a client component:
//
// "use client";
// import { useExampleStore } from "@/lib/stores/example-store";
// function Counter() {
//   const { count, increment, decrement } = useExampleStore();
//   return (
//     <div>
//       <span>{count}</span>
//       <button onClick={increment}>+</button>
//       <button onClick={decrement}>-</button>
//     </div>
//   );
// }

// TODO: replace this example with your app's actual global state (e.g., shopping cart, sidebar open state, etc.)

interface ExampleState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useExampleStore = create<ExampleState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
