import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getTasks } from "@/api/services/tasks/get-tasks"
import { createTask, type CreateTaskInput } from "@/api/services/tasks/create-task"
import { deleteTask } from "@/api/services/tasks/delete-task"
import { useAuth } from "@/contexts/AuthContext"

export function useGetTasks() {
  const { currentTenantId } = useAuth()

  return useQuery({
    queryKey: ["tasks", currentTenantId],
    queryFn: getTasks,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaskInput) => createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })
}
