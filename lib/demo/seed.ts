import { randomUUID } from "node:crypto";
import type { Duration } from "@posthook/node";
import { posthook } from "@/lib/posthook";
import { saveTask, recordEvent } from "@/lib/store";
import type { Task, RemindPayload, ExpirePayload, CleanupPayload } from "@/lib/types";

// Short timers so visitors see hooks fire quickly
const SEED_REMINDER_DELAY = (process.env.SEED_REMINDER_DELAY || "45s") as Duration;
const SEED_EXPIRATION_DELAY = (process.env.SEED_EXPIRATION_DELAY || "3m") as Duration;

// Relatable content — not about Posthook or webhooks
const SEED_TASKS = [
  {
    contentType: "customer email",
    prompt: "Write an apology email for the 2-hour outage last night",
    draft:
      "Subject: Update on last night's service disruption\n\n" +
      "Hi team,\n\n" +
      "Last night between 11:30 PM and 1:30 AM ET, our API experienced elevated " +
      "error rates due to a misconfigured database connection pool. All requests " +
      "during this window received 503 responses.\n\n" +
      "**What happened:** A routine config change reduced the connection pool from " +
      "50 to 5 connections. The change passed staging but failed under production load.\n\n" +
      "**What we're doing:** We've added connection pool size to our deploy checklist " +
      "and are implementing automated load tests on config changes.\n\n" +
      "**Impact:** Approximately 12,000 failed requests across 340 accounts. " +
      "No data was lost.\n\n" +
      "We're sorry for the disruption. If you have questions, reply to this email.\n\n" +
      "— The Engineering Team",
    status: "pending_review" as const,
  },
  {
    contentType: "product update",
    prompt: "Draft release notes for the v3.2 launch",
    draft:
      "**v3.2 Release Notes**\n\n" +
      "**New:** Bulk actions on the dashboard. Select multiple items and " +
      "retry, replay, or cancel them in one click.\n\n" +
      "**New:** Per-hook retry overrides. Set custom retry counts and backoff " +
      "strategies on individual hooks without changing project defaults.\n\n" +
      "**Improved:** Dashboard load time reduced by 60% for projects with " +
      "over 10,000 hooks.\n\n" +
      "**Fixed:** Timezone display now correctly handles DST transitions " +
      "for hooks scheduled with `postAtLocal`.",
    status: "reminded" as const,
  },
  {
    contentType: "team announcement",
    prompt: "Write a Slack message about the new on-call rotation",
    draft:
      "Hey team 👋\n\n" +
      "Starting next Monday, we're moving to a weekly on-call rotation " +
      "instead of the current 2-week schedule. Here's why:\n\n" +
      "- Two weeks is long enough that people dread their rotation\n" +
      "- One week keeps context fresh without burning anyone out\n" +
      "- We now have enough people to make weekly rotations work\n\n" +
      "The new schedule is in the #oncall channel. Swap requests go through " +
      "the same process as before.\n\n" +
      "Questions? Drop them in the thread.",
    status: "approved" as const,
  },
];

