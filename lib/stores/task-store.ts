import { create } from "zustand";

// Global UI state for TaskFlow's project/task views.
// viewMode is persisted in memory — resets on page reload (use URL params for shareable state).

interface TaskState {
  viewMode: "list" | "kanban";
  setViewMode: (mode: "list" | "kanban") => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  viewMode: "list",
  setViewMode: (mode) => set({ viewMode: mode }),
}));
