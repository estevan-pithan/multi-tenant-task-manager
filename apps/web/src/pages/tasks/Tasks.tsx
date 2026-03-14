import { useQueryClient, useIsFetching } from "@tanstack/react-query"
import { RefreshCwIcon } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { CreateTaskModal } from "./components/CreateTaskModal"
import { TaskList } from "./components/TaskList"

export function Tasks() {
  const queryClient = useQueryClient()
  const isFetching = useIsFetching({ queryKey: ["tasks"] })

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-hidden px-8 py-6">
        <div className="mx-auto flex h-full max-w-6xl flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tasks</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={isFetching > 0}
                onClick={() => queryClient.resetQueries({ queryKey: ["tasks"] })}
              >
                <RefreshCwIcon className={`size-4 ${isFetching > 0 ? "animate-spin" : ""}`} />
              </Button>
              <CreateTaskModal />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <TaskList />
          </div>
        </div>
      </main>
    </div>
  )
}
