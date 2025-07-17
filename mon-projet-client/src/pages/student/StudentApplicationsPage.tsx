// src/pages/etudiant/StudentApplicationsPage.tsx
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import axios from "axios"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"

interface Application {
  _id: string
  message: string
  status: string
  createdAt: string
  internship: {
    _id: string
    title: string
    company: string
  }
}

const StudentApplicationsPage = () => {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [filter, setFilter] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    if (user) fetchApplications()
  }, [user])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/applications/me`, { withCredentials: true })
      setApplications(res.data)
    } catch (err: any) {
      setError("Erreur lors du chargement des candidatures")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Confirmer la suppression de cette candidature ?")) return
    try {
      await axios.delete(`/api/applications/${id}`, { withCredentials: true })
      setApplications(prev => prev.filter(app => app._id !== id))
    } catch {
      alert("Erreur lors de la suppression.")
    }
  }

  const filtered = filter
    ? applications.filter(app => app.status === filter)
    : applications

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Mes candidatures</h2>

      <div className="flex gap-4">
        <Button variant={filter === "" ? "default" : "outline"} onClick={() => setFilter("")}>
          Toutes
        </Button>
        <Button variant={filter === "en_attente" ? "default" : "outline"} onClick={() => setFilter("en_attente")}>
          En attente
        </Button>
        <Button variant={filter === "acceptée" ? "default" : "outline"} onClick={() => setFilter("acceptée")}>
          Acceptées
        </Button>
        <Button variant={filter === "rejetée" ? "default" : "outline"} onClick={() => setFilter("rejetée")}>
          Rejetées
        </Button>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filtered.length === 0 ? (
        <p>Aucune candidature.</p>
      ) : (
        <div className="grid gap-4">
          {filtered.map((app) => (
            <Card key={app._id}>
              <CardHeader>
                <CardTitle>{app.internship.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {app.internship.company} - {new Date(app.createdAt).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">Statut : <strong>{app.status}</strong></p>
                <p className="text-sm text-muted-foreground">{app.message}</p>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/etudiant/offres/${app.internship._id}`)}
                  >
                    Voir l’offre
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(app._id)}
                  >
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default StudentApplicationsPage