export async function seedSession(sessionId: string): Promise<void> {
  const now = new Date();

  // Stagger creation times so tasks feel natural
  const offsets = [
    30_000,       // task 1: 30s ago (pending — most recent, shows at top)
    5 * 60_000,   // task 2: 5 min ago (reminded)
    12 * 60_000,  // task 3: 12 min ago (approved)
  ];

  for (let i = 0; i < SEED_TASKS.length; i++) {
    const seed = SEED_TASKS[i];
    const id = randomUUID();
    const createdAt = new Date(now.getTime() - offsets[i]).toISOString();

    if (seed.status === "pending_review") {
      // Task 1: pending_review — schedule real hooks with short timers
      const [reminderHook, expirationHook] = await Promise.all([
        posthook().hooks.schedule<RemindPayload>({
          path: "/api/webhooks/remind",
          postIn: SEED_REMINDER_DELAY,
          data: { taskId: id, reminderEpoch: 0, sessionId },
        }),
        posthook().hooks.schedule<ExpirePayload>({
          path: "/api/webhooks/expire",
          postIn: SEED_EXPIRATION_DELAY,
          data: { taskId: id, sessionId },
        }),
      ]);

      const task: Task = {
        id,
        sessionId,
        status: "pending_review",
        contentType: seed.contentType,
        prompt: seed.prompt,
        draft: seed.draft,
        createdAt,
        updatedAt: createdAt,
        remindedAt: null,
        resolvedAt: null,
        snoozeUntil: null,
        reminderEpoch: 0,
        reminderAt: reminderHook.postAt,
        expirationAt: expirationHook.postAt,
      };

      await saveTask(task);
      await recordEvent(sessionId, id, "task_created", { kind: "task_created", contentType: seed.contentType, prompt: seed.prompt });
      await recordEvent(sessionId, id, "hooks_scheduled", {
        kind: "hooks_scheduled",
        hooks: [
          { endpoint: "/api/webhooks/remind", firesAt: reminderHook.postAt },
          { endpoint: "/api/webhooks/expire", firesAt: expirationHook.postAt },
        ],
      });
    } else if (seed.status === "reminded") {
      // Task 2: reminded — simulate a reminder that already fired
      const remindedAt = new Date(now.getTime() - 2 * 60_000).toISOString();

      const expirationHook = await posthook().hooks.schedule<ExpirePayload>({
        path: "/api/webhooks/expire",
        postIn: "3m",
        data: { taskId: id, sessionId },
      });

      const task: Task = {
        id,
        sessionId,
        status: "reminded",
        contentType: seed.contentType,
        prompt: seed.prompt,
        draft: seed.draft,
        createdAt,
        updatedAt: remindedAt,
        remindedAt,
        resolvedAt: null,
        snoozeUntil: null,
        reminderEpoch: 0,
        reminderAt: remindedAt,
        expirationAt: expirationHook.postAt,
      };

      await saveTask(task);
      await recordEvent(sessionId, id, "task_created", { kind: "task_created", contentType: seed.contentType, prompt: seed.prompt });
      await recordEvent(sessionId, id, "reminder_delivered", {
        kind: "webhook_delivered",
        endpoint: "/api/webhooks/remind",
        status: 200,
        checks: [
          { label: "Signature", value: "verified", pass: true },
          { label: "State", value: "pending_review", pass: true },
          { label: "Epoch", value: "0 = 0", pass: true },
        ],
        result: "Updated to reminded",
      });
    } else if (seed.status === "approved") {
      const resolvedAt = new Date(now.getTime() - 8 * 60_000).toISOString();

      const task: Task = {
        id,
        sessionId,
        status: "approved",
        contentType: seed.contentType,
        prompt: seed.prompt,
        draft: seed.draft,
        createdAt,
        updatedAt: resolvedAt,
        remindedAt: null,
        resolvedAt,
        snoozeUntil: null,
        reminderEpoch: 0,
        reminderAt: null,
        expirationAt: null,
      };

      await saveTask(task);
      await recordEvent(sessionId, id, "task_created", { kind: "task_created", contentType: seed.contentType, prompt: seed.prompt });
      await recordEvent(sessionId, id, "task_approved", { kind: "action", action: "Approved", note: "Pending hooks will no-op on delivery (state verification)" });
    }
  }

  // Schedule session cleanup
  await posthook().hooks.schedule<CleanupPayload>({
    path: "/api/webhooks/cleanup",
    postIn: "30m",
    data: { sessionId },
  });

  await recordEvent(sessionId, "system", "hooks_scheduled", {
    kind: "hooks_scheduled",
    hooks: [{ endpoint: "/api/webhooks/cleanup", firesAt: new Date(Date.now() + 30 * 60_000).toISOString() }],
  });
}
