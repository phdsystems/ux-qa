import { NextResponse } from "next/server";
import { listRuns } from "@/lib/dataStore";
import { generateTestSuggestions } from "@/lib/testCaseGenerator";
import { ensureAuthorized } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: { appId: string } }) {
  const auth = ensureAuthorized(request);
  if (!auth.ok) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const runs = await listRuns();
  const suite = new URL(request.url).searchParams.get("suite") ?? runs.find((run) => run.appId === params.appId)?.suite ?? "unknown";
  const suggestions = generateTestSuggestions(params.appId, suite, runs);
  return NextResponse.json({ appId: params.appId, suite, suggestions });
}
