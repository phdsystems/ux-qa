"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from "recharts";
import type { TestRun } from "@/lib/types";
import type { DashboardSettings, SavedFilter } from "@/lib/settings";

interface Props {
  initialRuns: TestRun[];
  initialSettings: DashboardSettings;
}

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Passed", value: "passed" },
  { label: "Failed", value: "failed" },
  { label: "Unstable", value: "unstable" }
] as const;

const widgetOptions = [
  { key: "kpis", label: "KPI Cards" },
  { key: "timeline", label: "Timeline" },
  { key: "coverage", label: "Coverage Histogram" },
  { key: "duration", label: "Duration Histogram" }
] as const;

type StatusFilter = typeof statusFilters[number]["value"];

const statusColor: Record<TestRun["status"], string> = {
  passed: "text-emerald-400 border-emerald-500/40",
  failed: "text-rose-400 border-rose-500/40",
  unstable: "text-amber-300 border-amber-400/40"
};

const statusLabel: Record<TestRun["status"], string> = {
  passed: "Passed",
  failed: "Failed",
  unstable: "Unstable"
};

function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const rem = seconds % 60;
  return `${minutes}m ${rem}s`;
}

function groupRuns(runs: TestRun[]) {
  return runs.reduce<Record<string, TestRun[]>>((acc, run) => {
    if (!acc[run.appId]) {
      acc[run.appId] = [];
    }
    acc[run.appId].push(run);
    return acc;
  }, {});
}

function computeStats(runs: TestRun[]) {
  const total = runs.length;
  const passed = runs.filter((r) => r.status === "passed").length;
  const failed = runs.filter((r) => r.status === "failed").length;
  const unstable = runs.filter((r) => r.status === "unstable").length;
  const avgDuration = total ? runs.reduce((sum, run) => sum + run.durationMs, 0) / total : 0;
  const coverageValues = runs.filter((run) => typeof run.coverage === "number").map((run) => run.coverage ?? 0);
  const avgCoverage = coverageValues.length
    ? coverageValues.reduce((sum, value) => sum + value, 0) / coverageValues.length
    : null;
  return {
    total,
    passed,
    failed,
    unstable,
    passRate: total ? Math.round((passed / total) * 100) : 0,
    avgDuration,
    avgCoverage
  };
}

interface SuiteInsight {
  id: string;
  appId: string;
  suite: string;
  total: number;
  failures: number;
  flake: number;
  passRate: number;
  avgDuration: number;
  lastRun: string;
}

function StatusSparkline({ runs }: { runs: TestRun[] }) {
  const bars = runs.slice(0, 12);
  if (bars.length === 0) {
    return <div className="text-slate-500 text-xs">No history</div>;
  }
  return (
    <div className="flex items-end gap-1 h-16">
      {bars.map((run) => {
        const pct = run.total ? run.passed / run.total : 0;
        const height = Math.max(8, Math.round(pct * 64));
        return (
          <div
            key={run.id}
            className={`flex-1 rounded-sm bg-gradient-to-t ${
              run.status === "passed"
                ? "from-emerald-600/20 to-emerald-400/80"
                : run.status === "unstable"
                ? "from-amber-600/20 to-amber-400/80"
                : "from-rose-600/20 to-rose-400/80"
            }`}
            style={{ height }}
            title={`${statusLabel[run.status]} • ${(pct * 100).toFixed(0)}% pass • ${new Date(
              run.createdAt
            ).toLocaleString()}`}
          />
        );
      })}
    </div>
  );
}

