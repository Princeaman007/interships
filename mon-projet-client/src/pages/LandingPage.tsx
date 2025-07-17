import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="w-full border-b p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nexaid Interships</h1>
        <div className="flex gap-4">
          <Link to="/login">
            <Button variant="outline">Se connecter</Button>
          </Link>
          <Link to="/register">
            <Button>Créer un compte</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 max-w-3xl leading-tight">
          Trouvez un stage international facilement avec <span className="text-primary">Nexaid Interships</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mb-8">
          Notre plateforme vous aide à postuler à des stages à l'étranger, avec un accompagnement complet (logement, transport, support...).
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/register">
            <Button size="lg">Commencer</Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline">J'ai déjà un compte</Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t text-sm text-center p-4 text-muted-foreground">
        © {new Date().getFullYear()} Nexaid. Tous droits réservés.
      </footer>
    </div>
  )
}

export default LandingPage
