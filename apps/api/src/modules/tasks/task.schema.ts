import { z } from "zod/v4";

export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  status: z.enum(["pending", "in_progress", "done"]).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
