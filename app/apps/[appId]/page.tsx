import Link from "next/link";
import { notFound } from "next/navigation";
import { listRuns } from "@/lib/dataStore";
import type { TestRun } from "@/lib/types";
import { ArtifactViewer } from "@/components/apps/ArtifactViewer";
import { generateTestSuggestions } from "@/lib/testCaseGenerator";

function groupBySuite(runs: TestRun[]) {
  return runs.reduce<Record<string, TestRun[]>>((acc, run) => {
    if (!acc[run.suite]) {
      acc[run.suite] = [];
    }
    acc[run.suite].push(run);
    return acc;
  }, {});
}

function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const rem = seconds % 60;
  return `${minutes}m ${rem}s`;
}

export default async function AppDetailPage({ params }: { params: { appId: string } }) {
  const runs = await listRuns();
  const filtered = runs.filter((run) => run.appId === params.appId);
  if (filtered.length === 0) {
    notFound();
  }
  const suites = groupBySuite(filtered);
  const latest = filtered[0];
  const defaultSuite = latest?.suite ?? Object.keys(suites)[0];
  const testIdeas = defaultSuite ? generateTestSuggestions(params.appId, defaultSuite, runs) : [];
  return (
    <div className="space-y-6">
      <Link href="/" className="text-xs uppercase tracking-[0.3em] text-slate-500 hover:text-slate-300">
        ← Back to dashboard
      </Link>
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">Application</p>
            <h1 className="text-3xl font-semibold">{params.appId}</h1>
          </div>
          <div className="text-sm text-slate-400">
            Latest run {new Date(latest.createdAt).toLocaleString()} • {latest.environment}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4">
            <p className="text-slate-400 text-xs">Total Runs</p>
            <p className="text-2xl font-semibold">{filtered.length}</p>
          </div>
          <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4">
            <p className="text-slate-400 text-xs">Unique Suites</p>
            <p className="text-2xl font-semibold">{Object.keys(suites).length}</p>
          </div>
          <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4">
            <p className="text-slate-400 text-xs">Last Status</p>
            <p className="text-xl font-semibold text-emerald-400">{latest.status.toUpperCase()}</p>
          </div>
          <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4">
            <p className="text-slate-400 text-xs">Artifacts</p>
            <p className="text-xl font-semibold">{filtered.filter((run) => run.artifactUrl).length}</p>
          </div>
        </div>
      </div>
      <ArtifactViewer runs={filtered} />
      {defaultSuite ? (
        <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Generated Test Cases</p>
              <p className="text-sm text-slate-400">Suggestions for suite {defaultSuite}</p>
            </div>
          </header>
          <ul className="list-disc list-inside text-sm text-slate-300">
            {testIdeas.map((idea) => (
              <li key={idea}>{idea}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {Object.entries(suites).map(([suite, suiteRuns]) => (
        <section key={suite} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
          <header className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-semibold">{suite}</h2>
            <span className="text-xs text-slate-400">
              {suiteRuns.length} run{suiteRuns.length === 1 ? "" : "s"}
            </span>
          </header>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-slate-400 text-xs uppercase border-b border-slate-800">
                <th className="py-2">Started</th>
                <th>Status</th>
                <th>Env</th>
                <th>Totals</th>
                <th>Duration</th>
                <th>Coverage</th>
                <th>Commit</th>
                <th>Artifact</th>
              </tr>
            </thead>
            <tbody>
              {suiteRuns.slice(0, 20).map((run) => (
                <tr key={run.id} className="border-b border-slate-900/60">
                  <td className="py-2 text-slate-400">{new Date(run.createdAt).toLocaleString()}</td>
                  <td>{run.status}</td>
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
      ))}
    </div>
  );
}
