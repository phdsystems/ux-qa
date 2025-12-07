import { NextResponse } from "next/server";
import { ensureAuthorized } from "@/lib/auth";
import { listRuns } from "@/lib/dataStore";

export async function POST(request: Request) {
  const auth = ensureAuthorized(request);
  if (auth.status !== "ok") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body.query !== "string") {
    return NextResponse.json({ errors: ["Invalid GraphQL query"] }, { status: 400 });
  }
  const runs = await listRuns();
  if (body.query.includes("runs")) {
    return NextResponse.json({ data: { runs } });
  }
  return NextResponse.json({ errors: ["Not implemented"] }, { status: 400 });
}
