"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, Trophy, TrendingUp, Calendar, CheckCircle, Clock } from "lucide-react"

interface AdminDashboardProps {
  userData: any
}

export function AdminDashboard({ userData }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRegistrations: 0,
    pendingApprovals: 0,
    activeCompetitions: 8,
    recentActivity: [],
  })
  const [currentBatch, setCurrentBatch] = useState<any>(null)
  const [registrationClosed, setRegistrationClosed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      console.log("🔄 Fetching dashboard data...")

      // Fetch real stats
      const [participantsRes, usersRes, batchesRes] = await Promise.all([
        fetch("/api/admin/participants"),
        fetch("/api/admin/users"),
        fetch("/api/batches/current"), // Just get current batch info for display
      ])

      let totalUsers = 0
      let totalRegistrations = 0
      let pendingApprovals = 0

      if (participantsRes.ok) {
        const { participants } = await participantsRes.json()
        totalRegistrations = participants.length
        pendingApprovals = participants.filter((p: any) => p.status === "pending").length
        console.log("📊 Participants data:", { totalRegistrations, pendingApprovals })
      } else {
        console.error("❌ Failed to fetch participants:", participantsRes.status)
      }

      if (usersRes.ok) {
        const { users } = await usersRes.json()
        totalUsers = users.length
        console.log("👥 Users data:", { totalUsers })
      } else {
        console.error("❌ Failed to fetch users:", usersRes.status)
      }

      if (batchesRes.ok) {
        const { batch, registrationClosed } = await batchesRes.json()
        setCurrentBatch(batch)
        setRegistrationClosed(registrationClosed)
        console.log("📅 Current batch data:", { batch, registrationClosed })
      } else {
        console.error("❌ Failed to fetch current batch:", batchesRes.status)
      }

      setStats({
        totalUsers,
        totalRegistrations,
        pendingApprovals,
        activeCompetitions: 8,
        recentActivity: [],
      })

      console.log("✅ Dashboard data loaded successfully")
    } catch (error) {
      console.error("💥 Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-800 rounded-lg p-6">
              <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-slate-700 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Shield className="w-8 h-8 text-purple-400" />
          Admin Dashboard
        </h1>
        <p className="text-slate-400">
          Selamat datang, {userData?.full_name || userData?.fullName}. Kelola sistem PRF XIII dari sini.
        </p>
      </div>

      {/* Current Batch Info */}
      {currentBatch && (
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Batch Saat Ini:
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg">{currentBatch.name}</h3>
                <p className="text-slate-400">
                  {formatDateTime(currentBatch.start_date)} - {formatDateTime(currentBatch.end_date)}
                </p>
              </div>
              <div className="flex gap-2">
                {registrationClosed ? (
                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Pendaftaran Ditutup</Badge>
                ) : (
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Pendaftaran Dibuka</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Total Pengguna</p>
                <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Total Pendaftaran</p>
                <p className="text-3xl font-bold text-white">{stats.totalRegistrations}</p>
              </div>
              <Trophy className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm font-medium">Menunggu Persetujuan</p>
                <p className="text-3xl font-bold text-white">{stats.pendingApprovals}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Kompetisi Aktif</p>
                <p className="text-3xl font-bold text-white">{stats.activeCompetitions}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status & Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Jadwal Mendatang
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <div>
                  <p className="text-white text-sm font-medium">
                    Batas Pendaftaran {currentBatch?.name || "Batch Aktif"}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {currentBatch ? formatDateTime(currentBatch.end_date) : "TBA"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


    </div>
  )
}
