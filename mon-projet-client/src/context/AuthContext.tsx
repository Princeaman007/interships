import { createContext, useContext, useEffect, useState } from "react"

export type UserRole = "étudiant" | "admin" | "superAdmin"

interface User {
  id: string
  email: string
  role: UserRole
  firstName?: string
  lastName?: string
}

interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Ajouté

  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          console.log('AuthContext - Utilisateur chargé depuis localStorage:', userData)
          setUser(userData)
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error)
        localStorage.removeItem("user")
      } finally {
        setIsLoading(false) // Marquer comme terminé
      }
    }

    loadUser()
  }, [])

  const login = (userData: User) => {
    console.log('AuthContext - Login avec:', userData)
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}