import { useState, type FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

export function LoginForm() {
  const [tokenInput, setTokenInput] = useState("")
  const { login } = useAuth()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (tokenInput.trim()) {
      login(tokenInput.trim())
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Task Manager</h1>
          <p className="text-muted-foreground text-sm">
            Enter your Bearer token to continue
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Bearer token"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={!tokenInput.trim()}>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  )
}
