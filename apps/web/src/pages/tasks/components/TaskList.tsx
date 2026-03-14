import { useGetTasks } from "@/pages/tasks/hooks/use-tasks"
import { TaskItem } from "./TaskItem"
import { TaskItemSkeleton } from "./TaskItemSkeleton"

export function TaskList() {
  const { data: tasks, isLoading, isError } = useGetTasks()

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <TaskItemSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return <p className="text-destructive py-8 text-center">Failed to load tasks.</p>
  }

  if (!tasks || tasks.length === 0) {
    return <p className="text-muted-foreground py-8 text-center">No tasks yet.</p>
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  )
}
