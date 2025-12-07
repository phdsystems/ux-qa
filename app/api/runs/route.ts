import { NextResponse } from "next/server";
import { addRun, listRuns } from "@/lib/dataStore";
import type { CreateRunPayload } from "@/lib/types";
import { ensureAuthorized } from "@/lib/auth";
import { apiKey } from "@/lib/config";

const requiredKeys: Array<keyof CreateRunPayload> = [
  "appId",
  "suite",
  "environment",
  "status",
  "total",
  "passed",
  "failed",
  "durationMs"
];

function validatePayload(body: unknown): body is CreateRunPayload {
  if (!body || typeof body !== "object") {
    return false;
  }
  for (const key of requiredKeys) {
    if (!(key in body)) {
      return false;
    }
  }
  const cast = body as Record<string, unknown>;
  if (!["passed", "failed", "unstable"].includes(String(cast.status))) {
    return false;
  }
  return true;
}

export async function GET(request: Request) {
  if (!ensureAuthorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const runs = await listRuns();
  return NextResponse.json({ runs }, {
    headers: apiKey ? { "x-playwright-hub-key-required": "true" } : undefined
  });
}

export async function POST(request: Request) {
  if (!ensureAuthorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const data = await request.json().catch(() => null);
  if (!validatePayload(data)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const run = await addRun(data);
  return NextResponse.json(run, { status: 201 });
}
