import type { TestRun } from "@/lib/types";

export interface TelemetrySink {
  id: string;
  record: (run: TestRun) => void | Promise<void>;
}

const sinks: TelemetrySink[] = [];

export function registerTelemetrySink(sink: TelemetrySink) {
  sinks.push(sink);
}

export async function emitTelemetry(run: TestRun) {
  await Promise.all(sinks.map((sink) => sink.record(run)));
}

export function clearTelemetrySinks() {
  sinks.length = 0;
}

export function listTelemetrySinks() {
  return sinks;
}
