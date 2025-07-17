// src/layouts/StudentDashboardLayout.tsx
import { Outlet, NavLink, useLocation } from "react-router-dom"
import { LogOut } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

const StudentDashboardLayout = () => {
  const { logout, user } = useAuth()
  const location = useLocation()

  // Debug : voir quand le layout se re-render
  useEffect(() => {
    console.log('StudentDashboardLayout - Route changée:', location.pathname)
  }, [location.pathname])

  console.log('StudentDashboardLayout - Rendu avec location:', location.pathname)

  const handleNavClick = (to: string) => {
    console.log('Navigation vers:', to, 'depuis:', location.pathname)
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold">Espace Étudiant</h2>
          <p className="text-sm text-muted-foreground">Bienvenue {user?.email}</p>
          <p className="text-xs text-gray-500">Route: {location.pathname}</p>
        </div>

        <nav className="space-y-2">
          <NavLink
            to="/étudiant"
            end
            onClick={() => handleNavClick('/étudiant')}
            className={({ isActive }) =>
              `block px-4 py-2 rounded hover:bg-muted ${
                isActive ? "bg-muted font-medium" : ""
              }`
            }
          >
            Accueil
          </NavLink>
          <NavLink
            to="/étudiant/offres"
            onClick={() => handleNavClick('/étudiant/offres')}
            className={({ isActive }) =>
              `block px-4 py-2 rounded hover:bg-muted ${
                isActive ? "bg-muted font-medium" : ""
              }`
            }
          >
            Offres de stage
          </NavLink>
          <NavLink
            to="/étudiant/mes-candidatures"
            onClick={() => handleNavClick('/étudiant/mes-candidatures')}
            className={({ isActive }) =>
              `block px-4 py-2 rounded hover:bg-muted ${
                isActive ? "bg-muted font-medium" : ""
              }`
            }
          >
            Mes candidatures
          </NavLink>
          <NavLink
            to="/étudiant/profile"
            onClick={() => handleNavClick('/étudiant/profile')}
            className={({ isActive }) =>
              `block px-4 py-2 rounded hover:bg-muted ${
                isActive ? "bg-muted font-medium" : ""
              }`
            }
          >
            Mon profil
          </NavLink>
        </nav>

        <Button variant="outline" className="w-full mt-10" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" /> Déconnexion
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-muted/50">
        
        <Outlet />
      </main>
    </div>
  )
}

export default StudentDashboardLayout