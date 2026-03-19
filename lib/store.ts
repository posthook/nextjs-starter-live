import { eq, and, desc, inArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "./db";
import { tasks, events } from "./db/schema";
import { requireSessionId } from "./demo/session";
import type { Task, TaskStatus, TaskEvent, EventType, EventDetail } from "./types";

// All queries are scoped to the current session.

export async function getTask(id: string): Promise<Task | null> {
  const sessionId = await requireSessionId();
  const result = await db.select().from(tasks).where(and(eq(tasks.id, id), eq(tasks.sessionId, sessionId)));
  return (result[0] as Task) ?? null;
}

// Internal: used by webhook handlers which don't have a session cookie
export async function getTaskById(id: string): Promise<Task | null> {
  const result = await db.select().from(tasks).where(eq(tasks.id, id));
  return (result[0] as Task) ?? null;
}

export async function listTasks(): Promise<Task[]> {
  const sessionId = await requireSessionId();
  const result = await db
    .select({
      id: tasks.id,
      sessionId: tasks.sessionId,
      status: tasks.status,
      contentType: tasks.contentType,
      prompt: tasks.prompt,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      remindedAt: tasks.remindedAt,
      resolvedAt: tasks.resolvedAt,
      snoozeUntil: tasks.snoozeUntil,
      reminderEpoch: tasks.reminderEpoch,
      reminderAt: tasks.reminderAt,
      expirationAt: tasks.expirationAt,
    })
    .from(tasks)
    .where(eq(tasks.sessionId, sessionId))
    .orderBy(desc(tasks.createdAt));
  return result.map((r) => ({ ...r, draft: "" })) as Task[];
}

export async function saveTask(task: Task): Promise<void> {
  const { id, ...fields } = task;
  await db.insert(tasks).values(task).onConflictDoUpdate({
    target: tasks.id,
    set: fields,
  });
}

// Conditional update: only applies if the task is in one of the expected statuses.
// Returns the updated task, or null if no rows matched (another action won the race).
export async function updateTask(
  id: string,
  updates: Partial<Task>,
  expectedStatuses?: TaskStatus[]
): Promise<Task | null> {
  const where = expectedStatuses
    ? and(eq(tasks.id, id), inArray(tasks.status, expectedStatuses))
    : eq(tasks.id, id);

  const result = await db
    .update(tasks)
    .set({ ...updates, updatedAt: new Date().toISOString() })
    .where(where)
    .returning();

  return (result[0] as Task) ?? null;
}

// Activity feed — scoped to session
export async function recordEvent(
  sessionId: string,
  taskId: string,
  type: EventType,
  detail?: EventDetail
): Promise<void> {
  await db.insert(events).values({
    id: randomUUID(),
    sessionId,
    taskId,
    type,
    detail: detail ? JSON.stringify(detail) : null,
    createdAt: new Date().toISOString(),
  });
}

export async function getTaskEvents(taskId: string): Promise<TaskEvent[]> {
  const sessionId = await requireSessionId();
  const result = await db
    .select()
    .from(events)
    .where(and(eq(events.taskId, taskId), eq(events.sessionId, sessionId)))
    .orderBy(desc(events.createdAt));
  return result as TaskEvent[];
}

export async function getRecentEvents(limit = 20): Promise<TaskEvent[]> {
  const sessionId = await requireSessionId();
  const result = await db
    .select()
    .from(events)
    .where(eq(events.sessionId, sessionId))
    .orderBy(desc(events.createdAt))
    .limit(limit);
  return result as TaskEvent[];
}

// Session cleanup — delete all data for a session
export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(events).where(eq(events.sessionId, sessionId));
  await db.delete(tasks).where(eq(tasks.sessionId, sessionId));
}
