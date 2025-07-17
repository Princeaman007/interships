// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: string[]
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth()

  console.log('ProtectedRoute - isLoading:', isLoading)
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated)
  console.log('ProtectedRoute - user:', user)

  // Pendant le chargement, on attend
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Si pas authentifié, redirection
  if (!isAuthenticated || !user) {
    console.log('ProtectedRoute - Redirection vers login : pas authentifié')
    return <Navigate to="/login" replace />
  }

  // Si le rôle ne correspond pas
  if (!allowedRoles.includes(user.role)) {
    console.log('ProtectedRoute - Redirection vers login : rôle non autorisé')
    return <Navigate to="/login" replace />
  }

  // Tout va bien, on affiche le contenu
  return <>{children}</>
}

export default ProtectedRoute