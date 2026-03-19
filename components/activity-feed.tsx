import Link from "next/link";
import {
  BellIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TimerOffIcon,
  PlusCircleIcon,
  PauseCircleIcon,
} from "lucide-react";
import { LocalTime } from "@/components/local-time";
import type { TaskEvent, EventDetail } from "@/lib/types";

const eventConfig: Record<
  string,
  { label: string; isPosthook: boolean; icon: typeof BellIcon; bg: string }
> = {
  task_created: { label: "Task created", isPosthook: false, icon: PlusCircleIcon, bg: "pastel-lavender" },
  hooks_scheduled: { label: "Hooks scheduled", isPosthook: true, icon: ClockIcon, bg: "pastel-yellow" },
  reminder_delivered: { label: "Reminder delivered", isPosthook: true, icon: BellIcon, bg: "pastel-peach" },
  expiration_delivered: { label: "Expiration delivered", isPosthook: true, icon: TimerOffIcon, bg: "pastel-rose" },
  task_approved: { label: "Approved", isPosthook: false, icon: CheckCircleIcon, bg: "pastel-mint" },
  task_rejected: { label: "Rejected", isPosthook: false, icon: XCircleIcon, bg: "pastel-rose" },
  task_snoozed: { label: "Snoozed", isPosthook: true, icon: PauseCircleIcon, bg: "pastel-sky" },
};

const defaultConfig = { label: "Event", isPosthook: false, icon: ClockIcon, bg: "pastel-lavender" };

function parseDetail(raw: string | null): EventDetail | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return { kind: "text", message: raw };
  }
}

function EventDetailView({ detail }: { detail: EventDetail }) {
  switch (detail.kind) {
    case "task_created":
      return (
        <div className="text-muted-foreground mt-1 pl-[18px] text-[11px]">
          {detail.contentType}: {detail.prompt}
        </div>
      );

    case "hooks_scheduled":
      return (
        <div className="mt-1 pl-[18px] space-y-0.5">
          {detail.hooks.map((hook, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px]">
              <span className="font-mono text-muted-foreground">POST</span>
              <span className="font-mono font-bold">{hook.endpoint}</span>
              <span className="text-muted-foreground">at <LocalTime date={hook.firesAt} /></span>
            </div>
          ))}
        </div>
      );

    case "webhook_delivered":
      return (
        <div className="mt-1 pl-[18px] space-y-0.5 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-muted-foreground">POST</span>
            <span className="font-mono font-bold">{detail.endpoint}</span>
            <span className="font-mono pastel-mint px-1.5 rounded text-[10px] font-bold border border-foreground/10">
              {detail.status}
            </span>
          </div>
          {detail.checks.map((check, i) => (
            <div key={i} className="flex items-center gap-2 text-muted-foreground">
              <span className={check.pass ? "text-green-600" : "text-red-500"}>
                {check.pass ? "✓" : "✗"}
              </span>
              <span>{check.label}:</span>
              <span className="font-mono">{check.value}</span>
            </div>
          ))}
          <div className="font-bold">{detail.result}</div>
        </div>
      );

    case "action":
      return (
        <div className="mt-1 pl-[18px] text-[11px] text-muted-foreground">
          {detail.note}
        </div>
      );

    case "snooze":
      return (
        <div className="mt-1 pl-[18px] space-y-0.5 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-muted-foreground">POST</span>
            <span className="font-mono font-bold">{detail.endpoint}</span>
            <span className="text-muted-foreground">at <LocalTime date={detail.firesAt} /></span>
          </div>
          <div className="text-muted-foreground">
            Epoch {detail.oldEpoch} → {detail.newEpoch} (old reminders will no-op)
          </div>
        </div>
      );

    case "text":
      return (
        <div className="text-muted-foreground mt-1 pl-[18px] text-[11px] font-mono whitespace-pre-line">
          {detail.message}
        </div>
      );
  }
}

export function ActivityFeed({ events }: { events: TaskEvent[] }) {
  if (events.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
        Recent Activity
      </h3>
      <div className="space-y-2">
        {events.map((event) => {
          const config = eventConfig[event.type] ?? defaultConfig;
          const Icon = config.icon;
          const href = event.taskId === "system" ? "/dashboard" : `/tasks/${event.taskId}`;
          const detail = parseDetail(event.detail);
          return (
            <Link
              key={event.id}
              href={href}
              className={`feed-item block rounded-lg border-2 border-foreground/10 p-2.5 text-xs hover:border-foreground/25 transition-colors ${config.bg}`}
            >
              <div className="flex items-center gap-1.5">
                <Icon className="size-3 shrink-0" />
                <span className="font-bold">{config.label}</span>
                {config.isPosthook && (
                  <span className="font-bold text-[10px] uppercase tracking-wider opacity-60">
                    Posthook
                  </span>
                )}
                <span className="ml-auto text-muted-foreground">
                  <LocalTime date={event.createdAt} />
                </span>
              </div>
              {detail && <EventDetailView detail={detail} />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
