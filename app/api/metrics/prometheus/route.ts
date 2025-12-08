import { NextResponse } from "next/server";
import { getPrometheusMetrics } from "@/lib/telemetry";
import { prometheusEnabled } from "@/lib/config";
import { ensureAuthorized } from "@/lib/auth";

export async function GET(request: Request) {
  if (!ensureAuthorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!prometheusEnabled) {
    return NextResponse.json({ error: "Prometheus exporter disabled" }, { status: 404 });
  }
  const body = await getPrometheusMetrics();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain"
    }
  });
}
