import { api } from "@/config/api"
import { z } from "zod"

export const createTaskInputSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  status: z.enum(["pending", "in_progress", "done"]).optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskInputSchema>

const createTaskResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  status: z.string(),
  tenantId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().nullable(),
})

export type CreateTaskResponse = z.infer<typeof createTaskResponseSchema>

export async function createTask(data: CreateTaskInput) {
  const response = await api.post("/tasks", data)
  return createTaskResponseSchema.parse(response.data)
}
