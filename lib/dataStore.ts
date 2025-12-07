import { randomUUID } from "node:crypto";
import type { CreateRunPayload, TestRun } from "@/lib/types";
import { recordRunMetrics } from "@/lib/telemetry";
import { getStore } from "@/lib/storage";
import { broadcastRun } from "@/lib/events";
import { notifyAlerts } from "@/lib/alerts";

const store = getStore();

export async function addRun(payload: CreateRunPayload): Promise<TestRun> {
  const run: TestRun = {
    id: randomUUID(),
    ...payload,
    createdAt: new Date().toISOString()
  };
  await store.add(run);
  recordRunMetrics(run);
  broadcastRun(run);
  void notifyAlerts(run);
  return run;
}

export async function listRuns(): Promise<TestRun[]> {
  return store.all();
}

export async function listByApp() {
  const runs = await listRuns();
  return runs.reduce<Record<string, TestRun[]>>((acc, run) => {
    if (!acc[run.appId]) {
      acc[run.appId] = [];
    }
    acc[run.appId].push(run);
    return acc;
  }, {});
}
