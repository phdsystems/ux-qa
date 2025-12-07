import { promises as fs } from "node:fs";
import path from "node:path";
import { settingsFilePath } from "@/lib/config";

export interface DashboardSettings {
  hiddenWidgets: string[];
  theme?: string;
  savedFilters?: SavedFilter[];
}

export interface SavedFilter {
  id: string;
  name: string;
  status: "all" | "passed" | "failed" | "unstable";
  environment?: string;
  suite?: string;
}

const defaultSettings: DashboardSettings = {
  hiddenWidgets: [],
  theme: "dark"
};

let cache: DashboardSettings | null = null;

async function loadSettings() {
  if (cache) {
    return cache;
  }
  try {
    const contents = await fs.readFile(settingsFilePath, "utf-8");
    cache = JSON.parse(contents) as DashboardSettings;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn("Failed to load dashboard settings", error);
    }
    cache = defaultSettings;
  }
  return cache;
}

async function persist(settings: DashboardSettings) {
  await fs.mkdir(path.dirname(settingsFilePath), { recursive: true });
  await fs.writeFile(settingsFilePath, JSON.stringify(settings, null, 2));
  cache = settings;
}

export async function getSettings() {
  return loadSettings();
}

export async function updateSettings(partial: Partial<DashboardSettings>) {
  const current = await loadSettings();
  const next = { ...current, ...partial };
  await persist(next);
  return next;
}
