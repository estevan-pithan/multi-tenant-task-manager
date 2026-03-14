import { api } from "@/config/api"

export async function deleteTask(id: string) {
  await api.delete(`/tasks/${id}`)
}
