import { api } from "@/config/api"
import { tenants } from "@/config/tenants"
import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react"

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}

const TOKEN_KEY = "auth_token"

interface AuthContextValues {
  switchTenant: (token: string) => void
  token: string
  currentTenantId: string
}

const AuthContext = createContext<AuthContextValues>({
  switchTenant: () => {},
  token: tenants[0].token,
  currentTenantId: tenants[0].id,
})

export function useAuth(): AuthContextValues {
  const authContext = useContext(AuthContext)
  if (!authContext)
    throw new Error("useAuth must be used within an AuthProvider")
  return authContext
}

function getInitialToken(): string {
  const stored = localStorage.getItem(TOKEN_KEY)
  if (stored) return stored
  localStorage.setItem(TOKEN_KEY, tenants[0].token)
  return tenants[0].token
}

function resolveTenantId(token: string): string {
  return tenants.find((t) => t.token === token)?.id ?? tenants[0].id
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(getInitialToken)

  function switchTenant(newToken: string) {
    setToken(newToken)
    localStorage.setItem(TOKEN_KEY, newToken)
  }

  useLayoutEffect(() => {
    const authInterceptor = api.interceptors.request.use((config) => {
      if (!config._retry && token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
    return () => {
      api.interceptors.request.eject(authInterceptor)
    }
  }, [token])

  return (
    <AuthContext.Provider
      value={{
        switchTenant,
        token,
        currentTenantId: resolveTenantId(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
