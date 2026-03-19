import Link from "next/link";
import { listTasks, getRecentEvents } from "@/lib/store";
import { LocalTime } from "@/components/local-time";
import { StatusBadge } from "@/components/status-badge";
import { NewTaskDialog } from "@/components/new-task-dialog";
import { ActivityFeed } from "@/components/activity-feed";
import { Countdown } from "@/components/countdown";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [tasks, events] = await Promise.all([
    listTasks(),
    getRecentEvents(15),
  ]);

  return (
    <div className="flex flex-col flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-6">
        <div>
          <h1 className="text-xl font-black tracking-tight">
            Human-in-the-Loop AI Review
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            AI drafts content, Posthook schedules reminders and expirations, you review
          </p>
        </div>
        <div className="shrink-0">
          <NewTaskDialog />
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Task list */}
        <div className="flex-1 min-w-0">
          {tasks.length === 0 ? (
            <div className="comic-card p-8 text-center text-muted-foreground pastel-lavender">
              <p className="font-bold mb-1">No reviews yet</p>
              <p className="text-xs">
                Click &quot;New Review&quot; to generate your first AI draft.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mr-1">
              {tasks.map((task) => {
                const isResolved =
                  task.status === "approved" ||
                  task.status === "rejected" ||
                  task.status === "expired";
                return (
                  <Link key={task.id} href={`/tasks/${task.id}`}>
                    <div
                      className={`comic-card p-3 sm:p-4 cursor-pointer ${isResolved ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mb-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {task.contentType}
                        </span>
                        <StatusBadge status={task.status} />
                        <span className="ml-auto text-xs font-bold text-muted-foreground whitespace-nowrap">
                          <LocalTime date={task.createdAt} />
                        </span>
                      </div>
                      <p className="text-sm font-medium line-clamp-2">
                        {task.prompt}
                      </p>
                      {!isResolved && (
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                          {task.reminderAt && !task.remindedAt && (
                            <Countdown target={task.reminderAt} label="⏰ Reminder in" className="text-amber-700" />
                          )}
                          {task.expirationAt && (
                            <Countdown target={task.expirationAt} label="⏳ Expires in" className="text-red-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity feed sidebar */}
        <aside className="lg:w-80 shrink-0">
          <div className="lg:sticky lg:top-12">
            <ActivityFeed events={events} />
          </div>
        </aside>
      </div>
    </div>
  );
}
