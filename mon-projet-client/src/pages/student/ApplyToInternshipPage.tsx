import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, FileText, Send } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import api from "@/lib/axios"

interface InternshipInfo {
  _id: string
  title: string
  company: string
  location: string
}

const ApplyToInternshipPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [internshipInfo, setInternshipInfo] = useState<InternshipInfo | null>(null)
  const [message, setMessage] = useState("")
  const [cv, setCv] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingInfo, setLoadingInfo] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    // Vérifier que l'utilisateur est connecté et est étudiant
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour postuler.",
        variant: "destructive",
      })
      navigate('/login')
      return
    }

    if (user.role !== "étudiant") {
      toast({
        title: "Accès refusé",
        description: "Seuls les étudiants peuvent postuler aux offres.",
        variant: "destructive",
      })
      navigate('/étudiant/offres')
      return
    }

    // Charger les informations de base de l'offre
    fetchInternshipInfo()
  }, [id, user, navigate])

  const fetchInternshipInfo = async () => {
    try {
      setLoadingInfo(true)
      console.log('ApplyPage - Chargement des infos pour l\'offre:', id)
      
      const res = await api.get(`/internships/${id}`)
      console.log('ApplyPage - Infos offre reçues:', res.data)
      
      setInternshipInfo({
        _id: res.data._id,
        title: res.data.title,
        company: res.data.company,
        location: res.data.location,
      })
    } catch (err: any) {
      console.error('ApplyPage - Erreur chargement infos:', err)
      setError("Impossible de charger les informations de l'offre.")
      
      toast({
        title: "Erreur",
        description: "Impossible de charger l'offre. Elle n'existe peut-être plus.",
        variant: "destructive",
      })
    } finally {
      setLoadingInfo(false)
    }
  }

  const validateForm = () => {
    if (!message.trim()) {
      setError("Le message de motivation est requis.")
      return false
    }

    if (message.trim().length < 50) {
      setError("Le message de motivation doit contenir au moins 50 caractères.")
      return false
    }

    if (!cv) {
      setError("Veuillez télécharger votre CV.")
      return false
    }

    if (cv.type !== "application/pdf") {
      setError("Le CV doit être un fichier PDF.")
      return false
    }

    if (cv.size > 5 * 1024 * 1024) { // 5MB
      setError("Le fichier PDF ne doit pas dépasser 5 MB.")
      return false
    }

    return true
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setCv(file)
    
    if (file) {
      console.log('ApplyPage - Fichier sélectionné:', {
        name: file.name,
        size: file.size,
        type: file.type
      })
    }
    
    // Réinitialiser les messages d'erreur
    if (error) setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!validateForm()) {
      return
    }

    const formData = new FormData()
    formData.append("internshipId", id || "")
    formData.append("message", message.trim())
    formData.append("cv", cv!)

    console.log('ApplyPage - Envoi candidature:', {
      internshipId: id,
      messageLength: message.trim().length,
      cvName: cv?.name,
      cvSize: cv?.size
    })

    try {
      setLoading(true)
      
      const res = await api.post("/candidatures", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      console.log('ApplyPage - Candidature envoyée avec succès:', res.data)
      
      setSuccess("Candidature envoyée avec succès !")
      
      toast({
        title: "Candidature envoyée !",
        description: "Votre candidature a été transmise avec succès. Vous recevrez une réponse prochainement.",
      })

      // Réinitialiser le formulaire
      setMessage("")
      setCv(null)
      
      // Rediriger vers les candidatures après un délai
      setTimeout(() => {
        navigate('/étudiant/mes-candidatures')
      }, 2000)

    } catch (err: any) {
      console.error('ApplyPage - Erreur envoi candidature:', err)
      
      const errorMessage = err.response?.data?.message || "Une erreur est survenue lors de l'envoi."
      setError(errorMessage)
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoBack = () => {
    navigate(`/étudiant/offres/${id}`)
  }

  if (loadingInfo) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Chargement...</span>
        </div>
      </div>
    )
  }

  if (!internshipInfo) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">Impossible de charger les informations de l'offre.</p>
          <Button onClick={() => navigate('/étudiant/offres')}>
            Retour aux offres
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Bouton retour */}
      <Button variant="outline" onClick={handleGoBack}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour à l'offre
      </Button>

      {/* Informations de l'offre */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Postuler à cette offre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg">{internshipInfo.title}</h3>
            <p className="text-muted-foreground">
              {internshipInfo.company} • {internshipInfo.location}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire de candidature */}
      <Card>
        <CardHeader>
          <CardTitle>Votre candidature</CardTitle>
          <p className="text-sm text-muted-foreground">
            Complétez les informations ci-dessous pour envoyer votre candidature.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Message de motivation */}
            <div className="space-y-2">
              <Label htmlFor="message">Message de motivation *</Label>
              <Textarea
                id="message"
                placeholder="Expliquez pourquoi vous êtes intéressé(e) par ce stage, vos motivations et ce que vous pouvez apporter à l'entreprise..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  if (error) setError("")
                }}
                className="min-h-[120px]"
                required
              />
              <p className="text-xs text-muted-foreground">
                Minimum 50 caractères ({message.length}/50)
              </p>
            </div>

            {/* CV Upload */}
            <div className="space-y-2">
              <Label htmlFor="cv">Votre CV (PDF uniquement) *</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <Input
                  id="cv"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                <Label 
                  htmlFor="cv" 
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Choisir un fichier PDF
                </Label>
                {cv && (
                  <div className="mt-3 p-2 bg-muted rounded text-sm">
                    <strong>Fichier sélectionné:</strong> {cv.name}
                    <br />
                    <span className="text-muted-foreground">
                      Taille: {(cv.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Format PDF uniquement, maximum 5 MB
                </p>
              </div>
            </div>

            {/* Messages d'état */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            {/* Debug info (à supprimer en production) */}
            <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
              Debug: User: {user?.email} | Offre: {id} | CV: {cv?.name || 'Aucun'}
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={loading || !message.trim() || !cv} 
                className="flex-1"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer ma candidature
                  </>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGoBack}
                disabled={loading}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ApplyToInternshipPage