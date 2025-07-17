// src/components/layout/Sidebar.tsx
import { Home, FileText, User, Settings } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

const Sidebar = () => {
  const location = useLocation()

  const links = [
    { label: "Accueil", to: "/etudiant", icon: <Home size={18} /> },
    { label: "Offres de stage", to: "/etudiant/offres", icon: <FileText size={18} /> },
    { label: "Mes candidatures", to: "/etudiant/mes-candidatures", icon: <FileText size={18} /> },
    { label: "Mon profil", to: "/etudiant/mon-profil", icon: <User size={18} /> },
    { label: "Paramètres", to: "/etudiant/settings", icon: <Settings size={18} /> }, // optionnel
  ]

  return (
    <aside className="w-64 h-full bg-background border-r p-4 hidden md:block">
      <div className="text-2xl font-bold mb-8 px-3">
        <Link to="/etudiant">Nexaid Interships</Link>
      </div>

      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const isActive = location.pathname === link.to

          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
                isActive
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
