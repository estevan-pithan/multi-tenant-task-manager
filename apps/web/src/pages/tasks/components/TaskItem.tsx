import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Task } from "@/api/services/tasks/get-tasks"
import { useDeleteTask } from "@/pages/tasks/hooks/use-tasks"
import { CalendarIcon, ClockIcon, CheckCircle2Icon, Trash2Icon } from "lucide-react"

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  in_progress: "secondary",
  done: "default",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString))
}

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  const { mutate, isPending } = useDeleteTask()

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="flex-1 space-y-1">
          <CardTitle className="text-base leading-snug">{task.title}</CardTitle>
          <Badge variant={STATUS_VARIANTS[task.status] ?? "outline"} className="text-xs">
            {STATUS_LABELS[task.status] ?? task.status}
          </Badge>
        </div>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={isPending}
                className="text-muted-foreground hover:text-destructive shrink-0"
              />
            }
          >
            <Trash2Icon className="size-4" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete task</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{task.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => mutate(task.id)}>
                {isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarIcon className="size-3" />
            Created {formatDate(task.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <ClockIcon className="size-3" />
            Updated {formatDate(task.updatedAt)}
          </span>
          {task.completedAt && (
            <span className="flex items-center gap-1">
              <CheckCircle2Icon className="size-3" />
              Completed {formatDate(task.completedAt)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
