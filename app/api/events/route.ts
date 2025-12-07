import { subscribe } from "@/lib/events";
import { listRuns } from "@/lib/dataStore";
import { ensureAuthorized } from "@/lib/auth";

const encoder = new TextEncoder();

export async function GET(request: Request) {
  if (!ensureAuthorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const runs = await listRuns();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(`event: bootstrap\ndata: ${JSON.stringify(runs)}\n\n`));
      const unsubscribe = subscribe((run) => {
        controller.enqueue(encoder.encode(`event: run\ndata: ${JSON.stringify(run)}\n\n`));
      });
      const ping = setInterval(() => {
        controller.enqueue(encoder.encode(`event: ping\ndata: {}\n\n`));
      }, 25000);
      controller.oncancel = () => {
        clearInterval(ping);
        unsubscribe();
      };
    }
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
