import { Hono } from "hono";
import { createDb } from "../../db/client";
import { rateLimitMiddleware } from "../../middleware/rateLimit";
import { createTaskRepository } from "./task.repository";
import { createTaskService } from "./task.service";
import { createTaskController } from "./task.controller";

type Controller = ReturnType<typeof createTaskController>;
type Env = {
  Bindings: { DATABASE_URL: string };
  Variables: { tenantId: string; controller: Controller };
};

const taskRoutes = new Hono<Env>();

let controller: Controller | null = null;

taskRoutes.use("*", async (c, next) => {
  if (!controller) {
    const db = createDb(c.env.DATABASE_URL);
    const repository = createTaskRepository(db);
    const service = createTaskService(repository);
    controller = createTaskController(service);
  }
  c.set("controller", controller);
  await next();
});

taskRoutes.get("/", (c) => c.get("controller").list(c));
taskRoutes.post("/", rateLimitMiddleware, (c) => c.get("controller").create(c));
taskRoutes.delete("/:id", (c) => c.get("controller").delete(c));

export { taskRoutes };
