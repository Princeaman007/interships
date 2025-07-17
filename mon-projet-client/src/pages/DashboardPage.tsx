import { Card, CardContent } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Bienvenue sur le tableau de bord</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Utilisateurs</p>
            <p className="text-2xl font-bold">123</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Stages</p>
            <p className="text-2xl font-bold">45</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Candidatures</p>
            <p className="text-2xl font-bold">78</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Témoignages</p>
            <p className="text-2xl font-bold">16</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
