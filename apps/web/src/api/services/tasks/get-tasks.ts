import { api } from "@/config/api"
import { z } from "zod"

const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  status: z.string(),
  tenantId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().nullable(),
})

const getTasksResponseSchema = z.array(taskSchema)

export type Task = z.infer<typeof taskSchema>
export type GetTasksResponse = z.infer<typeof getTasksResponseSchema>

export async function getTasks() {
  const response = await api.get("/tasks")
  return getTasksResponseSchema.parse(response.data)
}
