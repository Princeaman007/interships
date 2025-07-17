import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"

const StudentHome = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalInternships: 0,
    totalApplications: 0,
    accepted: 0,
    pending: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/students/dashboard", { withCredentials: true })
        setStats(res.data)
      } catch (err) {
        console.error("Erreur lors de la récupération des statistiques :", err)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bienvenue, {user?.firstName} 👋</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total des stages</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {stats.totalInternships}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mes candidatures</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {stats.totalApplications}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Acceptées</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {stats.accepted}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>En attente</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {stats.pending}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default StudentHome
