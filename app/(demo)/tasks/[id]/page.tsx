import Link from "next/link";
import { notFound } from "next/navigation";
import { getTask, getTaskEvents } from "@/lib/store";
import { StatusBadge } from "@/components/status-badge";
import { TaskActions } from "@/components/task-actions";
import { PosthookTiming } from "@/components/posthook-timing";
import { ActivityFeed } from "@/components/activity-feed";
import { ArrowLeftIcon } from "lucide-react";
import { LocalDateTime } from "@/components/local-time";

export const dynamic = "force-dynamic";

function renderDraft(draft: string) {
  return draft.split("\n").map((line, i) => {
    if (line.startsWith("### "))
      return <h3 key={i} className="text-sm font-bold mt-4 mb-1">{line.slice(4)}</h3>;
    if (line.startsWith("## "))
      return <h2 key={i} className="text-base font-bold mt-4 mb-1">{line.slice(3)}</h2>;
    if (line.startsWith("# "))
      return <h1 key={i} className="text-lg font-bold mt-4 mb-1">{line.slice(2)}</h1>;
    if (line.trim() === "") return <br key={i} />;
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={i}>
        {parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
        )}
      </p>
    );
  });
}

export default async function TaskDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [task, taskEvents] = await Promise.all([
    getTask(id),
    getTaskEvents(id),
  ]);

  if (!task) notFound();

  const isResolved =
    task.status === "approved" ||
    task.status === "rejected" ||
    task.status === "expired";

  return (
    <div className="flex flex-col flex-1 w-full max-w-2xl mx-auto px-4 py-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground mb-6 w-fit"
      >
        <ArrowLeftIcon className="size-3.5" />
        Back to queue
      </Link>

      <div className={`comic-card-static overflow-hidden ${isResolved ? "opacity-60" : ""}`}>
        {/* Header */}
        <div className="p-5 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {task.contentType}
              </span>
              <StatusBadge status={task.status} />
            </div>
            <TaskActions taskId={task.id} status={task.status} />
          </div>
          <h2 className="text-lg font-black">{task.prompt}</h2>
        </div>

        {/* Draft */}
        <div className="border-t-2 border-foreground/10 p-5">
          <div className="text-sm leading-relaxed">
            {renderDraft(task.draft)}
          </div>
        </div>

        {/* Posthook timing + metadata */}
        <div className="border-t-2 border-foreground/10 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <PosthookTiming task={task} />
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Details
              </h3>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Created</dt>
                  <dd className="font-bold"><LocalDateTime date={task.createdAt} /></dd>
                </div>
                {isResolved && task.resolvedAt && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Resolved</dt>
                    <dd className="font-bold"><LocalDateTime date={task.resolvedAt} /></dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Task activity */}
        {taskEvents.length > 0 && (
          <div className="border-t-2 border-foreground/10 p-5">
            <ActivityFeed events={taskEvents} />
          </div>
        )}
      </div>
    </div>
  );
}
