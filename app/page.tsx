import { RunDashboard } from "@/components/dashboard/RunDashboard";
import { listRuns } from "@/lib/dataStore";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function Page() {
  const runs = await listRuns();
  const settings = await getSettings();
  if (settings.theme) {
    // pass theme to the client via dataset attribute
  }
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Playwright Hub</p>
        <h1 className="text-3xl font-semibold">E2E Automation Dashboard</h1>
        <p className="text-slate-400 text-sm mt-2">
          Push test runs via the API to populate this view and stream metrics to Prometheus/InfluxDB.
        </p>
      </div>
      <RunDashboard initialRuns={runs} initialSettings={settings} />
    </div>
  );
}
