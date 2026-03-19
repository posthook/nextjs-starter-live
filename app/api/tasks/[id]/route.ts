import { getTask } from "@/lib/store";
import { approveTask, rejectTask, snoozeTask } from "@/lib/tasks";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const task = await getTask(id);

  if (!task) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  return Response.json(task);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { action, delay } = body;

  let task;
  switch (action) {
    case "approve":
      task = await approveTask(id);
      break;
    case "reject":
      task = await rejectTask(id);
      break;
    case "snooze":
      task = await snoozeTask(id, delay);
      break;
    default:
      return Response.json(
        { error: `Unknown action: ${action}` },
        { status: 400 }
      );
  }

  if (!task) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  return Response.json(task);
}
