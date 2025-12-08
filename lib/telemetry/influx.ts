import { InfluxDB, Point, WriteApi } from "@influxdata/influxdb-client";
import type { TestRun } from "@/lib/types";
import { influxConfig, influxEnabled } from "@/lib/config";
import { registerTelemetrySink } from "@/lib/spi/telemetry";

let writeApi: WriteApi | null = null;

function getWriteApi() {
  if (!influxEnabled || !influxConfig.url || !influxConfig.token || !influxConfig.org || !influxConfig.bucket) {
    return null;
  }
  if (!writeApi) {
    writeApi = new InfluxDB({ url: influxConfig.url, token: influxConfig.token }).getWriteApi(
      influxConfig.org,
      influxConfig.bucket,
      "ns"
    );
  }
  return writeApi;
}

export async function pushInfluxMetrics(run: TestRun) {
  const api = getWriteApi();
  if (!api) {
    return;
  }
  const point = new Point("playwright_run")
    .tag("app", run.appId)
    .tag("suite", run.suite)
    .tag("status", run.status)
    .intField("duration_ms", run.durationMs)
    .intField("total", run.total)
    .intField("passed", run.passed)
    .intField("failed", run.failed);
  if (typeof run.coverage === "number") {
    point.floatField("coverage", run.coverage);
  }
  api.writePoint(point);
  await api.flush();
}

registerTelemetrySink({
  id: "influx",
  record: (run: TestRun) => pushInfluxMetrics(run)
});
