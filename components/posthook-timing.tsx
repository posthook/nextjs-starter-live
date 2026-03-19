import type { Task } from "@/lib/types";
import { LocalTime } from "@/components/local-time";
import { ClockIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";

function timeUntil(date: string): string {
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return "overdue";
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `in ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `in ${hours}h ${minutes % 60}m`;
  const days = Math.floor(hours / 24);
  return `in ${days}d`;
}

function TimerRow({
  label,
  delivered,
  cancelled,
  deliveredTime,
  scheduledTime,
  bg,
}: {
  label: string;
  delivered: boolean;
  cancelled: boolean;
  deliveredTime: string | null;
  scheduledTime: string | null;
  bg: string;
}) {
  if (!scheduledTime && !deliveredTime) return null;

  return (
    <div className={`flex items-center gap-2 rounded-lg border-2 border-foreground/10 p-2 text-xs ${bg}`}>
      {delivered ? (
        <CheckCircleIcon className="size-3.5 shrink-0" />
      ) : cancelled ? (
        <XCircleIcon className="size-3.5 shrink-0 opacity-40" />
      ) : (
        <ClockIcon className="size-3.5 shrink-0" />
      )}
      <span className="font-bold">{label}</span>
      <span className="ml-auto font-medium">
        {delivered
          ? <>delivered <LocalTime date={deliveredTime!} /></>
          : cancelled
            ? "cancelled"
            : <><LocalTime date={scheduledTime!} /> ({timeUntil(scheduledTime!)})</>}
      </span>
    </div>
  );
}

export function PosthookTiming({ task }: { task: Task }) {
  const isResolved =
    task.status === "approved" ||
    task.status === "rejected" ||
    task.status === "expired";

  return (
    <div>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
        Posthook Timing
      </h3>
      <div className="space-y-2">
        <TimerRow
          label={`Reminder${task.reminderEpoch > 0 ? ` (epoch ${task.reminderEpoch})` : ""}`}
          delivered={task.remindedAt !== null}
          cancelled={isResolved && task.remindedAt === null}
          deliveredTime={task.remindedAt}
          scheduledTime={task.reminderAt}
          bg="pastel-peach"
        />
        <TimerRow
          label="Expiration"
          delivered={task.status === "expired"}
          cancelled={isResolved && task.status !== "expired"}
          deliveredTime={task.resolvedAt}
          scheduledTime={task.expirationAt}
          bg="pastel-rose"
        />
      </div>
    </div>
  );
}
