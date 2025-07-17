// src/components/layout/Navbar.tsx
import { useAuth } from "@/context/AuthContext"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const goToProfile = () => {
    switch (user?.role) {
      case "etudiant":
        navigate("/etudiant/mon-profil")
        break
      case "admin":
        navigate("/admin/mon-profil")
        break
      case "superAdmin":
        navigate("/superadmin/mon-profil")
        break
      default:
        break
    }
  }

  return (
    <header className="w-full h-16 border-b bg-background flex items-center justify-between px-6">
      <div className="text-xl font-semibold">Dashboard</div>

      <div className="flex items-center gap-4">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarFallback>
                  {user.firstName?.[0]?.toUpperCase() ?? "U"}
                  {user.lastName?.[0]?.toUpperCase() ?? ""}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium leading-none">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
              <DropdownMenuItem onClick={goToProfile} className="cursor-pointer">
                Mon profil
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive"
              >
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" onClick={() => navigate("/login")}>
            Connexion
          </Button>
        )}
      </div>
    </header>
  )
}

export default Navbar
