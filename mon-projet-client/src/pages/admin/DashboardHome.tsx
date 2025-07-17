import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import axios from "axios"

const AdminHome = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOffers: 0,
    totalApplications: 0,
    messages: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/admin/stats", { withCredentials: true })
        setStats(res.data)
      } catch (err) {
        console.error("Erreur lors du chargement des statistiques admin", err)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Admin</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.totalUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Offres publiées</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.totalOffers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Candidatures</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.totalApplications}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Messages reçus</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.messages}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminHome
