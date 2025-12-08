import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/settings";
import { ensureAuthorized, hasRole } from "@/lib/auth";
const AUTH_OK = "ok";

export async function GET(request: Request) {
  const auth = ensureAuthorized(request);
  if (auth.status !== AUTH_OK) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  const auth = ensureAuthorized(request);
  if (auth.status !== AUTH_OK) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!hasRole(auth.role, ["admin", "editor"])) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const updated = await updateSettings(body);
  return NextResponse.json(updated);
}
