import { useState, type FormEvent } from "react"
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

export function CreateTaskModal() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [status, setStatus] = useState<string>("pending")
  const { mutate, isPending } = useCreateTask()

  function resetForm() {
    setTitle("")
    setStatus("pending")
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
              autoFocus
            />
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
