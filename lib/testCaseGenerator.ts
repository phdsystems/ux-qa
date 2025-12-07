import { testCasePrompt } from "@/lib/config";
import type { TestRun } from "@/lib/types";

export function generateTestSuggestions(appId: string, suite: string, runs: TestRun[]) {
  const recentFailures = runs
    .filter((run) => run.appId === appId && run.suite === suite && run.status !== "passed")
    .slice(0, 5);
  const recentCoverage = runs
    .filter((run) => run.appId === appId && run.suite === suite && typeof run.coverage === "number")
    .map((run) => run.coverage ?? 0)
    .slice(0, 5);
  const avgCoverage = recentCoverage.length
    ? recentCoverage.reduce((sum, value) => sum + value, 0) / recentCoverage.length
    : null;

  const prompt = testCasePrompt
    .replace("{{appId}}", appId)
    .replace("{{suite}}", suite)
    .concat(
      ` RecentFailures=${recentFailures.length}`,
      avgCoverage ? ` AvgCoverage=${avgCoverage.toFixed(1)}%` : ""
    );

  const suggestions = [
    `Focus on regression paths for ${suite}. Prompt: ${prompt}`,
    recentFailures.length
      ? `Investigate recent ${recentFailures.length} unstable/failing runs to derive new test scenarios.`
      : `No recent failures; consider exploratory tests around new features.`
  ];

  return suggestions;
}
