import { useGetTasks } from "@/pages/tasks/hooks/use-tasks"
import { TaskItem } from "./TaskItem"

export function TaskList() {
  const { data: tasks, isLoading, isError } = useGetTasks()

  if (isLoading) {
    return <p className="text-muted-foreground py-8 text-center">Loading tasks...</p>
  }

  if (isError) {
    return <p className="text-destructive py-8 text-center">Failed to load tasks.</p>
  }

  if (!tasks || tasks.length === 0) {
    return <p className="text-muted-foreground py-8 text-center">No tasks yet.</p>
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  )
}
