"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, CheckCircle, BookOpen, Clock, Info, CreditCard, AlertCircle, AlertTriangle, Users } from "lucide-react"
import { CountdownTimer } from "@/components/ui/countdown-timer"

interface Competition {
  id: string
  title: string
  description: string
  category: string
  color?: string
  is_team_competition?: boolean
}

interface Batch {
  id: number
  name: string
  start_date: string
  end_date: string
}

interface Registration {
  id: string
  competition_id: string
  status: string
  created_at: string
  expires_at?: string
  payment_proof_url?: string
  is_team_registration?: boolean
}

interface CompetitionRegistrationProps {
  userData: any
  onRegisterCompetition: (competitionId: string, batch: number) => void
}

export function CompetitionRegistration({ userData, onRegisterCompetition }: CompetitionRegistrationProps) {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [currentBatchId, setCurrentBatchId] = useState<number | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [registrationClosed, setRegistrationClosed] = useState(false)
  const [competitionPrices, setCompetitionPrices] = useState<Record<string, string>>({})

  // Define which competitions are team-based using the correct UUIDs
  const teamCompetitionUUIDs = [
    "22270c4a-4f38-40fb-854e-daa58336f0d9", // Lomba Roket Air
    "331aeb0c-8851-4638-aa34-6502952f098b", // Depict Physics
    "3d4e5cca-cf3d-45d7-8849-2a614b82f4d4", // Scientific Writing
    "43ec1f50-2102-4a4b-995b-e33e61505b22", // Science Project
    "4cbe04f2-222b-4d44-8dd2-25821a66d467", // Lomba Praktikum
    "7b8cd68d-74be-4113-b36e-6953634ed53c", // Lomba Robotik
    "9517aa1c-3d72-4b6d-a30c-0ca4eed9a5b0", // Cerdas Cermat
  ]

  useEffect(() => {
    fetchData()
  }, [])

  // Refresh data when component becomes visible (user returns from payment page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, refresh registrations
        fetchRegistrations()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  useEffect(() => {
    competitions.forEach((competition: Competition) => {
      getCompetitionPrice(competition.id).then((price) => {
        setCompetitionPrices((prevPrices) => ({
          ...prevPrices,
          [competition.id]: price,
        }))
      })
    })
  }, [competitions, currentBatchId])

  const fetchRegistrations = async () => {
    try {
      const registrationsResponse = await fetch("/api/users/registrations")
      if (registrationsResponse.ok) {
        const { registrations } = await registrationsResponse.json()
        setRegistrations(registrations)
        console.log("📝 User registrations refreshed:", registrations)
      }
    } catch (error) {
      console.error("💥 Error fetching registrations:", error)
    }
  }

  const fetchData = async () => {
    try {
      console.log("🔄 Fetching competition registration data...")

      // Fetch competitions
      const competitionsResponse = await fetch("/api/competitions")
      if (competitionsResponse.ok) {
        const { competitions } = await competitionsResponse.json()
        // Mark team competitions using correct UUIDs
        const competitionsWithTeamInfo = competitions.map((comp: Competition) => ({
          ...comp,
          is_team_competition: teamCompetitionUUIDs.includes(comp.id),
        }))
        setCompetitions(competitionsWithTeamInfo)
        console.log("🏆 Competitions loaded:", competitionsWithTeamInfo.length)
      }

      // Fetch all batches with status
      const batchesResponse = await fetch("/api/batches/all")
      if (batchesResponse.ok) {
        const { batches, currentBatchId, registrationClosed } = await batchesResponse.json()
        setBatches(batches)
        setCurrentBatchId(currentBatchId)
        setRegistrationClosed(registrationClosed)
        console.log("📅 Batches data:", { batches, currentBatchId, registrationClosed })
      }

      // Fetch user registrations with detailed status
      await fetchRegistrations()
    } catch (error) {
      console.error("💥 Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCompetitionPrice = async (competitionId: string): Promise<string> => {
    if (!currentBatchId) {
      console.log("⚠️ No current batch ID for pricing")
      return "Rp 0"
    }

    try {
      // Fetch current pricing from admin settings
      const pricingResponse = await fetch("/api/pricing")
      if (pricingResponse.ok) {
        const { pricing } = await pricingResponse.json()
        const price = pricing[currentBatchId]?.[competitionId] || 0

        console.log("💰 Price from admin settings:", { competitionId, currentBatchId, price })

        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(price)
      }
    } catch (error) {
      console.error("Error fetching pricing:", error)
    }

    // Fallback to default pricing if admin pricing not available
    console.log("💰 Using fallback pricing for:", { competitionId, currentBatchId })

    const batchPricing: Record<number, Record<string, number>> = {
      1: {
        "b4415647-d77b-40af-81ac-956a49498ff2": 75000, // Physics Competition
        "22270c4a-4f38-40fb-854e-daa58336f0d9": 150000, // Lomba Roket Air
        "331aeb0c-8851-4638-aa34-6502952f098b": 150000, // Depict Physics
        "3d4e5cca-cf3d-45d7-8849-2a614b82f4d4": 150000, // Scientific Writing
        "43ec1f50-2102-4a4b-995b-e33e61505b22": 150000, // Science Project
        "4cbe04f2-222b-4d44-8dd2-25821a66d467": 150000, // Lomba Praktikum
        "7b8cd68d-74be-4113-b36e-6953634ed53c": 150000, // Lomba Robotik
        "9517aa1c-3d72-4b6d-a30c-0ca4eed9a5b0": 150000, // Cerdas Cermat
      },
      2: {
        "b4415647-d77b-40af-81ac-956a49498ff2": 85000, // Physics Competition
        "22270c4a-4f38-40fb-854e-daa58336f0d9": 170000, // Lomba Roket Air
        "331aeb0c-8851-4638-aa34-6502952f098b": 170000, // Depict Physics
        "3d4e5cca-cf3d-45d7-8849-2a614b82f4d4": 170000, // Scientific Writing
        "43ec1f50-2102-4a4b-995b-e33e61505b22": 170000, // Science Project
        "4cbe04f2-222b-4d44-8dd2-25821a66d467": 170000, // Lomba Praktikum
        "7b8cd68d-74be-4113-b36e-6953634ed53c": 170000, // Lomba Robotik
        "9517aa1c-3d72-4b6d-a30c-0ca4eed9a5b0": 170000, // Cerdas Cermat
      },
      3: {
        "b4415647-d77b-40af-81ac-956a49498ff2": 95000, // Physics Competition
        "22270c4a-4f38-40fb-854e-daa58336f0d9": 190000, // Lomba Roket Air
        "331aeb0c-8851-4638-aa34-6502952f098b": 190000, // Depict Physics
        "3d4e5cca-cf3d-45d7-8849-2a614b82f4d4": 190000, // Scientific Writing
        "43ec1f50-2102-4a4b-995b-e33e61505b22": 190000, // Science Project
        "4cbe04f2-222b-4d44-8dd2-25821a66d467": 190000, // Lomba Praktikum
        "7b8cd68d-74be-4113-b36e-6953634ed53c": 190000, // Lomba Robotik
        "9517aa1c-3d72-4b6d-a30c-0ca4eed9a5b0": 190000, // Cerdas Cermat
      },
    }

    const batchPrices = batchPricing[currentBatchId]
    const price = batchPrices?.[competitionId] || 0

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleRegister = async (competitionId: string) => {
    if (registrationClosed) {
      alert("Pendaftaran sedang ditutup sementara untuk rekapitulasi data.")
      return
    }

    // Check if user already has an approved registration or pending with payment proof
    const hasApprovedRegistration = registrations.some((reg) => reg.status === "approved")
    const hasPendingWithPayment = registrations.some((reg) => reg.status === "pending" && reg.payment_proof_url)

    if (hasApprovedRegistration || hasPendingWithPayment) {
      alert(
        "Anda sudah terdaftar di salah satu kompetisi atau sedang dalam proses verifikasi. Setiap peserta hanya dapat mendaftar satu kompetisi.",
      )
      return
    }

    try {
      const isTeamCompetition = teamCompetitionUUIDs.includes(competitionId)

      const response = await fetch("/api/competitions/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          competitionId,
          batchNumber: currentBatchId,
          isTeamRegistration: isTeamCompetition,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Add to registrations with pending status
        const newRegistration: Registration = {
          id: data.registration.id,
          competition_id: competitionId,
          status: "pending",
          created_at: new Date().toISOString(),
          expires_at: data.expiresAt,
          is_team_registration: isTeamCompetition,
        }
        setRegistrations((prev) => [...prev, newRegistration])

        onRegisterCompetition(competitionId, currentBatchId || 1)

        // Redirect based on competition type
        if (isTeamCompetition) {
          // Redirect to team registration form
          window.location.href = `/team-registration?competition=${competitionId}&batch=${currentBatchId || 1}&registration=${data.registration.id}`
        } else {
          // Redirect to payment page directly for individual competitions
          window.location.href = `/payment?competition=${competitionId}&batch=${currentBatchId || 1}&registration=${data.registration.id}`
        }
      } else {
        alert("Gagal mendaftar: " + data.error)
      }
    } catch (error) {
      console.error("Registration error:", error)
      alert("Terjadi kesalahan saat mendaftar")
    }
  }

  const getRegistrationStatus = (competitionId: string) => {
    const registration = registrations.find((r) => r.competition_id === competitionId)

    if (!registration) return null

    // If registration has payment proof, it should show as pending verification
    if (registration.payment_proof_url) {
      return registration.status // This will be "pending" until admin approves
    }

    // Check if registration is expired (only for registrations without payment proof)
    if (registration.status === "pending" && registration.expires_at && !registration.payment_proof_url) {
      const expirationTime = new Date(registration.expires_at)
      const now = new Date()
      if (expirationTime <= now) {
        // Registration has expired, treat as if not registered
        return null
      }
    }

    return registration.status
  }

  const getRegistration = (competitionId: string) => {
    const registration = registrations.find((r) => r.competition_id === competitionId)

    if (!registration) return null

    // If registration has payment proof, return it regardless of expiration
    if (registration.payment_proof_url) {
      return registration
    }

    // Check if registration is expired (only for registrations without payment proof)
    if (registration.status === "pending" && registration.expires_at && !registration.payment_proof_url) {
      const expirationTime = new Date(registration.expires_at)
      const now = new Date()
      if (expirationTime <= now) {
        // Registration has expired, treat as if not registered
        return null
      }
    }

    return registration
  }

  const isRegistered = (competitionId: string) => {
    return getRegistrationStatus(competitionId) !== null
  }

  const hasApprovedRegistration = () => {
    return registrations.some((reg) => reg.status === "approved")
  }

  const hasPendingWithPaymentProof = () => {
    return registrations.some((reg) => reg.status === "pending" && reg.payment_proof_url)
  }

  const canRegisterNewCompetition = () => {
    return !hasApprovedRegistration() && !hasPendingWithPaymentProof() && !registrationClosed
  }

  const getStatusBadge = (status: string | null) => {
    if (!status) return null

    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Terdaftar
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Menunggu Verifikasi
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            Ditolak
          </Badge>
        )
      default:
        return null
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

  const getBatchStatusBadge = (batch: Batch, isCurrentBatch: boolean) => {
    // Check if registration is globally closed
    if (registrationClosed) {
      return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Ditutup</Badge>
    }

    // Check if this is the current active batch (set by admin)
    if (isCurrentBatch) {
      return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Dibuka</Badge>
    }

    // For non-current batches, determine if they are past or future based on batch ID
    // Lower ID = past batch, Higher ID = future batch
    if (currentBatchId && batch.id < currentBatchId) {
      return <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">Telah ditutup</Badge>
    }

    // Future batch (higher ID than current)
    return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Akan datang</Badge>
  }

  const getCurrentBatch = (): Batch | undefined => {
    return batches.find((batch: Batch) => batch.id === currentBatchId)
  }

  const handleTimerExpire = () => {
    // Refresh data when timer expires to update registration status
    fetchData()
  }

  const handleContinueRegistration = (competitionId: string, registration: Registration) => {
    if (registration.is_team_registration) {
      // Continue team registration
      window.location.href = `/team-registration?competition=${competitionId}&batch=${currentBatchId || 1}&registration=${registration.id}`
    } else {
      // Continue individual payment
      window.location.href = `/payment?competition=${competitionId}&batch=${currentBatchId || 1}&registration=${registration.id}`
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="animate-pulse bg-slate-800 rounded-lg p-6">
          <div className="h-6 bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-700 rounded-lg p-4">
                <div className="h-4 bg-slate-600 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-600 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const currentBatch = getCurrentBatch()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Pendaftaran Kompetisi</h1>
        <p className="text-slate-400">Daftar kompetisi yang tersedia di PRF XIII</p>
      </div>

      {/* Important Notice - One Competition Only */}
      <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Penting: Batasan Pendaftaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-slate-300">
              <strong>Setiap peserta hanya dapat mendaftar untuk SATU kompetisi saja.</strong>
            </p>
            <p className="text-slate-400 text-sm">
              Hal ini dikarenakan semua kompetisi akan dilaksanakan pada jadwal yang bersamaan (conflicting schedule).
              Setelah pendaftaran Anda disetujui atau sedang dalam proses verifikasi, Anda tidak dapat mendaftar
              kompetisi lain.
            </p>
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                <strong>Catatan:</strong> Lomba selain Physics Competition adalah lomba tim (3 peserta per tim).
              </p>
            </div>
            {(hasApprovedRegistration() || hasPendingWithPaymentProof()) && (
              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-300 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {hasApprovedRegistration()
                    ? "Anda sudah terdaftar di salah satu kompetisi. Pendaftaran kompetisi lain tidak tersedia."
                    : "Anda sedang dalam proses verifikasi. Pendaftaran kompetisi lain tidak tersedia."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Registration Status Alert */}
      {registrationClosed && (
        <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-400" />
              Pendaftaran Ditutup Sementara
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">
              Pendaftaran sedang ditutup untuk rekapitulasi data peserta. Silakan tunggu pengumuman pembukaan batch
              selanjutnya.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Batch Information - Show All Batches */}
      <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Informasi Batch Pendaftaran
          </CardTitle>
          <CardDescription>Semua periode pendaftaran PRF XIII</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {batches.map((batch: Batch) => {
              const isCurrentBatch = batch.id === currentBatchId
              return (
                <div
                  key={batch.id}
                  className={`bg-slate-800/50 rounded-lg p-4 border-2 transition-colors ${
                    isCurrentBatch && !registrationClosed
                      ? "border-green-500/50 bg-green-500/10"
                      : registrationClosed
                        ? "border-red-500/50 bg-red-500/10"
                        : "border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">{batch.name}</h3>
                    {getBatchStatusBadge(batch, isCurrentBatch)}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-slate-400">Mulai:</p>
                      <p className="text-white">{formatDateTime(batch.start_date)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Berakhir:</p>
                      <p className="text-white">{formatDateTime(batch.end_date)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {currentBatch && !registrationClosed && (
            <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 font-medium">Batch Aktif Saat Ini</span>
              </div>
              <p className="text-slate-300 text-sm">
                Pendaftaran menggunakan <span className="font-semibold text-white">{currentBatch.name}</span> sampai{" "}
                {formatDateTime(currentBatch.end_date)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {competitions.map((competition: Competition) => {
          const price = competitionPrices[competition.id] || "Memuat..."
          const registrationStatus = getRegistrationStatus(competition.id)
          const registration = getRegistration(competition.id)
          const statusBadge = getStatusBadge(registrationStatus)
          const isTeamCompetition = competition.is_team_competition

          return (
            <Card
              key={competition.id}
              className="bg-slate-900/50 border-slate-700 hover:border-slate-600 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${competition.color || "from-blue-500 to-purple-600"} rounded-lg flex items-center justify-center`}
                    >
                      {isTeamCompetition ? (
                        <Users className="w-6 h-6 text-white" />
                      ) : (
                        <Trophy className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{competition.title}</CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                          {competition.category}
                        </Badge>
                        {isTeamCompetition && (
                          <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                            Tim (3 orang)
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {statusBadge}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-slate-300 leading-relaxed">{competition.description}</CardDescription>

                {/* Countdown Timer for Pending Registrations */}
                {registration &&
                  registration.status === "pending" &&
                  registration.expires_at &&
                  !registration.payment_proof_url && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                      <CountdownTimer expiresAt={registration.expires_at} onExpire={handleTimerExpire} />
                      <p className="text-xs text-slate-400 mt-1">
                        {isTeamCompetition
                          ? "Selesaikan pendaftaran tim dan pembayaran sebelum waktu habis"
                          : "Selesaikan pembayaran sebelum waktu habis"}
                      </p>
                    </div>
                  )}

                {/* Price Display */}
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Harga {currentBatch?.name || "Batch Aktif"}</p>
                      <p className="text-white font-semibold text-lg">{price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs">{isTeamCompetition ? "Per tim" : "Per peserta"}</p>
                      <p className="text-slate-300 text-sm">Sekali bayar</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Guidebook
                    </Button>
                  </div>
                  <Button
                    onClick={() => {
                      if (registrationStatus === "pending" && registration && !registration.payment_proof_url) {
                        // Continue existing registration
                        handleContinueRegistration(competition.id, registration)
                      } else if (!isRegistered(competition.id) && canRegisterNewCompetition()) {
                        // Start new registration
                        handleRegister(competition.id)
                      }
                    }}
                    disabled={
                      !canRegisterNewCompetition() ||
                      (isRegistered(competition.id) &&
                        (registrationStatus !== "pending" || (registration && registration.payment_proof_url))) ||
                      !currentBatchId ||
                      registrationClosed
                    }
                    className={`
                      ${
                        registrationStatus === "approved"
                          ? "bg-green-600 hover:bg-green-700"
                          : registrationStatus === "pending" && registration?.payment_proof_url
                            ? "bg-gray-600 cursor-not-allowed"
                            : registrationStatus === "pending"
                              ? "bg-orange-600 hover:bg-orange-700"
                              : registrationStatus === "rejected"
                                ? "bg-red-600 hover:bg-red-700"
                                : !canRegisterNewCompetition() || !currentBatchId || registrationClosed
                                  ? "bg-slate-600 cursor-not-allowed"
                                  : `bg-gradient-to-r ${competition.color || "from-blue-500 to-purple-600"} hover:opacity-90`
                      } text-white transition-all duration-300
                    `}
                  >
                    {registrationStatus === "approved" ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Terdaftar
                      </div>
                    ) : registrationStatus === "pending" && registration?.payment_proof_url ? (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Menunggu Verifikasi
                      </div>
                    ) : registrationStatus === "pending" ? (
                      <div className="flex items-center gap-2">
                        {isTeamCompetition ? (
                          <>
                            <Users className="w-4 h-4" />
                            Lanjutkan Pendaftaran
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            Lanjutkan Pembayaran
                          </>
                        )}
                      </div>
                    ) : registrationStatus === "rejected" ? (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Ditolak
                      </div>
                    ) : !canRegisterNewCompetition() ? (
                      <div className="flex items-center gap-2">
                        {hasApprovedRegistration() ? "Sudah Terdaftar" : "Sedang Verifikasi"}
                      </div>
                    ) : !currentBatchId || registrationClosed ? (
                      <div className="flex items-center gap-2">Pendaftaran Tutup</div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {isTeamCompetition ? (
                          <>
                            <Users className="w-4 h-4" />
                            Daftar Tim
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            Daftar & Bayar
                          </>
                        )}
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {registrations.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-blue-400" />
              Status Pendaftaran Kompetisi
            </CardTitle>
            <CardDescription>Ringkasan status pendaftaran Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {registrations.map((registration) => {
                const competition = competitions.find((c: Competition) => c.id === registration.competition_id)
                const statusBadge = getStatusBadge(registration.status)
                return (
                  <div
                    key={registration.id}
                    className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3"
                  >
                    <div>
                      <p className="text-white font-medium flex items-center gap-2">
                        {competition?.title}
                        {registration.is_team_registration && (
                          <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">Tim</Badge>
                        )}
                      </p>
                      <p className="text-slate-400 text-sm">
                        Didaftar: {new Date(registration.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    {statusBadge}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
