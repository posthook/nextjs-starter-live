import { posthook } from "@/lib/posthook";
import { handleReminder } from "@/lib/tasks";
import { SignatureVerificationError } from "@posthook/node";
import type { RemindPayload } from "@/lib/types";

// POSTHOOK: Reminder webhook handler
// Posthook delivers here when a reminder is due. The handler verifies the
// signature, then checks task state + epoch before acting.

export const runtime = "nodejs"; // SDK uses node:crypto

export async function POST(request: Request) {
  try {
    // POSTHOOK: Verify signature and parse delivery
    const body = await request.text();
    const delivery = posthook().signatures.parseDelivery<RemindPayload>(
      body,
      request.headers
    );

    // POSTHOOK: State + epoch verification — only remind if task is still pending and epoch matches
    await handleReminder(delivery.data.taskId, delivery.data.reminderEpoch);

    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof SignatureVerificationError) {
      return Response.json({ error: err.message }, { status: 401 });
    }
    console.error("[posthook/remind] Error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
