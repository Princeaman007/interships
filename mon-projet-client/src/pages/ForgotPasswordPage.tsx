import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import axios from "axios"

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setError("")

    try {
      await axios.post("/api/auth/forgot-password", { email })
      setMessage("Un lien de réinitialisation a été envoyé à votre adresse email.")
    } catch (err: any) {
      setError(err.response?.data?.message || "Une erreur est survenue.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Mot de passe oublié</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">Envoyer</Button>
          </form>
          {message && <p className="mt-4 text-green-600 text-sm text-center">{message}</p>}
          {error && <p className="mt-4 text-red-600 text-sm text-center">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}

export default ForgotPasswordPage
