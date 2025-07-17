import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/axios"

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await api.post("/auth/login", { email, password })
      console.log('LoginPage - Réponse API:', res.data) // Debug

      const userData = res.data?.user
      console.log('LoginPage - Données utilisateur:', userData) // Debug
      console.log('LoginPage - Token reçu:', res.data?.token || res.data?.accessToken) // Debug token
      
      if (!userData) {
        throw new Error("Utilisateur non trouvé")
      }

      // Ajouter le token aux données utilisateur si présent
      if (res.data?.token || res.data?.accessToken) {
        userData.token = res.data.token || res.data.accessToken
      }

      // Vérifier que le rôle est valide
      if (!userData.role || !["étudiant", "admin", "superAdmin"].includes(userData.role)) {
        throw new Error("Rôle utilisateur invalide")
      }

      // Sauvegarder l'utilisateur dans le contexte
      console.log('LoginPage - Avant login(), userData:', userData)
      login(userData)
      console.log('LoginPage - Après login()')

      // Attendre un petit délai pour que le contexte se mette à jour
      setTimeout(() => {
        // Redirection basée sur le rôle
        console.log('LoginPage - Redirection pour le rôle:', userData.role)
        
        if (userData.role === "superAdmin") {
          console.log('LoginPage - Redirection vers /superadmin')
          navigate("/superadmin", { replace: true })
        } else if (userData.role === "admin") {
          console.log('LoginPage - Redirection vers /admin')
          navigate("/admin", { replace: true })
        } else if (userData.role === "étudiant") {
          console.log('LoginPage - Redirection vers /étudiant')
          navigate("/étudiant", { replace: true })
        } else {
          // Rôle non reconnu, redirection par défaut
          console.warn('LoginPage - Rôle non reconnu:', userData.role)
          navigate("/", { replace: true })
        }
      }, 100) // Petit délai de 100ms pour laisser le temps au contexte

    } catch (err: any) {
      console.error('LoginPage - Erreur de connexion:', err)
      const message =
        err.response?.data?.message || "Une erreur est survenue lors de la connexion."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md bg-white dark:bg-background p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Se connecter</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Connexion..." : "Connexion"}
          </Button>
        </form>

        <p className="text-sm text-center text-muted-foreground mt-4">
          Vous n'avez pas de compte ?{" "}
          <Link to="/register" className="underline text-primary">Inscription</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage