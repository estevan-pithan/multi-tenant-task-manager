import { useAuth } from "@/contexts/AuthContext"
import { tenants } from "@/config/tenants"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function Header() {
  const { switchTenant, token } = useAuth()

  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <h1 className="text-xl font-bold">Task Manager</h1>
      <Select
        value={token}
        onValueChange={(value) => switchTenant(value as string)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {tenants.map((tenant) => (
            <SelectItem key={tenant.id} value={tenant.token}>
              {tenant.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </header>
  )
}
