import { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import api from "@/lib/axios"
import { Button } from "@/components/ui/button"

const EmailVerificationPage = () => {
  const [params] = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verifyEmail = async () => {
      const token = params.get("token")
      if (!token) {
        setStatus("error")
        setMessage("Lien de vérification invalide.")
        return
      }

      try {
        const res = await api.get(`/auth/verify-email?token=${token}`)
        setStatus("success")
        setMessage(res.data.message || "Votre compte a été vérifié avec succès.")
      } catch (err: any) {
        setStatus("error")
        setMessage(err.response?.data?.message || "La vérification a échoué.")
      }
    }

    verifyEmail()
  }, [params])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted">
      <div className="max-w-md w-full p-8 bg-white dark:bg-background rounded-2xl shadow-xl text-center">
        {status === "loading" && (
          <p className="text-sm text-muted-foreground">Vérification en cours...</p>
        )}

        {status === "success" && (
          <>
            <h2 className="text-2xl font-bold mb-4">✅ Email vérifié</h2>
            <p className="mb-6 text-muted-foreground">{message}</p>
            <Link to="/login">
              <Button>Se connecter</Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-destructive">❌ Erreur</h2>
            <p className="mb-6 text-muted-foreground">{message}</p>
            <Link to="/">
              <Button variant="outline">Retour à l’accueil</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default EmailVerificationPage
