import fs from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { marked } from "marked";
import { ensureAuthorized, hasRole } from "@/lib/auth";
const AUTH_OK = "ok";

async function getDoc(slug: string) {
  const filePath = path.join(process.cwd(), "content", "help", `${slug}.md`);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return raw;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function allowed(slug: string, role: string | null | undefined) {
  const indexPath = path.join(process.cwd(), "content", "help", "index.json");
  const entries = JSON.parse(await fs.readFile(indexPath, "utf-8")) as Array<{ slug: string; roles?: string[] }>;
  const entry = entries.find((item) => item.slug === slug);
  if (!entry) {
    return false;
  }
  return hasRole(role, entry.roles ?? []);
}

export default async function HelpPage({ params }: { params: { slug: string } }) {
  const auth = ensureAuthorized(headers());
  if (auth.status !== AUTH_OK || !(await allowed(params.slug, auth.role))) {
    notFound();
  }
  const doc = await getDoc(params.slug);
  if (!doc) {
    notFound();
  }
  const html = marked.parse(doc);
  return (
    <div className="space-y-4">
      <Link href="/help" className="text-xs uppercase tracking-[0.3em] text-slate-500 hover:text-slate-300">
        ← Back to Help Center
      </Link>
      <article className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 prose prose-invert" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
