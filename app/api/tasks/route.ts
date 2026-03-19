import { createTask } from "@/lib/tasks";
import { listTasks } from "@/lib/store";
import { requireSessionId } from "@/lib/demo/session";
import { checkLimits } from "@/lib/demo/limits";

export async function GET() {
  const tasks = await listTasks();
  return Response.json(tasks);
}

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { prompt, contentType } = body;

  if (!prompt || !contentType) {
    return Response.json(
      { error: "prompt and contentType are required" },
      { status: 400 }
    );
  }

  // Demo rate limit
  const sessionId = await requireSessionId();
  const limits = await checkLimits(sessionId);
  if (!limits.ok) {
    return Response.json({ error: limits.reason }, { status: 429 });
  }

  try {
    const task = await createTask(prompt, contentType);
    return Response.json(task, { status: 201 });
  } catch (err) {
    console.error("[tasks] Create error:", err);
    return Response.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
