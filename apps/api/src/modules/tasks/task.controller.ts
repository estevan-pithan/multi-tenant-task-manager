import type { Context } from "hono";
import type { createTaskService } from "./task.service";
import { createTaskSchema, taskIdSchema } from "./task.schema";

type TaskService = ReturnType<typeof createTaskService>;

export function createTaskController(service: TaskService) {
  return {
    async list(c: Context) {
      const tenantId = c.get("tenantId");
      const tasks = await service.list(tenantId);
      return c.json(tasks);
    },

    async create(c: Context) {
      const tenantId = c.get("tenantId");
      const body = await c.req.json();
      const input = createTaskSchema.parse(body);
      const task = await service.create(input, tenantId);
      return c.json(task, 201);
    },

    async delete(c: Context) {
      const tenantId = c.get("tenantId");
      const { id } = taskIdSchema.parse({ id: c.req.param("id") });
      await service.delete(id, tenantId);
      return c.body(null, 204);
    },
  };
}
