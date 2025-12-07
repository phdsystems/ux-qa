import type { TestRunStore } from "@/lib/storage/types";
import type { TestRun } from "@/lib/types";
import { maxRuns } from "@/lib/config";

const runs: TestRun[] = [];

export const memoryStore: TestRunStore = {
  async add(run) {
    runs.unshift(run);
    if (runs.length > maxRuns) {
      runs.length = maxRuns;
    }
  },
  async all() {
    return runs;
  }
};
