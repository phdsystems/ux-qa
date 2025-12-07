import { storageDriver } from "@/lib/config";
import { memoryStore } from "@/lib/storage/memory";
import { fileStore } from "@/lib/storage/file";
import type { TestRunStore } from "@/lib/storage/types";

let store: TestRunStore | null = null;

function resolveStore(): TestRunStore {
  if (store) {
    return store;
  }
  if (storageDriver === "file") {
    store = fileStore;
  } else {
    store = memoryStore;
  }
  return store;
}

export function getStore() {
  return resolveStore();
}
