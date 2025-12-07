import type { TestRun } from "@/lib/types";
import { emitTelemetry } from "@/lib/spi/telemetry";
import "@/lib/telemetry/prometheus";
import "@/lib/telemetry/influx";
import "@/lib/telemetry/datadog";

export function recordRunMetrics(run: TestRun) {
  void emitTelemetry(run);
}

export { getPrometheusMetrics } from "@/lib/telemetry/prometheus";
