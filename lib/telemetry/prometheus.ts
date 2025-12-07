import { Counter, Gauge, Registry, collectDefaultMetrics } from "prom-client";
import type { TestRun } from "@/lib/types";
import { prometheusEnabled } from "@/lib/config";
import { registerTelemetrySink } from "@/lib/spi/telemetry";

const registry = new Registry();
collectDefaultMetrics({ register: registry });

const runCounter = new Counter({
  name: "playwright_runs_total",
  help: "Number of test runs ingested",
  labelNames: ["app", "suite", "status"],
  registers: [registry]
});

const coverageGauge = new Gauge({
  name: "playwright_run_coverage",
  help: "Coverage percentage reported with the run",
  labelNames: ["app", "suite"],
  registers: [registry]
});

const durationGauge = new Gauge({
  name: "playwright_run_duration_ms",
  help: "Duration of the latest run in milliseconds",
  labelNames: ["app", "suite"],
  registers: [registry]
});

export function pushPrometheusMetrics(run: TestRun) {
  if (!prometheusEnabled) {
    return;
  }
  runCounter.labels({ app: run.appId, suite: run.suite, status: run.status }).inc();
  durationGauge.labels({ app: run.appId, suite: run.suite }).set(run.durationMs);
  if (typeof run.coverage === "number") {
    coverageGauge.labels({ app: run.appId, suite: run.suite }).set(run.coverage);
  }
}

export async function getPrometheusMetrics() {
  return registry.metrics();
}

registerTelemetrySink({
  id: "prometheus",
  record: (run: TestRun) => {
    pushPrometheusMetrics(run);
  }
});
