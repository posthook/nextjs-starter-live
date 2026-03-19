import { posthook } from "@/lib/posthook";
import { handleExpiration } from "@/lib/tasks";
import { SignatureVerificationError } from "@posthook/node";
import type { ExpirePayload } from "@/lib/types";

// POSTHOOK: Expiration webhook handler
// Posthook delivers here when a task's expiration deadline passes. The handler
// verifies the signature, then conditionally expires the task.

export const runtime = "nodejs"; // SDK uses node:crypto

export async function POST(request: Request) {
  try {
    // POSTHOOK: Verify signature and parse delivery
    const body = await request.text();
    const delivery = posthook().signatures.parseDelivery<ExpirePayload>(
      body,
      request.headers
    );

    // POSTHOOK: State verification — only expire if task is still pending/reminded
    await handleExpiration(delivery.data.taskId);

    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof SignatureVerificationError) {
      return Response.json({ error: err.message }, { status: 401 });
    }
    console.error("[posthook/expire] Error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
