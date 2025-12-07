"use client";

import { useMemo, useState } from "react";
import type { TestRun } from "@/lib/types";

interface Props {
  runs: TestRun[];
}

export function ArtifactViewer({ runs }: Props) {
  const artifacts = useMemo(() => runs.filter((run) => run.artifactUrl), [runs]);
  const [selectedId, setSelectedId] = useState<string | null>(artifacts[0]?.id ?? null);

  if (artifacts.length === 0) {
    return (
      <div className="text-sm text-slate-400 border border-dashed border-slate-700 rounded-xl p-4">
        No artifacts available for this app.
      </div>
    );
  }

  const selected = artifacts.find((run) => run.id === selectedId) ?? artifacts[0];

  return (
    <div className="bg-slate-950/40 border border-slate-900 rounded-2xl">
      <div className="grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b md:border-b-0 md:border-r border-slate-900">
          <div className="max-h-72 overflow-auto">
            {artifacts.map((run) => (
              <button
                key={run.id}
                type="button"
                onClick={() => setSelectedId(run.id)}
                className={`w-full text-left px-4 py-3 text-sm border-b border-slate-900 hover:bg-slate-900/60 ${
                  run.id === selectedId ? "bg-slate-900/70" : ""
                }`}
              >
                <p className="text-xs text-slate-400">{new Date(run.createdAt).toLocaleString()}</p>
                <p className="font-semibold">{run.suite}</p>
                <p className="text-xs text-slate-500">{run.environment}</p>
              </button>
            ))}
          </div>
        </aside>
        <div className="p-4 space-y-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">Preview</p>
            <h3 className="text-lg font-semibold">
              {selected.suite} – {selected.environment}
            </h3>
            <p className="text-xs text-slate-500">Commit {selected.commit ?? "—"}</p>
          </div>
          <div className="flex gap-3 text-sm">
            <a
              href={selected.artifactUrl ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 text-xs font-semibold"
            >
              Open Artifact
            </a>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-200"
              onClick={() => navigator.clipboard.writeText(selected.artifactUrl ?? "")}
            >
              Copy URL
            </button>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm text-slate-300">
            <p>
              Inline preview placeholder. Embed screenshots/videos here (e.g., use
              &lt;video&gt; or &lt;img&gt; when artifact URLs point to accessible media files).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
