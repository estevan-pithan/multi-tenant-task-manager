import { api } from "@/config/api"
import {
  createContext,
  useContext,
  useEffect,
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
  login: (token: string) => void
  logout: () => void
  token: string | null
  isAuthenticated: boolean
  isInitialized: boolean
}

interface AuthProviderProps {
  children: ReactNode
}

const AuthContext = createContext<AuthContextValues>({
  login: () => {},
  logout: () => {},
  token: null,
  isAuthenticated: false,
  isInitialized: false,
})

export function useAuth() {
  const authContext = useContext(AuthContext)
  if (!authContext)
    throw new Error("useAuth must be used within an AuthProvider")
  return authContext
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  function persistToken(newToken: string | null) {
    setToken(newToken)
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }

  function login(newToken: string) {
    persistToken(newToken)
  }

  function logout() {
    persistToken(null)
  }

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (storedToken) {
      setToken(storedToken)
    }
    setIsInitialized(true)
  }, [])

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

  useLayoutEffect(() => {
    const refreshInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          persistToken(null)
        }
        return Promise.reject(error)
      },
    )
    return () => {
      api.interceptors.response.eject(refreshInterceptor)
    }
  }, [])

  if (!isInitialized) {
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        token,
        isAuthenticated: !!token,
        isInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
