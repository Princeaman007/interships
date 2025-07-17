import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import axios from "axios"

const SuperAdminHome = () => {
  const [stats, setStats] = useState({
    admins: 0,
    users: 0,
    offers: 0,
    applications: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/superadmin/stats", { withCredentials: true })
        setStats(res.data)
      } catch (err) {
        console.error("Erreur lors du chargement des statistiques superAdmin", err)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Super Admin</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.admins}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.users}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Offres</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.offers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Candidatures</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.applications}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SuperAdminHome
