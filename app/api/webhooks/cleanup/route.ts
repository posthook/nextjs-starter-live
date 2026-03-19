import { posthook } from "@/lib/posthook";
import { deleteSession } from "@/lib/store";
import { SignatureVerificationError } from "@posthook/node";
import type { CleanupPayload } from "@/lib/types";

// POSTHOOK: Session cleanup webhook handler
// Scheduled at session creation (T+30min). Deletes all tasks and events
// for the session. Uses the same signature verification as other handlers.

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const delivery = posthook().signatures.parseDelivery<CleanupPayload>(
      body,
      request.headers
    );

    await deleteSession(delivery.data.sessionId);
    console.log(`[cleanup] Session ${delivery.data.sessionId} cleaned up`);

    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof SignatureVerificationError) {
      return Response.json({ error: err.message }, { status: 401 });
    }
    console.error("[cleanup] Error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
