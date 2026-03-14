import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod/v4";
import { authMiddleware } from "./middleware/auth";
import { taskRoutes } from "./modules/tasks/task.routes";

type Env = { Bindings: { DATABASE_URL: string }; Variables: { tenantId: string } };

const app = new Hono<Env>();

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  if (err instanceof ZodError) {
    return c.json({ error: "Validation error", issues: err.issues }, 400);
  }
  return c.json({ error: "Internal server error" }, 500);
});

app.use("/tasks/*", authMiddleware);
app.use("/tasks", authMiddleware);

app.route("/tasks", taskRoutes);

export default app;
