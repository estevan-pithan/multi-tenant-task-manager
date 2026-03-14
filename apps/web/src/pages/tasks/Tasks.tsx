import { useAuth } from "@/contexts/AuthContext"
import { Header } from "@/components/layout/Header"
import { LoginForm } from "./components/LoginForm"
import { CreateTaskForm } from "./components/CreateTaskForm"
import { TaskList } from "./components/TaskList"

export function Tasks() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-2xl space-y-6 p-6">
        <CreateTaskForm />
        <TaskList />
      </main>
    </div>
  )
}
