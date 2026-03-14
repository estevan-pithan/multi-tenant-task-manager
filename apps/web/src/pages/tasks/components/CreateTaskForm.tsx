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
import { useCreateTask } from "@/pages/tasks/hooks/use-tasks"
import { TASK_STATUSES } from "@/types/task"

export function CreateTaskForm() {
  const [title, setTitle] = useState("")
  const [status, setStatus] = useState<string>("pending")
  const { mutate, isPending } = useCreateTask()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    mutate(
      { title: title.trim(), status: status as (typeof TASK_STATUSES)[number] },
      {
        onSuccess: () => {
          setTitle("")
          setStatus("pending")
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="title">New task</Label>
        <Input
          id="title"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="w-40 space-y-1.5">
        <Label>Status</Label>
        <Select value={status} onValueChange={(value) => { if (value) setStatus(value) }}>
          <SelectTrigger>
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
      <Button type="submit" disabled={isPending || !title.trim()}>
        {isPending ? "Creating..." : "Create"}
      </Button>
    </form>
  )
}
