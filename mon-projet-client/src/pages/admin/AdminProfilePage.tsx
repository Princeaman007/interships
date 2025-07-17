import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import axios from "axios"

const AdminProfilePage = () => {
  const { user, logout } = useAuth()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  })
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email,
        password: "",
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess("")
    setError("")

    try {
      await axios.put(`/api/users/${user?.id}`, formData, { withCredentials: true })
      setSuccess("Profil mis à jour avec succès.")
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour.")
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Mon Profil (Admin)</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Laisser vide pour ne pas changer"
                minLength={6}
              />
            </div>
            <Button type="submit">Mettre à jour</Button>
            {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminProfilePage
