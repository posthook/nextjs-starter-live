"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon, ClockIcon, ChevronDownIcon } from "lucide-react";
import type { TaskStatus } from "@/lib/types";

const snoozeOptions = [
  { label: "15 minutes", delay: "15m" },
  { label: "1 hour", delay: "1h" },
  { label: "4 hours", delay: "4h" },
  { label: "1 day", delay: "1d" },
];

export function TaskActions({
  taskId,
  status,
}: {
  taskId: string;
  status: TaskStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const canAct = status === "pending_review" || status === "reminded";
  if (!canAct) return null;

  async function handleAction(action: string, delay?: string) {
    setLoading(action);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, delay }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error(`[task-actions] ${action} failed:`, body);
      }
      router.refresh();
    } catch (err) {
      console.error(`[task-actions] ${action} error:`, err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleAction("approve")}
        disabled={loading !== null}
        className="comic-btn pastel-mint px-3 py-1.5 text-xs inline-flex items-center gap-1 disabled:opacity-50"
      >
        <CheckIcon className="size-3" />
        {loading === "approve" ? "..." : "Approve"}
      </button>
      <button
        onClick={() => handleAction("reject")}
        disabled={loading !== null}
        className="comic-btn pastel-rose px-3 py-1.5 text-xs inline-flex items-center gap-1 disabled:opacity-50"
      >
        <XIcon className="size-3" />
        {loading === "reject" ? "..." : "Reject"}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={loading !== null}
          render={
            <Button variant="outline" size="sm" className="border-2 border-foreground font-bold">
              <ClockIcon />
              {loading === "snooze" ? "..." : "Snooze"}
              <ChevronDownIcon />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          {snoozeOptions.map((opt) => (
            <DropdownMenuItem
              key={opt.delay}
              onSelect={() => handleAction("snooze", opt.delay)}
            >
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
