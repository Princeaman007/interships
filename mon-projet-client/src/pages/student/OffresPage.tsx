import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"
import api from "@/lib/axios" 

interface Internship {
  _id: string
  title: string
  company: string
  country: string
  domain: string
  description: string
}

const OffresPage = () => {
  const [internships, setInternships] = useState<Internship[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setLoading(true)
        setError("")
        
        console.log('OffresPage - Chargement des offres avec search:', search)
        
        const res = await api.get("/internships", {
          params: { search },
        })
        
        console.log('OffresPage - Réponse API:', res.data)
        console.log('OffresPage - Type de données:', typeof res.data)
        console.log('OffresPage - Est un tableau:', Array.isArray(res.data))
        
        // Vérifier le format de la réponse
        let internshipsData = []
        
        if (Array.isArray(res.data)) {
          // Format direct : [...]
          internshipsData = res.data
        } else if (res.data && Array.isArray(res.data.internships)) {
          // Format objet : {internships: [...]}
          internshipsData = res.data.internships
        } else if (res.data && Array.isArray(res.data.data)) {
          // Format objet : {data: [...]}
          internshipsData = res.data.data
        } else {
          console.warn('OffresPage - Format de réponse inattendu:', res.data)
          internshipsData = []
        }
        
        console.log('OffresPage - Données finales:', internshipsData)
        setInternships(internshipsData)
        
      } catch (err: any) {
        console.error("OffresPage - Erreur lors du chargement des offres:", err)
        
        // Debug : afficher plus de détails sur l'erreur
        console.error("Status:", err.response?.status)
        console.error("Message:", err.response?.data?.message)
        console.error("URL:", err.config?.url)
        
        setError(
          err.response?.status === 401 
            ? "Vous devez être connecté pour voir les offres"
            : err.response?.data?.message || "Erreur lors du chargement des offres"
        )
        setInternships([]) // Assurer qu'on a un tableau vide en cas d'erreur
      } finally {
        setLoading(false)
      }
    }

    // Debounce pour éviter trop de requêtes lors de la recherche
    const timeoutId = setTimeout(() => {
      fetchInternships()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search])

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Chargement des offres...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Offres de stage</h1>
        <Input
          placeholder="Rechercher une offre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Debug info (à supprimer en production) */}
      

      {/* Vérification explicite avant le map */}
      {!Array.isArray(internships) ? (
        <div className="text-red-500">
          Erreur: Les données ne sont pas au bon format (attendu: tableau)
        </div>
      ) : internships.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {search ? "Aucune offre trouvée pour votre recherche." : "Aucune offre disponible."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship) => (
            <Card key={internship._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{internship.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Entreprise:</strong> {internship.company}</p>
                <p><strong>Pays:</strong> {internship.country}</p>
                <p><strong>Domaine:</strong> {internship.domain}</p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {internship.description}
                </p>
                <Link to={`/étudiant/offres/${internship._id}`}>
                  <Button size="sm" className="mt-2 w-full">
                    Voir l'offre
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default OffresPage