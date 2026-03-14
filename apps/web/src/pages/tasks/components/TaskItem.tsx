import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Task } from "@/api/services/tasks/get-tasks"
import { useDeleteTask } from "@/pages/tasks/hooks/use-tasks"

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  in_progress: "secondary",
  done: "default",
}

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  const { mutate, isPending } = useDeleteTask()

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_VARIANTS[task.status] ?? "outline"}>
            {task.status.replace("_", " ")}
          </Badge>
          <span className="font-medium">{task.title}</span>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => mutate(task.id)}
          disabled={isPending}
        >
          {isPending ? "Deleting..." : "Delete"}
        </Button>
      </CardContent>
    </Card>
  )
}
