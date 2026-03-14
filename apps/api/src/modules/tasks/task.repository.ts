import { eq, and, desc } from "drizzle-orm";
import { tasks } from "../../db/schema";
import type { Database } from "../../db/client";

export function createTaskRepository(db: Database) {
  return {
    async findAllByTenant(tenantId: string) {
      return db
        .select()
        .from(tasks)
        .where(eq(tasks.tenantId, tenantId))
        .orderBy(desc(tasks.createdAt));
    },

    async create(data: { title: string; status?: string; tenantId: string }) {
      const [task] = await db.insert(tasks).values(data).returning();
      return task;
    },

    async delete(id: string, tenantId: string) {
      const [task] = await db
        .delete(tasks)
        .where(and(eq(tasks.id, id), eq(tasks.tenantId, tenantId)))
        .returning();
      return task ?? null;
    },
  };
}
