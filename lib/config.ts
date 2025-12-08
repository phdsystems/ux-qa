import path from "node:path";

type TelemetryDriver = "prometheus" | "influx" | "both" | "none";

const telemetryEnv = (process.env.UXQA_TELEMETRY ?? "prometheus").toLowerCase();
const resolvedTelemetry: TelemetryDriver = ["prometheus", "influx", "both", "none"].includes(
  telemetryEnv as TelemetryDriver
)
  ? (telemetryEnv as TelemetryDriver)
  : "prometheus";

export const telemetryDriver = resolvedTelemetry;

const prometheusOverride = process.env.PROMETHEUS_ENABLED;
export const prometheusEnabled =
  typeof prometheusOverride === "string"
    ? prometheusOverride === "true"
    : telemetryDriver === "prometheus" || telemetryDriver === "both";

export const influxConfig = {
  url: process.env.INFLUX_URL,
  token: process.env.INFLUX_TOKEN,
  org: process.env.INFLUX_ORG,
  bucket: process.env.INFLUX_BUCKET
};

const influxHasConfig = Boolean(
  influxConfig.url && influxConfig.token && influxConfig.org && influxConfig.bucket
);

export const influxEnabled =
  (telemetryDriver === "influx" || telemetryDriver === "both") && influxHasConfig;

export const storageDriver = process.env.UXQA_STORAGE ?? "memory";
export const maxRuns = Number(process.env.UXQA_MAX_RUNS ?? "200");
const defaultDataFile = path.join(process.cwd(), "uiqa-data", "runs.json");
export const dataFilePath = process.env.UXQA_DATA_FILE ?? defaultDataFile;

export const alertWebhookUrl = process.env.ALERT_WEBHOOK_URL;
export const alertCoverageThreshold = Number(process.env.ALERT_COVERAGE_THRESHOLD ?? "0");

export const apiKey = process.env.UXQA_API_KEY;

const defaultSettingsFile = path.join(process.cwd(), "uiqa-data", "settings.json");
export const settingsFilePath = process.env.UXQA_SETTINGS_FILE ?? defaultSettingsFile;

export const rbacMap = process.env.UXQA_RBAC
  ? process.env.UXQA_RBAC.split(",").reduce<Record<string, string[]>>((acc, entry) => {
      const [key, roles] = entry.split(":");
      if (!key || !roles) {
        return acc;
      }
      acc[key.trim()] = roles.split("|").map((role) => role.trim());
      return acc;
    }, {})
  : null;

export const testCasePrompt =
  process.env.UXQA_TESTCASE_PROMPT ?? "Generate Playwright test ideas for {{appId}} and suite {{suite}}.";

export const datadogApiKey = process.env.DATADOG_API_KEY;
export const datadogSite = process.env.DATADOG_SITE ?? "datadoghq.com";
