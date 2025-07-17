import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, Building2, ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Offre {
  _id: string
  title: string
  company: string
  location: string
  country: string
  domain: string
  description: string
  requirements: string
  startDate: string
  endDate: string
  salary?: string
  type?: string
}

const OffreDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [offre, setOffre] = useState<Offre | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [hasApplied, setHasApplied] = useState(false)
  const [checkingApplication, setCheckingApplication] = useState(false)

  useEffect(() => {
    const fetchOffre = async () => {
      try {
        setLoading(true)
        console.log('OffreDetail - Chargement de l\'offre ID:', id)
        
        const res = await api.get(`/internships/${id}`)
        console.log('OffreDetail - Offre reçue:', res.data)
        
        setOffre(res.data)
        
        // Vérifier si l'utilisateur a déjà postulé
        if (user?.id) {
          await checkIfAlreadyApplied()
        }
        
      } catch (err: any) {
        console.error('OffreDetail - Erreur:', err)
        setError(
          err.response?.status === 404 
            ? "Cette offre n'existe pas ou a été supprimée."
            : "Impossible de charger l'offre."
        )
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchOffre()
    }
  }, [id, user?.id])

  const checkIfAlreadyApplied = async () => {
    try {
      setCheckingApplication(true)
      console.log('OffreDetail - Vérification candidature existante pour user:', user?.id, 'offre:', id)
      
      // Vérifier si l'utilisateur a déjà postulé à cette offre
      const res = await api.get(`/candidatures/etudiant/${user?.id}`)
      
      const applications = Array.isArray(res.data) ? res.data : res.data?.candidatures || []
      const alreadyApplied = applications.some((app: any) => app.internship?._id === id)
      
      console.log('OffreDetail - Déjà postulé:', alreadyApplied)
      setHasApplied(alreadyApplied)
      
    } catch (err) {
      console.error('OffreDetail - Erreur vérification candidature:', err)
      // En cas d'erreur, on assume qu'il n'a pas postulé
      setHasApplied(false)
    } finally {
      setCheckingApplication(false)
    }
  }

  const handleApply = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour postuler à une offre.",
        variant: "destructive",
      })
      navigate('/login')
      return
    }

    if (user.role !== "étudiant") {
      toast({
        title: "Accès refusé",
        description: "Seuls les étudiants peuvent postuler aux offres de stage.",
        variant: "destructive",
      })
      return
    }

    if (hasApplied) {
      toast({
        title: "Déjà postulé",
        description: "Vous avez déjà postulé à cette offre. Consultez vos candidatures pour plus d'informations.",
        variant: "destructive",
      })
      navigate('/étudiant/mes-candidatures')
      return
    }

    // Rediriger vers la page de candidature
    navigate(`/étudiant/offres/${id}/postuler`)
  }

  const handleGoBack = () => {
    navigate('/étudiant/offres')
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Chargement de l'offre...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={handleGoBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux offres
          </Button>
        </div>
      </div>
    )
  }

  if (!offre) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Offre non trouvée.</p>
          <Button onClick={handleGoBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux offres
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Bouton retour */}
      <Button variant="outline" onClick={handleGoBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour aux offres
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold">{offre.title}</CardTitle>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  <span>{offre.company}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{offre.location}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {offre.domain && (
                <Badge variant="secondary">{offre.domain}</Badge>
              )}
              {offre.country && (
                <Badge variant="outline">{offre.country}</Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Période */}
          <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-semibold">Période du stage</h3>
              <p className="text-sm text-muted-foreground">
                Du {new Date(offre.startDate).toLocaleDateString('fr-FR')} au{" "}
                {new Date(offre.endDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Description du poste</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {offre.description}
            </p>
          </div>

          {/* Exigences */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Exigences et compétences</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {offre.requirements}
            </p>
          </div>

          {/* Informations supplémentaires */}
          {(offre.salary || offre.type) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              {offre.type && (
                <div>
                  <h4 className="font-medium">Type de stage</h4>
                  <p className="text-sm text-muted-foreground">{offre.type}</p>
                </div>
              )}
              {offre.salary && (
                <div>
                  <h4 className="font-medium">Rémunération</h4>
                  <p className="text-sm text-muted-foreground">{offre.salary}</p>
                </div>
              )}
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-6 border-t">
            {checkingApplication ? (
              <Button disabled className="flex-1">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Vérification...
              </Button>
            ) : hasApplied ? (
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" disabled>
                  ✅ Déjà postulé
                </Button>
                <Button 
                  onClick={() => navigate('/étudiant/mes-candidatures')}
                  variant="secondary"
                >
                  Voir mes candidatures
                </Button>
              </div>
            ) : (
              <Button onClick={handleApply} className="flex-1" size="lg">
                📝 Postuler à cette offre
              </Button>
            )}
          </div>

          {/* Debug info (à supprimer en production) */}
          <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
            Debug: Offre ID: {id} | User: {user?.role} | Applied: {hasApplied.toString()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OffreDetailPage