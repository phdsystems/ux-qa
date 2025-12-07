import type { TestRun } from "@/lib/types";

export type RunListener = (run: TestRun) => void;

const listeners = new Set<RunListener>();

export function subscribe(listener: RunListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function broadcastRun(run: TestRun) {
  for (const listener of listeners) {
    try {
      listener(run);
    } catch (error) {
      console.error("Run listener failed", error);
    }
  }
}
