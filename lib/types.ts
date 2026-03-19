export type TaskStatus =
  | "generating"
  | "pending_review"
  | "reminded"
  | "approved"
  | "rejected"
  | "expired";

export type Task = {
  id: string;
  sessionId: string;
  status: TaskStatus;
  contentType: string;
  prompt: string;
  draft: string;
  createdAt: string;
  updatedAt: string;
  remindedAt: string | null;
  resolvedAt: string | null;
  snoozeUntil: string | null;
  reminderEpoch: number;
  reminderAt: string | null;
  expirationAt: string | null;
};

export type EventType =
  | "task_created"
  | "hooks_scheduled"
  | "reminder_delivered"
  | "expiration_delivered"
  | "task_approved"
  | "task_rejected"
  | "task_snoozed"
  | "session_cleanup";

export type TaskEvent = {
  id: string;
  sessionId: string;
  taskId: string;
  type: EventType;
  detail: string | null; // JSON-encoded EventDetail
  createdAt: string;
};

// Structured event details — stored as JSON in the detail column
export type EventDetail =
  | { kind: "task_created"; contentType: string; prompt: string }
  | { kind: "hooks_scheduled"; hooks: { endpoint: string; firesAt: string }[] }
  | { kind: "webhook_delivered"; endpoint: string; status: number; checks: { label: string; value: string; pass: boolean }[]; result: string }
  | { kind: "action"; action: string; note: string }
  | { kind: "snooze"; endpoint: string; firesAt: string; oldEpoch: number; newEpoch: number }
  | { kind: "text"; message: string };

// Each webhook route has its own payload type.
export type RemindPayload = { taskId: string; reminderEpoch: number; sessionId: string };
export type ExpirePayload = { taskId: string; sessionId: string };
export type CleanupPayload = { sessionId: string };
