import { useState, type FormEvent } from "react"
import { AxiosError } from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useCreateTask } from "@/pages/tasks/hooks/use-tasks"
import { TASK_STATUSES } from "@/types/task"
import { PlusIcon } from "lucide-react"

const TITLE_MAX_LENGTH = 255

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError && error.response?.status === 429) {
    const retryAfter = error.response.headers["retry-after"]
    return retryAfter
      ? `Too many requests. Try again in ${retryAfter}s.`
      : "Too many requests. Please wait and try again."
  }
  return "Failed to create task. Please try again."
}

export function CreateTaskModal() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [status, setStatus] = useState<string>("pending")
  const { mutate, isPending, error, reset } = useCreateTask()

  function resetForm() {
    setTitle("")
    setStatus("pending")
    reset()
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    mutate(
      { title: title.trim(), status: status as (typeof TASK_STATUSES)[number] },
      {
        onSuccess: () => {
          resetForm()
          setOpen(false)
        },
      },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (!value) resetForm()
      }}
    >
      <DialogTrigger
        render={
          <Button>
            <PlusIcon className="size-4" />
            New Task
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new task</DialogTitle>
          <DialogDescription>
            Add a new task to your board.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={TITLE_MAX_LENGTH}
              autoFocus
            />
            <p className="text-muted-foreground text-xs text-right">
              {title.length}/{TITLE_MAX_LENGTH}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(value) => { if (value) setStatus(value) }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && (
            <p className="text-destructive text-sm">{getErrorMessage(error)}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? "Creating..." : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
