import { datadogApiKey, datadogSite } from "@/lib/config";
import type { TestRun } from "@/lib/types";
import { registerTelemetrySink } from "@/lib/spi/telemetry";

export async function pushDatadogMetrics(run: TestRun) {
  if (!datadogApiKey) {
    return;
  }
  const series = [
    {
      metric: "playwright.run.duration",
      type: 0,
      points: [[Date.now() / 1000, run.durationMs]],
      tags: [`app:${run.appId}`, `suite:${run.suite}`, `status:${run.status}`]
    }
  ];
  await fetch(`https://api.${datadogSite}/api/v1/series`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "DD-API-KEY": datadogApiKey
    },
    body: JSON.stringify({ series })
  }).catch((error) => console.warn("Datadog push failed", error));
}

registerTelemetrySink({
  id: "datadog",
  record: (run: TestRun) => pushDatadogMetrics(run)
});
