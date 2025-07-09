// Salin dan ganti seluruh isi file: app/team-registration/page.tsx

"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { TeamRegistrationForm } from "@/components/team-registration/team-registration-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Loading from "./loading"

interface Competition {
  id: string
  title: string
  max_team_size: number // Ini akan mengambil nilai dari database Anda
}

export default function TeamRegistrationPage() {
  const searchParams = useSearchParams()
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [availableLevels, setAvailableLevels] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const competitionId = searchParams.get("competition")
  const batchId = Number.parseInt(searchParams.get("batch") || "1")
  const registrationId = searchParams.get("registration")

  useEffect(() => {
    if (!competitionId || !registrationId) {
      setError("Parameter pendaftaran tidak lengkap");
      setIsLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      try {
        const [competitionRes, levelsRes] = await Promise.all([
          fetch(`/api/competitions/${competitionId}`),
          fetch(`/api/competitions/${competitionId}/levels`)
        ]);

        if (!competitionRes.ok) throw new Error("Kompetisi tidak ditemukan");
        if (!levelsRes.ok) throw new Error("Gagal memuat jenjang pendidikan");

        const competitionData = await competitionRes.json();
        const { levels } = await levelsRes.json();
        
        if (!competitionData.competition) {
            throw new Error("Format data kompetisi tidak valid dari API");
        }

        setCompetition(competitionData.competition);
        setAvailableLevels(levels);

      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError(err instanceof Error ? err.message : "Gagal memuat data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [competitionId, registrationId]);


  if (isLoading) {
    return <Loading />;
  }

  if (error || !competition || !competitionId || !registrationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-900/50 border-slate-700 max-w-md">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-400" />Terjadi Kesalahan</CardTitle></CardHeader>
          <CardContent>
            <CardDescription className="text-slate-300 mb-4">{error || "Parameter pendaftaran tidak valid"}</CardDescription>
            <button onClick={() => window.history.back()} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">Kembali</button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TeamRegistrationForm
      competitionId={competitionId}
      competitionTitle={competition.title}
      registrationId={registrationId}
      batchId={batchId}
      availableLevels={availableLevels}
      // Memberikan max_team_size ke form. Default ke 3 jika properti tidak ada.
      maxTeamSize={competition.max_team_size || 3} 
      onComplete={() => {}}
    />
  );
}