// src/pages/etudiant/EditApplicationPage.tsx
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import axios from "axios"

const EditApplicationPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [message, setMessage] = useState("")
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await axios.get(`/api/applications/${id}`, {
          withCredentials: true,
        })
        setMessage(res.data.message || "")
      } catch (err) {
        setError("Erreur lors du chargement de la candidature.")
      }
    }

    fetchApplication()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const formData = new FormData()
      formData.append("message", message)
      if (cvFile) formData.append("cv", cvFile)

      await axios.put(`/api/applications/${id}`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setSuccess("Candidature mise à jour avec succès.")
      setTimeout(() => navigate("/etudiant/mes-candidatures"), 1500)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || "Erreur lors de la mise à jour.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-6">Modifier ma candidature</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="cv">Remplacer le CV (PDF)</Label>
          <Input
            id="cv"
            type="file"
            accept="application/pdf"
            onChange={(e) => setCvFile(e.target.files?.[0] || null)}
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? "Mise à jour..." : "Mettre à jour"}
        </Button>
      </form>
    </div>
  )
}

export default EditApplicationPage
