import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

export function Header() {
  const { logout } = useAuth()

  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <h1 className="text-xl font-bold">Task Manager</h1>
      <Button variant="outline" size="sm" onClick={logout}>
        Logout
      </Button>
    </header>
  )
}
