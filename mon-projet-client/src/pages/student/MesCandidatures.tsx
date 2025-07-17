import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/axios" // Utiliser votre instance axios configurée
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

interface Candidature {
  _id: string
  status: "en attente" | "acceptée" | "rejetée"
  createdAt: string
  message: string
  internship: {
    _id: string
    title: string
    company: string
  }
}

const MesCandidatures = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [candidatures, setCandidatures] = useState<Candidature[]>([])
  const [filtered, setFiltered] = useState<Candidature[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("tous")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError("")
        
        console.log('MesCandidatures - Chargement des candidatures pour user:', user?.id)
        
        const res = await api.get(`/candidatures/etudiant/${user?.id}`)
        
        console.log('MesCandidatures - Réponse API:', res.data)
        console.log('MesCandidatures - Type de données:', typeof res.data)
        console.log('MesCandidatures - Est un tableau:', Array.isArray(res.data))
        
        // Vérifier le format de la réponse
        let candidaturesData = []
        
        if (Array.isArray(res.data)) {
          // Format direct : [...]
          candidaturesData = res.data
        } else if (res.data && Array.isArray(res.data.candidatures)) {
          // Format objet : {candidatures: [...]}
          candidaturesData = res.data.candidatures
        } else if (res.data && Array.isArray(res.data.data)) {
          // Format objet : {data: [...]}
          candidaturesData = res.data.data
        } else {
          console.warn('MesCandidatures - Format de réponse inattendu:', res.data)
          candidaturesData = []
        }
        
        console.log('MesCandidatures - Données finales:', candidaturesData)
        setCandidatures(candidaturesData)
        setFiltered(candidaturesData)
        
      } catch (err: any) {
        console.error('MesCandidatures - Erreur lors du chargement:', err)
        setError("Impossible de charger vos candidatures")
        toast({
          title: "Erreur",
          description: err.response?.data?.message || "Impossible de charger vos candidatures.",
          variant: "destructive",
        })
        // Assurer qu'on a des tableaux vides en cas d'erreur
        setCandidatures([])
        setFiltered([])
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchData()
    } else {
      console.warn('MesCandidatures - Pas d\'ID utilisateur')
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    // Vérifier que candidatures est bien un tableau avant de filtrer
    if (!Array.isArray(candidatures)) {
      console.warn('MesCandidatures - candidatures n\'est pas un tableau:', candidatures)
      setFiltered([])
      return
    }

    if (statusFilter === "tous") {
      setFiltered(candidatures)
    } else {
      setFiltered(candidatures.filter((c) => c.status === statusFilter))
    }
  }, [statusFilter, candidatures])

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette candidature ?")) return

    try {
      await api.delete(`/candidatures/${id}`)
      setCandidatures((prev) => prev.filter((c) => c._id !== id))
      toast({ 
        title: "Succès",
        description: "Candidature supprimée avec succès." 
      })
    } catch (err: any) {
      console.error('Erreur suppression candidature:', err)
      toast({
        title: "Erreur",
        description: err.response?.data?.message || "Impossible de supprimer la candidature.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Mes candidatures</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Chargement de vos candidatures...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Mes candidatures</h1>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mes candidatures</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous</SelectItem>
            <SelectItem value="en attente">En attente</SelectItem>
            <SelectItem value="acceptée">Acceptée</SelectItem>
            <SelectItem value="rejetée">Rejetée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Debug info (à supprimer en production) */}
      <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
        Debug: {filtered.length} candidatures trouvées | Type: {typeof filtered} | Array: {Array.isArray(filtered).toString()}
      </div>

      {/* Vérification explicite avant l'affichage */}
      {!Array.isArray(filtered) ? (
        <div className="text-red-500">
          Erreur: Les données ne sont pas au bon format (attendu: tableau)
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {statusFilter !== "tous" 
              ? `Aucune candidature ${statusFilter} trouvée.`
              : "Vous n'avez encore postulé à aucune offre."
            }
          </p>
          <Button 
            className="mt-4" 
            onClick={() => navigate('/étudiant/offres')}
          >
            Découvrir les offres
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((candidature) => (
            <Card key={candidature._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {candidature.internship?.title || "Titre non disponible"}
                  <Badge
                    variant={
                      candidature.status === "en attente"
                        ? "secondary"
                        : candidature.status === "acceptée"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {candidature.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Entreprise : <span className="font-medium">{candidature.internship?.company || "Non spécifiée"}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium">Message :</span> {candidature.message || "Aucun message"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Postulé le {new Date(candidature.createdAt).toLocaleDateString('fr-FR')}
                </p>

                <div className="flex gap-2 mt-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/étudiant/offres/${candidature.internship?._id}`)}
                    disabled={!candidature.internship?._id}
                  >
                    Voir l'offre
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/étudiant/candidatures/${candidature._id}/modifier`)}
                  >
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(candidature._id)}
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

export default MesCandidatures