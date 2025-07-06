"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { TeamRegistrationForm } from "@/components/team-registration/team-registration-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface Competition {
  id: string
  title: string
  description: string
}

export default function TeamRegistrationPage() {
  const searchParams = useSearchParams()
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const competitionId = searchParams.get("competition")
  const batchId = Number.parseInt(searchParams.get("batch") || "1")
  const registrationId = searchParams.get("registration")

  useEffect(() => {
    if (!competitionId || !registrationId) {
      setError("Parameter pendaftaran tidak lengkap")
      setIsLoading(false)
      return
    }

    fetchCompetitionData()
  }, [competitionId, registrationId])

  const fetchCompetitionData = async () => {
    try {
      const response = await fetch(`/api/competitions/${competitionId}`)
      if (response.ok) {
        const { competition } = await response.json()
        setCompetition(competition)
      } else {
        setError("Kompetisi tidak ditemukan")
      }
    } catch (error) {
      console.error("Error fetching competition:", error)
      setError("Gagal memuat data kompetisi")
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = () => {
    // This will be called when team registration is complete
    // The form component will handle the redirect to payment
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Memuat data kompetisi...</p>
        </div>
      </div>
    )
  }

  if (error || !competition || !competitionId || !registrationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-900/50 border-slate-700 max-w-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Terjadi Kesalahan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-slate-300 mb-4">
              {error || "Parameter pendaftaran tidak valid"}
            </CardDescription>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Kembali
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <TeamRegistrationForm
      competitionId={competitionId}
      competitionTitle={competition.title}
      registrationId={registrationId}
      batchId={batchId}
      onComplete={handleComplete}
    />
  )
}
