# Posthook Patterns

Copy-pasteable patterns for building time-based features with Posthook and Next.js.

## Pattern: Schedule hooks before committing state

Always schedule hooks before writing to the database. If scheduling fails, no broken
task exists. If the database write fails after scheduling, the orphaned hooks fire,
find no matching state, and harmlessly no-op.

```typescript
// 1. Schedule hooks first
const [reminderHook, expirationHook] = await Promise.all([
  posthook().hooks.schedule({ path: "/api/webhooks/remind", postIn: "1h", data: { taskId: id } }),
  posthook().hooks.schedule({ path: "/api/webhooks/expire", postIn: "24h", data: { taskId: id } }),
]);

// 2. Commit state after hooks are scheduled
await saveTask({ id, status: "pending_review", reminderAt: reminderHook.postAt, ... });
```

**Used in**: `lib/tasks.ts` — `createTask()`, `snoozeTask()`

## Pattern: State verification on delivery

Every webhook handler checks task state before acting. If the task is already resolved,
return 200 and do nothing. This eliminates the need to cancel hooks when humans act —
hooks self-disarm by checking state.

```typescript
export async function handleReminder(taskId: string, reminderEpoch: number) {
  const task = await getTask(taskId);

  // No-op if task is already resolved
  if (!task || task.status !== "pending_review") return;

  // No-op if this is a stale reminder (epoch mismatch after snooze)
  if (reminderEpoch !== task.reminderEpoch) return;

  // Conditional update — only transitions from pending_review
  await updateTask(taskId, { status: "reminded" }, "pending_review");
}
```

**Used in**: `lib/tasks.ts` — `handleReminder()`, `handleExpiration()`

## Pattern: Epoch-based snooze

Snooze schedules a new reminder and increments a counter (`reminderEpoch`) on the task.
When old reminders fire, they check the epoch — if it doesn't match the current task
epoch, the reminder is stale and should be ignored. No cancellation needed.

```typescript
const nextEpoch = task.reminderEpoch + 1;

// Schedule new reminder with the new epoch
await posthook().hooks.schedule({
  path: "/api/webhooks/remind",
  postIn: delay,
  data: { taskId: id, reminderEpoch: nextEpoch },
});

// Update task epoch — old reminders will see a mismatch and no-op
await updateTask(id, { reminderEpoch: nextEpoch, snoozeUntil }, "pending_review");
```

**Used in**: `lib/tasks.ts` — `snoozeTask()`

## Pattern: Conditional database updates

Use `WHERE status = ?` to prevent race conditions. If a human approves a task at the
same moment a reminder fires, only one wins — the other gets zero rows affected and
no-ops gracefully.

```typescript
export async function updateTask(id: string, updates: Partial<Task>, expectedStatus?: TaskStatus) {
  const conditions = expectedStatus
    ? and(eq(tasks.id, id), eq(tasks.status, expectedStatus))
    : eq(tasks.id, id);

  const result = await db.update(tasks).set(updates).where(conditions!).returning();
  return result[0] ?? null; // null = condition didn't match, another action won
}
```

**Used in**: `lib/store.ts` — `updateTask()`

## Pattern: Per-route webhook handlers

Each hook type gets its own route under `/api/webhooks/`. This maps to separate
endpoints in the Posthook dashboard, making it easy to monitor delivery counts per
hook type. Adding a new hook type = create a new route file.

```
app/api/webhooks/
  remind/route.ts     # Reminder callbacks
  expire/route.ts     # Expiration callbacks
  escalate/route.ts   # (example) Escalation callbacks
```

Each handler verifies the signature inline — no shared middleware, each file is
self-contained and readable:

```typescript
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const delivery = posthook().signatures.parseDelivery<RemindPayload>(body, request.headers);
  await handleReminder(delivery.data.taskId, delivery.data.reminderEpoch);
  return Response.json({ ok: true });
}
```

**Used in**: `app/api/webhooks/remind/route.ts`, `app/api/webhooks/expire/route.ts`

## Pattern: Idempotency keys for notifications

When sending notifications (email, Slack, etc.) from a webhook handler, use
`remind:{taskId}:{reminderEpoch}` as an idempotency key. The epoch is stable across
retries and duplicate hooks for the same reminder, but increments on each snooze so
new reminders send fresh notifications.

```typescript
await sendNotification({
  idempotencyKey: `remind:${taskId}:${reminderEpoch}`,
  // ... notification content
});
```

**Used in**: `lib/tasks.ts` — `handleReminder()` (documented in TODO comment)

## Pattern: Cancel for cleanup (optional)

State verification makes cancellation unnecessary for correctness. But at high volume,
you may want to cancel hooks when a task resolves to reduce unnecessary deliveries:

```typescript
await posthook().hooks.delete(hookId);
```

This is an optimization, not a requirement. The starter doesn't use it.

**Reference**: [Posthook SDK docs](https://docs.posthook.io)
