import type { TestRun } from "@/lib/types";

export interface TestRunStore {
  add(run: TestRun): Promise<void>;
  all(): Promise<TestRun[]>;
}
