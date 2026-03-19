import { pgTable, text, integer, index } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  status: text("status").notNull().default("generating"),
  contentType: text("content_type").notNull(),
  prompt: text("prompt").notNull(),
  draft: text("draft").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  remindedAt: text("reminded_at"),
  resolvedAt: text("resolved_at"),
  snoozeUntil: text("snooze_until"),
  reminderEpoch: integer("reminder_epoch").notNull().default(0),
  reminderAt: text("reminder_at"),
  expirationAt: text("expiration_at"),
}, (table) => [
  index("tasks_session_id_idx").on(table.sessionId),
]);

export const events = pgTable("events", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  taskId: text("task_id").notNull(),
  type: text("type").notNull(),
  detail: text("detail"),
  createdAt: text("created_at").notNull(),
}, (table) => [
  index("events_session_id_idx").on(table.sessionId),
  index("events_task_id_idx").on(table.taskId),
]);
