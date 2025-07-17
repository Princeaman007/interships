// src/pages/student/MonProfil.tsx
import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/axios"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { Upload, X, Camera } from "lucide-react"

interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
  role: string
  profile?: {
    avatarUrl?: string
    country?: string
    phone?: string
  }
}

const MonProfil = () => {
  const { user, login } = useAuth()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    country: "",
    phone: "",
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    console.log('MonProfil - Utilisateur chargé:', user)
    
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        password: "",
        country: user.profile?.country || "",
        phone: user.profile?.phone || "",
      })
      
      // Charger l'avatar existant (support des deux formats)
      const existingAvatar = user.avatar || user.profile?.avatarUrl
      if (existingAvatar) {
        // Construire l'URL complète si nécessaire
        const avatarUrl = existingAvatar.startsWith('http') 
          ? existingAvatar 
          : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${existingAvatar}`
        setAvatarPreview(avatarUrl)
      }
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    
    // Réinitialiser les messages quand l'utilisateur tape
    if (message || error) {
      setMessage("")
      setError("")
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    if (!file) return

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError("Veuillez sélectionner une image valide (JPG, PNG, GIF, WebP)")
      return
    }

    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5 MB")
      return
    }

    console.log('MonProfil - Image sélectionnée:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    setAvatarFile(file)
    
    // Créer un aperçu
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Réinitialiser les messages d'erreur
    if (error) setError("")
  }

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview("")
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError("Le prénom est requis.")
      return false
    }
    
    if (!formData.lastName.trim()) {
      setError("Le nom est requis.")
      return false
    }
    
    if (!formData.email.trim()) {
      setError("L'email est requis.")
      return false
    }
    
    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Veuillez entrer un email valide.")
      return false
    }
    
    if (formData.password && formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.")
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    // 🧪 DIAGNOSTIC - État avant la requête
    const tokenBefore = localStorage.getItem('token')
    const userBefore = user
    console.log('🧪 AVANT - Token:', tokenBefore ? 'PRÉSENT' : 'ABSENT')
    console.log('🧪 AVANT - User:', userBefore?.email)
    
    setLoading(true)
    setError("")
    setMessage("")

    try {
      console.log('MonProfil - Mise à jour du profil')
      
      // Préparer FormData pour l'upload avec avatar
      const updateFormData = new FormData()
      
      // Ajouter les données du formulaire
      updateFormData.append('firstName', formData.firstName.trim())
      updateFormData.append('lastName', formData.lastName.trim())
      updateFormData.append('email', formData.email.trim())
      
      if (formData.country) {
        updateFormData.append('country', formData.country.trim())
      }
      
      if (formData.phone) {
        updateFormData.append('phone', formData.phone.trim())
      }
      
      // Ajouter le mot de passe seulement s'il est fourni
      if (formData.password) {
        updateFormData.append('password', formData.password)
      }
      
      // Ajouter le fichier avatar s'il y en a un
      if (avatarFile) {
        updateFormData.append('avatar', avatarFile)
        console.log('MonProfil - Avatar ajouté au FormData')
      }
      
      console.log('MonProfil - Envoi des données...')
      
      // 🔧 FIX: S'assurer que le token est bien envoyé
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token d\'authentification manquant')
      }
      
      // Envoyer la requête avec FormData
      const res = await api.put('/users/me', updateFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` // 🔧 Forcer l'ajout du token
        },
      })
      
      console.log('MonProfil - Réponse API complète:', res.data)
      
      // 🧪 DIAGNOSTIC - État après la requête
      const tokenAfter = localStorage.getItem('token')
      const userAfter = user
      console.log('🧪 APRÈS - Token:', tokenAfter ? 'PRÉSENT' : 'ABSENT')
      console.log('🧪 APRÈS - User:', userAfter?.email)
      
      if (!tokenAfter) {
        console.error('❌ TOKEN PERDU PENDANT LA REQUÊTE !')
        // Rediriger vers login
        toast({
          title: "Session expirée",
          description: "Veuillez vous reconnecter",
          variant: "destructive",
        })
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
        return
      }
      
      // 🔧 FIX: Vérifier le format de la réponse et extraire les bonnes données
      let updatedUser = null
      
      if (res.data && res.data.success && res.data.data) {
        // Nouveau format avec success et data
        updatedUser = res.data.data
        console.log('✅ Format nouveau détecté:', updatedUser)
      } else if (res.data && res.data.id) {
        // Ancien format direct
        updatedUser = res.data
        console.log('✅ Format ancien détecté:', updatedUser)
      } else {
        console.error('❌ Format de réponse non reconnu:', res.data)
        throw new Error("Format de réponse inattendu")
      }
      
      if (updatedUser) {
        console.log('👤 Données utilisateur à mettre à jour:', updatedUser)
        
        // 🔧 FIX: Construire l'URL complète de l'avatar pour l'affichage
        if (updatedUser.avatar && !updatedUser.avatar.startsWith('http')) {
          updatedUser.avatar = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${updatedUser.avatar}`
        }
        
        console.log('👤 Utilisateur final avec avatar complet:', updatedUser)
        
        // Mettre à jour le contexte utilisateur
        login(updatedUser)
        
        setMessage("Profil mis à jour avec succès !")
        
        // Réinitialiser le formulaire
        setFormData(prev => ({ ...prev, password: "" }))
        setAvatarFile(null) // Réinitialiser le fichier avatar
        
        toast({
          title: "Succès",
          description: "Votre profil a été mis à jour avec succès !",
        })
      } else {
        throw new Error("Aucune donnée utilisateur dans la réponse")
      }
      
    } catch (err: any) {
      console.error('❌ MonProfil - Erreur lors de la mise à jour:', err)
      
      // 🔧 FIX: Gestion spécifique des erreurs d'authentification
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.error('🔐 Erreur d\'authentification détectée')
        
        // Supprimer le token invalide
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        toast({
          title: "Session expirée",
          description: "Veuillez vous reconnecter",
          variant: "destructive",
        })
        
        // Redirection après un délai
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
        
        return
      }
      
      const errorMessage = err.response?.data?.message || err.message || "Une erreur est survenue lors de la mise à jour."
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

  // Fonction pour supprimer l'avatar
  const handleDeleteAvatar = async () => {
    try {
      setLoading(true)
      
      const res = await api.delete('/users/avatar')
      console.log('🗑️ Avatar supprimé:', res.data)
      
      // Mettre à jour l'état local
      setAvatarPreview("")
      setAvatarFile(null)
      
      // Mettre à jour le contexte utilisateur
      if (user) {
        const updatedUser = { ...user, avatar: null }
        if (updatedUser.profile) {
          updatedUser.profile.avatarUrl = null
        }
        login(updatedUser)
      }
      
      toast({
        title: "Succès",
        description: "Avatar supprimé avec succès !",
      })
      
    } catch (err: any) {
      console.error('❌ Erreur suppression avatar:', err)
      
      // Gérer les erreurs d'authentification
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return
      }
      
      const errorMessage = err.response?.data?.message || "Erreur lors de la suppression de l'avatar"
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

  // Fonction pour obtenir les initiales
  const getInitials = () => {
    const firstInitial = formData.firstName?.charAt(0)?.toUpperCase() || ""
    const lastInitial = formData.lastName?.charAt(0)?.toUpperCase() || ""
    return firstInitial + lastInitial || "?"
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Mon profil</CardTitle>
          <p className="text-sm text-muted-foreground">
            Gérez vos informations personnelles
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Section Avatar avec upload */}
            <div className="flex items-start gap-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={avatarPreview || undefined}
                    alt="Photo de profil"
                  />
                  <AvatarFallback className="text-lg">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                
                {avatarPreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={avatarFile ? removeAvatar : handleDeleteAvatar}
                    className="text-red-600 hover:text-red-700"
                    disabled={loading}
                  >
                    <X className="w-4 h-4 mr-1" />
                    {avatarFile ? "Annuler" : "Supprimer"}
                  </Button>
                )}
              </div>
              
              <div className="flex-1 space-y-3">
                <Label htmlFor="avatar">Photo de profil</Label>
                
                {/* Zone de upload */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                  <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={loading}
                  />
                  <Label 
                    htmlFor="avatar" 
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    Choisir une image
                  </Label>
                  
                  {avatarFile && (
                    <div className="mt-3 p-2 bg-muted rounded text-sm">
                      <strong>Fichier sélectionné:</strong> {avatarFile.name}
                      <br />
                      <span className="text-muted-foreground">
                        Taille: {(avatarFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG, GIF ou WebP - Maximum 5 MB
                  </p>
                </div>
              </div>
            </div>

            {/* Informations personnelles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Adresse email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                className="mt-1"
              />
            </div>

            {/* Informations supplémentaires */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Section mot de passe */}
            <div>
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Laisser vide pour ne pas changer"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum 6 caractères. Laissez vide pour conserver votre mot de passe actuel.
              </p>
            </div>

            {/* Messages */}
            {message && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">{message}</p>
              </div>
            )}
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Debug info (à supprimer en production) */}
            <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
              Debug: User ID: {user?.id} | Role: {user?.role} | Avatar File: {avatarFile?.name || 'Aucun'}
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={loading} 
                className="flex-1"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Mise à jour...
                  </>
                ) : (
                  "Mettre à jour le profil"
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Réinitialiser le formulaire
                  if (user) {
                    setFormData({
                      firstName: user.firstName || "",
                      lastName: user.lastName || "",
                      email: user.email || "",
                      password: "",
                      country: user.profile?.country || "",
                      phone: user.profile?.phone || "",
                    })
                    setAvatarFile(null)
                    const existingAvatar = user.avatar || user.profile?.avatarUrl
                    if (existingAvatar) {
                      const avatarUrl = existingAvatar.startsWith('http') 
                        ? existingAvatar 
                        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${existingAvatar}`
                      setAvatarPreview(avatarUrl)
                    } else {
                      setAvatarPreview("")
                    }
                    setMessage("")
                    setError("")
                  }
                }}
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

export default MonProfil