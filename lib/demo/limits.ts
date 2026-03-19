import { eq, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";

const MAX_TASKS_PER_SESSION = 10;

export async function checkLimits(
  sessionId: string
): Promise<{ ok: boolean; reason?: string }> {
  const result = await db
    .select({ count: count() })
    .from(tasks)
    .where(eq(tasks.sessionId, sessionId));

  const taskCount = result[0]?.count ?? 0;

  if (taskCount >= MAX_TASKS_PER_SESSION) {
    return {
      ok: false,
      reason: `Demo limit: max ${MAX_TASKS_PER_SESSION} tasks per session`,
    };
  }

  return { ok: true };
}
