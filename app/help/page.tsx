import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { headers } from "next/headers";
import { ensureAuthorized, hasRole } from "@/lib/auth";
const AUTH_OK = "ok";

async function getArticles(role: string | null | undefined) {
  const indexPath = path.join(process.cwd(), "playwright-hub", "content", "help", "index.json");
  const raw = await fs.readFile(indexPath, "utf-8");
  const entries = JSON.parse(raw) as Array<{ slug: string; title: string; roles?: string[] }>;
  return entries.filter((entry) => hasRole(role, entry.roles ?? []));
}

export default async function HelpCenterPage() {
  const auth = ensureAuthorized(headers());
  if (auth.status !== AUTH_OK) {
    return <div className="text-slate-400">Unauthorized.</div>;
  }
  const articles = await getArticles(auth.role);
  return (
    <div className="space-y-4">
      <header className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Help Center</p>
        <h1 className="text-3xl font-semibold">Playwright Hub Knowledge Base</h1>
        <p className="text-sm text-slate-400">Browse articles, templates, and integration guides.</p>
      </header>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/help/${article.slug}`}
            className="bg-slate-900/30 border border-slate-800 rounded-2xl p-4 hover:border-slate-600"
          >
            <h2 className="text-lg font-semibold">{article.title}</h2>
            <p className="text-xs text-slate-400">Read article →</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
