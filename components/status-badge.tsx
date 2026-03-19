import type { TaskStatus } from "@/lib/types";

const statusConfig: Record<
  TaskStatus,
  { label: string; bg: string; text: string }
> = {
  generating: { label: "Generating", bg: "#e8e8f0", text: "#6b6b8a" },
  pending_review: { label: "Pending review", bg: "#fdf5d8", text: "#8a7a2e" },
  reminded: { label: "Reminded", bg: "#fde8d8", text: "#8a5a2e" },
  approved: { label: "Approved", bg: "#e8f4f0", text: "#2e6b5a" },
  rejected: { label: "Rejected", bg: "#fde8ee", text: "#8a2e4a" },
  expired: { label: "Expired", bg: "#e8e8f0", text: "#8a8a9a" },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-block px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full border-2 border-foreground ${status === "expired" ? "line-through" : ""}`}
      style={{ background: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  );
}
