import type { CreateRunPayload, TestRun } from "@/lib/types";

export async function publishRun(apiUrl: string, payload: CreateRunPayload): Promise<TestRun> {
  const response = await fetch(new URL("/api/runs", apiUrl), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`Failed to publish run (${response.status})`);
  }
  return response.json();
}
