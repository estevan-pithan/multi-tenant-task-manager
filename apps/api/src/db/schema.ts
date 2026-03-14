import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    status: text("status").default("pending").notNull(),
    tenantId: text("tenant_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [index("tasks_tenant_id_idx").on(table.tenantId)],
);
