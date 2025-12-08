import type { TestRun } from "@/lib/types";
import { alertCoverageThreshold, alertWebhookUrl } from "@/lib/config";

const shouldAlertOnStatus = (status: TestRun["status"]) => status === "failed" || status === "unstable";

function shouldAlertOnCoverage(run: TestRun) {
  if (!alertCoverageThreshold || typeof run.coverage !== "number") {
    return false;
  }
  return run.coverage < alertCoverageThreshold;
}

export async function notifyAlerts(run: TestRun) {
  if (!alertWebhookUrl) {
    return;
  }
  const alertTriggered = shouldAlertOnStatus(run.status) || shouldAlertOnCoverage(run);
  if (!alertTriggered) {
    return;
  }
  const payload = {
    text: `Playwright alert for ${run.appId} (${run.suite})`,
    details: {
      status: run.status,
      coverage: run.coverage,
      totals: `${run.passed}/${run.total}`,
      environment: run.environment,
      commit: run.commit,
      durationMs: run.durationMs,
      createdAt: run.createdAt,
      artifactUrl: run.artifactUrl
    }
  };
  try {
    await fetch(alertWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error("Failed to send alert webhook", error);
  }
}
