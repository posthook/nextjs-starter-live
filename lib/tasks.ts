import { randomUUID } from "node:crypto";
import type { Duration } from "@posthook/node";
import { posthook } from "./posthook";
import { generateDraft } from "./ai";
import { getTask, getTaskById, saveTask, updateTask, recordEvent } from "./store";
import { requireSessionId } from "./demo/session";
import type { Task, RemindPayload, ExpirePayload } from "./types";

const REMINDER_DELAY = (process.env.REMINDER_DELAY || "1h") as Duration;
const EXPIRATION_DELAY = (process.env.EXPIRATION_DELAY || "24h") as Duration;

export async function createTask(
  prompt: string,
  contentType: string
): Promise<Task> {
  const id = randomUUID();
  const sessionId = await requireSessionId();

  // 1. Generate draft
  const draft = await generateDraft(prompt, contentType);

  // 2. Schedule hooks first — carry sessionId in payloads
  const [reminderHook, expirationHook] = await Promise.all([
    posthook().hooks.schedule<RemindPayload>({
      path: "/api/webhooks/remind",
      postIn: REMINDER_DELAY,
      data: { taskId: id, reminderEpoch: 0, sessionId },
    }),
    posthook().hooks.schedule<ExpirePayload>({
      path: "/api/webhooks/expire",
      postIn: EXPIRATION_DELAY,
      data: { taskId: id, sessionId },
    }),
  ]);

  // 3. Commit state
  const task: Task = {
    id,
    sessionId,
    status: "pending_review",
    contentType,
    prompt,
    draft,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    remindedAt: null,
    resolvedAt: null,
    snoozeUntil: null,
    reminderEpoch: 0,
    reminderAt: reminderHook.postAt,
    expirationAt: expirationHook.postAt,
  };

  await Promise.all([
    saveTask(task),
    recordEvent(sessionId, id, "task_created", { kind: "task_created", contentType, prompt }),
    recordEvent(sessionId, id, "hooks_scheduled", {
      kind: "hooks_scheduled",
      hooks: [
        { endpoint: "/api/webhooks/remind", firesAt: reminderHook.postAt },
        { endpoint: "/api/webhooks/expire", firesAt: expirationHook.postAt },
      ],
    }),
  ]);

  return task;
}

export async function approveTask(id: string): Promise<Task | null> {
  const result =
    (await updateTask(id, { status: "approved", resolvedAt: new Date().toISOString() }, ["pending_review", "reminded"])) ??
    (await getTask(id));

  if (result?.status === "approved") {
    await recordEvent(result.sessionId, id, "task_approved", { kind: "action", action: "Approved", note: "Pending hooks will no-op on delivery (state verification)" });
  }
  return result;
}

export async function rejectTask(id: string): Promise<Task | null> {
  const result =
    (await updateTask(id, { status: "rejected", resolvedAt: new Date().toISOString() }, ["pending_review", "reminded"])) ??
    (await getTask(id));

  if (result?.status === "rejected") {
    await recordEvent(result.sessionId, id, "task_rejected", { kind: "action", action: "Rejected", note: "Pending hooks will no-op on delivery (state verification)" });
  }
  return result;
}

export async function snoozeTask(
  id: string,
  delay: Duration = "1h"
): Promise<Task | null> {
  const task = await getTask(id);
  if (!task || task.status === "approved" || task.status === "rejected" || task.status === "expired") {
    return task;
  }

  const nextEpoch = task.reminderEpoch + 1;

  const newReminderHook = await posthook().hooks.schedule<RemindPayload>({
    path: "/api/webhooks/remind",
    postIn: delay,
    data: { taskId: id, reminderEpoch: nextEpoch, sessionId: task.sessionId },
  });

  const snoozeUntil = new Date(Date.now() + parseDuration(delay)).toISOString();
  const result =
    (await updateTask(id, { status: "pending_review", snoozeUntil, reminderEpoch: nextEpoch, remindedAt: null, reminderAt: newReminderHook.postAt }, ["pending_review", "reminded"])) ??
    (await getTask(id));

  if (result?.reminderEpoch === nextEpoch) {
    await recordEvent(
      task.sessionId,
      id,
      "task_snoozed",
      { kind: "snooze", endpoint: "/api/webhooks/remind", firesAt: newReminderHook.postAt, oldEpoch: nextEpoch - 1, newEpoch: nextEpoch }
    );
  }
  return result;
}

export async function handleReminder(taskId: string, reminderEpoch: number): Promise<void> {
  const task = await getTaskById(taskId);
  if (!task || task.status !== "pending_review") return;
  if (reminderEpoch !== task.reminderEpoch) return;

  const updated = await updateTask(taskId, { status: "reminded", remindedAt: new Date().toISOString() }, ["pending_review"]);
  if (!updated) return;

  await recordEvent(task.sessionId, taskId, "reminder_delivered", {
    kind: "webhook_delivered",
    endpoint: "/api/webhooks/remind",
    status: 200,
    checks: [
      { label: "Signature", value: "verified", pass: true },
      { label: "State", value: "pending_review", pass: true },
      { label: "Epoch", value: `${reminderEpoch} = ${task.reminderEpoch}`, pass: true },
    ],
    result: "Updated to reminded",
  });
}

export async function handleExpiration(taskId: string): Promise<void> {
  const updated = await updateTask(taskId, { status: "expired", resolvedAt: new Date().toISOString() }, ["pending_review", "reminded"]);

  if (!updated) return;

  await recordEvent(updated.sessionId, taskId, "expiration_delivered", {
    kind: "webhook_delivered",
    endpoint: "/api/webhooks/expire",
    status: 200,
    checks: [
      { label: "Signature", value: "verified", pass: true },
      { label: "State", value: "pending or reminded", pass: true },
    ],
    result: "Updated to expired",
  });
}

function parseDuration(delay: string): number {
  const match = delay.match(/^(\d+)(s|m|h|d)$/);
  if (!match) throw new Error(`Invalid duration: ${delay}`);
  const [, value, unit] = match;
  const multipliers: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return Number(value) * multipliers[unit];
}
