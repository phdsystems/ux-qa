import { promises as fs } from "node:fs";
import path from "node:path";
import type { TestRunStore } from "@/lib/storage/types";
import type { TestRun } from "@/lib/types";
import { dataFilePath, maxRuns } from "@/lib/config";

let cache: TestRun[] = [];
let loaded = false;

async function ensureLoaded() {
  if (loaded) {
    return;
  }
  try {
    const contents = await fs.readFile(dataFilePath, "utf-8");
    cache = JSON.parse(contents) as TestRun[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn("Failed to load run history", error);
    }
    cache = [];
  }
  loaded = true;
}

async function persist() {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(cache, null, 2));
}

export const fileStore: TestRunStore = {
  async add(run) {
    await ensureLoaded();
    cache.unshift(run);
    if (cache.length > maxRuns) {
      cache.length = maxRuns;
    }
    await persist();
  },
  async all() {
    await ensureLoaded();
    return cache;
  }
};