export function RunDashboard({ initialRuns, initialSettings }: Props) {
  const [runs, setRuns] = useState<TestRun[]>(initialRuns);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [environmentFilter, setEnvironmentFilter] = useState("");
  const [suiteFilter, setSuiteFilter] = useState("");
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>(initialSettings.hiddenWidgets ?? []);
  const [theme, setTheme] = useState(initialSettings.theme ?? "dark");
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(initialSettings.savedFilters ?? []);

  useEffect(() => {
    const source = new EventSource("/api/events");
    const bootstrapListener = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data) as TestRun[];
        setRuns(parsed);
      } catch {
        // ignore
      }
    };
    const runListener = (event: MessageEvent) => {
      try {
        const run = JSON.parse(event.data) as TestRun;
        setRuns((prev) => {
          if (prev.some((existing) => existing.id === run.id)) {
            return prev;
          }
          return [run, ...prev].slice(0, 500);
        });
      } catch {
        // ignore
      }
    };
    source.addEventListener("bootstrap", bootstrapListener);
    source.addEventListener("run", runListener);
    return () => {
      source.removeEventListener("bootstrap", bootstrapListener as EventListener);
      source.removeEventListener("run", runListener as EventListener);
      source.close();
    };
  }, []);

  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      const matchesStatus =
        statusFilter === "all" ||
        run.status === statusFilter ||
        (statusFilter === "unstable" && run.status === "unstable");
      const matchesEnv = environmentFilter
        ? run.environment.toLowerCase().includes(environmentFilter.toLowerCase())
        : true;
      const matchesSuite = suiteFilter
        ? run.suite.toLowerCase().includes(suiteFilter.toLowerCase())
        : true;
      return matchesStatus && matchesEnv && matchesSuite;
    });
  }, [runs, statusFilter, environmentFilter, suiteFilter]);

  const runsByApp = useMemo(() => groupRuns(filteredRuns), [filteredRuns]);
  const aggregate = useMemo(() => computeStats(filteredRuns), [filteredRuns]);

  const timelineData = useMemo(() => {
    return [...filteredRuns]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-25)
      .map((run) => ({
        timestamp: new Date(run.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        coverage: typeof run.coverage === "number" ? Number(run.coverage.toFixed(2)) : null,
        duration: Number((run.durationMs / 1000 / 60).toFixed(2)),
        passed: run.passed,
        failed: run.failed
      }));
  }, [filteredRuns]);

  const suiteHotspots = useMemo(() => {
    const map = new Map<string, SuiteInsight>();
    filteredRuns.forEach((run) => {
      const key = `${run.appId}::${run.suite}`;
      const entry = map.get(key) ?? {
        id: key,
        appId: run.appId,
        suite: run.suite,
        total: 0,
        failures: 0,
        flake: 0,
        passRate: 0,
        avgDuration: 0,
        lastRun: run.createdAt
      };
      entry.total += 1;
      if (run.status === "failed") {
        entry.failures += 1;
      }
      if (run.status === "unstable") {
        entry.flake += 1;
      }
      entry.avgDuration += run.durationMs;
      if (new Date(run.createdAt).getTime() > new Date(entry.lastRun).getTime()) {
        entry.lastRun = run.createdAt;
      }
      map.set(key, entry);
    });
    const result = Array.from(map.values()).map((entry) => ({
      ...entry,
      avgDuration: entry.total ? entry.avgDuration / entry.total : 0,
      passRate: entry.total ? Math.round(((entry.total - entry.failures - entry.flake) / entry.total) * 100) : 0
    }));
    return result
      .filter((entry) => entry.failures + entry.flake > 0)
      .sort((a, b) => b.failures + b.flake - (a.failures + a.flake))
      .slice(0, 5);
  }, [filteredRuns]);

  if (runs.length === 0) {
    return (
      <div className="text-slate-400 text-sm border border-dashed border-slate-800 rounded-xl p-6">
        No test runs yet. POST data to <code className="text-slate-200">/api/runs</code> to populate the dashboard.
      </div>
    );
  }

  const appIds = Object.keys(runsByApp);

  const toggleWidget = (key: string) => {
    setHiddenWidgets((prev) => {
      const next = prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key];
      fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hiddenWidgets: next })
      }).catch(() => undefined);
      return next;
    });
  };

  const coverageHistogram = useMemo(() => {
    const buckets: Record<string, number> = {
      "0-49": 0,
      "50-69": 0,
      "70-84": 0,
      "85-94": 0,
      "95-100": 0
    };
    filteredRuns.forEach((run) => {
      if (typeof run.coverage !== "number") return;
      const value = run.coverage;
      if (value < 50) buckets["0-49"] += 1;
      else if (value < 70) buckets["50-69"] += 1;
      else if (value < 85) buckets["70-84"] += 1;
      else if (value < 95) buckets["85-94"] += 1;
      else buckets["95-100"] += 1;
    });
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [filteredRuns]);

  const durationHistogram = useMemo(() => {
    const buckets: Record<string, number> = {
      "<1m": 0,
      "1-3m": 0,
      "3-5m": 0,
      "5-10m": 0,
      ">10m": 0
    };
    filteredRuns.forEach((run) => {
      const minutes = run.durationMs / 1000 / 60;
      if (minutes < 1) buckets["<1m"] += 1;
      else if (minutes < 3) buckets["1-3m"] += 1;
      else if (minutes < 5) buckets["3-5m"] += 1;
      else if (minutes < 10) buckets["5-10m"] += 1;
      else buckets[">10m"] += 1;
    });
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [filteredRuns]);

  const updateTheme = (value: string) => {
    setTheme(value);
    fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: value })
    }).catch(() => undefined);
    document.documentElement.dataset.theme = value;
  };

  const applySavedFilter = (filter: SavedFilter) => {
    setStatusFilter(filter.status);
    setEnvironmentFilter(filter.environment ?? "");
    setSuiteFilter(filter.suite ?? "");
  };

  const saveCurrentFilter = () => {
    const name = prompt("Name this filter");
    if (!name) {
      return;
    }
    const newFilter: SavedFilter = {
      id: `${Date.now()}`,
      name,
      status: statusFilter,
      environment: environmentFilter || undefined,
      suite: suiteFilter || undefined
    };
    const next = [newFilter, ...savedFilters].slice(0, 5);
    setSavedFilters(next);
    fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ savedFilters: next })
    }).catch(() => undefined);
  };

  const deleteSavedFilter = (id: string) => {
    const next = savedFilters.filter((filter) => filter.id !== id);
    setSavedFilters(next);
    fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ savedFilters: next })
    }).catch(() => undefined);
  };

  return (
    <div className="space-y-8" data-theme={theme}>
      <section className="bg-slate-900/30 border border-slate-800 rounded-2xl p-4 space-y-3 text-sm text-slate-300">
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-[0.3em]">Help & Integration</p>
          <p>
            POST results to <code className="text-slate-100">/api/runs</code>, subscribe to <code className="text-slate-100">/api/events</code>
            for live updates, or import the `publishRun` helper. Configure storage/telemetry via env vars like
            <code className="text-slate-100">UXQA_STORAGE</code> and <code className="text-slate-100">UXQA_TELEMETRY</code>.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs items-center">
          <Link href="/api/runs" className="px-3 py-1 rounded-full border border-slate-700 text-slate-200 hover:text-white">
            Test the API
          </Link>
          <Link href="/api/events" className="px-3 py-1 rounded-full border border-slate-700 text-slate-200 hover:text-white">
            Stream live events
          </Link>
          <Link
            href="https://github.com/phdsystems/ux.qa"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1 rounded-full border border-slate-700 text-slate-200 hover:text-white"
          >
            Read the docs
          </Link>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Theme</span>
          <select
            value={theme}
            onChange={(event) => updateTheme(event.target.value)}
            className="bg-slate-950/60 border border-slate-800 rounded-lg px-2 py-1 text-slate-100"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="auto">Auto</option>
          </select>
        </div>
      </section>
      <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
          {widgetOptions.map((widget) => (
            <label key={widget.key} className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={!hiddenWidgets.includes(widget.key)}
                onChange={() => toggleWidget(widget.key)}
              />
              {widget.label}
            </label>
          ))}
        </div>
        {!hiddenWidgets.includes("kpis") ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4">
              <p className="text-slate-400 text-xs">Total Runs</p>
              <p className="text-2xl font-semibold">{aggregate.total}</p>
            </div>
          <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4">
            <p className="text-slate-400 text-xs">Pass Rate</p>
            <p className="text-2xl font-semibold text-emerald-400">{aggregate.passRate}%</p>
          </div>
          <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4">
            <p className="text-slate-400 text-xs">Avg Duration</p>
            <p className="text-xl font-semibold">{formatDuration(Math.round(aggregate.avgDuration))}</p>
          </div>
          <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4">
            <p className="text-slate-400 text-xs">Avg Coverage</p>
            <p className="text-xl font-semibold">
              {typeof aggregate.avgCoverage === "number" ? `${aggregate.avgCoverage.toFixed(1)}%` : "n/a"}
            </p>
          </div>
          </div>
        ) : null}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {!hiddenWidgets.includes("timeline") ? (
            <div>
              <p className="text-slate-400 text-xs mb-2">Run Timeline</p>
              <div className="h-64 bg-slate-950/50 border border-slate-900 rounded-xl p-2">
              {timelineData.length === 0 ? (
                <div className="text-slate-500 text-sm flex items-center justify-center h-full">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="timestamp" stroke="#475569" />
                    <YAxis yAxisId="left" stroke="#475569" />
                    <YAxis yAxisId="right" orientation="right" stroke="#475569" />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
                    <Legend />
                    <Line type="monotone" dataKey="coverage" name="Coverage %" stroke="#34d399" yAxisId="left" dot={false} />
                    <Line type="monotone" dataKey="duration" name="Duration (min)" stroke="#60a5fa" yAxisId="right" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
              </div>
            </div>
          ) : null}
          {!hiddenWidgets.includes("coverage") ? (
            <div>
              <p className="text-slate-400 text-xs mb-2">Coverage Distribution</p>
              <div className="h-64 bg-slate-950/50 border border-slate-900 rounded-xl p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coverageHistogram}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="range" stroke="#475569" />
                  <YAxis allowDecimals={false} stroke="#475569" />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
                  <Bar dataKey="count" fill="#38bdf8" name="Runs" />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </div>
          ) : null}
          {!hiddenWidgets.includes("duration") ? (
            <div>
              <p className="text-slate-400 text-xs mb-2">Duration Distribution</p>
              <div className="h-64 bg-slate-950/50 border border-slate-900 rounded-xl p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={durationHistogram}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="range" stroke="#475569" />
                  <YAxis allowDecimals={false} stroke="#475569" />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
                  <Bar dataKey="count" fill="#f472b6" name="Runs" />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </div>
          ) : null}
          </div>
      </section>
      {suiteHotspots.length > 0 ? (
        <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Failure Hotspots</p>
              <p className="text-sm text-slate-400">Top suites by failed + flaky runs</p>
            </div>
          </header>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-slate-400 text-xs uppercase border-b border-slate-800">
                <th className="py-2">Application</th>
                <th>Suite</th>
                <th>Failures</th>
                <th>Flaky</th>
                <th>Pass Rate</th>
                <th>Avg Duration</th>
                <th>Last Run</th>
              </tr>
            </thead>
            <tbody>
              {suiteHotspots.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-900/60">
                  <td className="py-2">{entry.appId}</td>
                  <td>{entry.suite}</td>
                  <td className="text-rose-300 font-semibold">{entry.failures}</td>
                  <td className="text-amber-300 font-semibold">{entry.flake}</td>
                  <td>{entry.passRate}%</td>
                  <td>{formatDuration(Math.round(entry.avgDuration))}</td>
                  <td className="text-slate-400">{new Date(entry.lastRun).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-slate-900/40 border border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={`text-xs uppercase tracking-wide px-3 py-1 rounded-full border transition-colors ${
                statusFilter === filter.value
                  ? "bg-slate-100 text-slate-900 border-slate-100"
                  : "border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="flex flex-1 gap-2 min-w-[260px]">
          <input
            type="search"
            placeholder="Filter by environment"
            value={environmentFilter}
            onChange={(event) => setEnvironmentFilter(event.target.value)}
            className="flex-1 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500"
          />
          <input
            type="search"
            placeholder="Filter by suite"
            value={suiteFilter}
            onChange={(event) => setSuiteFilter(event.target.value)}
            className="flex-1 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500"
          />
        </div>
        <button
          type="button"
          onClick={saveCurrentFilter}
          className="text-xs px-3 py-1 rounded-full border border-slate-600 text-slate-200"
        >
          Save Filter
        </button>
      </div>
      {savedFilters.length > 0 ? (
        <section className="bg-slate-900/30 border border-slate-800 rounded-2xl p-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-slate-400">Saved Filters</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map((filter) => (
              <div key={filter.id} className="px-3 py-1 rounded-full border border-slate-700 text-xs flex items-center gap-2">
                <button type="button" onClick={() => applySavedFilter(filter)}>
                  {filter.name}
                </button>
                <button
                  type="button"
                  onClick={() => deleteSavedFilter(filter.id)}
                  className="text-slate-500 hover:text-rose-400"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {appIds.length === 0 ? (
        <div className="text-slate-400 text-sm border border-dashed border-slate-800 rounded-xl p-6">
          No runs match the selected filters.
        </div>
      ) : null}
      {appIds.map((appId) => {
        const runsForApp = runsByApp[appId];
        const latest = runsForApp[0];
        return (
          <section key={appId} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-4">
            <header className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">Application</p>
                <h2 className="text-xl font-semibold">
                  <Link href={`/apps/${encodeURIComponent(appId)}`} className="hover:text-sky-300">
                    {appId}
                  </Link>
                </h2>
              </div>
              <div className={`px-3 py-1 text-xs rounded-full border ${statusColor[latest.status]}`}>
                Latest run {statusLabel[latest.status]}
              </div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr] gap-4 text-sm">
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4">
                <p className="text-slate-400 text-xs">Suite</p>
                <p className="text-lg font-semibold">{latest.suite}</p>
              </div>
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4">
                <p className="text-slate-400 text-xs">Duration</p>
                <p className="text-lg font-semibold">{formatDuration(latest.durationMs)}</p>
              </div>
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4">
                <p className="text-slate-400 text-xs">Coverage</p>
                <p className="text-lg font-semibold">
                  {typeof latest.coverage === "number" ? `${latest.coverage.toFixed(1)}%` : "n/a"}
                </p>
              </div>
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4">
                <p className="text-slate-400 text-xs mb-2">Recent trend</p>
                <StatusSparkline runs={runsForApp} />
              </div>
            </div>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-slate-400 text-xs uppercase border-b border-slate-800">
                  <th className="py-2">Started</th>
                  <th>Suite</th>
                  <th>Env</th>
                  <th>Totals</th>
                  <th>Duration</th>
                  <th>Coverage</th>
                  <th>Commit</th>
                  <th>Artifact</th>
                </tr>
              </thead>
              <tbody>
                {runsForApp.slice(0, 10).map((run) => (
                  <tr key={run.id} className="border-b border-slate-900/60">
                    <td className="py-2 text-slate-400">{new Date(run.createdAt).toLocaleString()}</td>
                    <td>{run.suite}</td>
                    <td>{run.environment}</td>
                    <td>
                      <span className="text-emerald-400 font-semibold">{run.passed}</span>
                      <span className="text-slate-500">/{run.total}</span>
                    </td>
                    <td>{formatDuration(run.durationMs)}</td>
                    <td>{typeof run.coverage === "number" ? `${run.coverage.toFixed(1)}%` : "—"}</td>
                    <td className="font-mono text-xs text-slate-400">{run.commit?.slice(0, 8) ?? "—"}</td>
                    <td>
                      {run.artifactUrl ? (
                        <a
                          href={run.artifactUrl}
                          className="text-sky-400 hover:text-sky-300 text-xs"
                          target="_blank"
                          rel="noreferrer"
                        >
                          report
                        </a>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );
}
