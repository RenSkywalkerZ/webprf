"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Trophy, CheckCircle, Clock, XCircle, AlertTriangle, ImageIcon } from "lucide-react"

interface UserDashboardProps {
  userData: any
}

export function UserDashboard({ userData }: UserDashboardProps) {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [competitions, setCompetitions] = useState<any[]>([])
  const [currentBatch, setCurrentBatch] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true); // Set loading ke true di awal
      try {
        // Jalankan semua fetch secara bersamaan
        const [registrationsResponse, competitionsResponse, batchResponse] = await Promise.all([
          fetch("/api/users/registrations"),
          fetch("/api/competitions"),
          fetch("/api/batches/current")
        ]);

        // Proses hasil dari registrations
        if (registrationsResponse.ok) {
          const { registrations } = await registrationsResponse.json();
          setRegistrations(registrations);
        }

        // Proses hasil dari competitions
        if (competitionsResponse.ok) {
          const { competitions } = await competitionsResponse.json();
          setCompetitions(competitions);
        }

        // Proses hasil dari current batch
        if (batchResponse.ok) {
          const { batch } = await batchResponse.json();
          setCurrentBatch(batch);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Anda bisa menambahkan state untuk menampilkan pesan error di UI
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [userData]); // Tetap gunakan userData sebagai dependency

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return {
          text: "Disetujui",
          color: "bg-green-500/20 text-green-300 border-green-500/30",
          icon: CheckCircle,
        }
      case "pending":
        return {
          text: "Menunggu Verifikasi",
          color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
          icon: Clock,
        }
      case "rejected":
        return {
          text: "Ditolak",
          color: "bg-red-500/20 text-red-300 border-red-500/30",
          icon: XCircle,
        }
      default:
        return {
          text: "Menunggu",
          color: "bg-gray-500/20 text-gray-300 border-gray-500/30",
          icon: Clock,
        }
    }
  }

  const getRegistrationInfo = () => {
    if (registrations.length === 0) {
      return {
        hasRegistration: false,
        competition: null,
        status: null,
        registrationDate: null,
        paymentProof: null,
      }
    }

    const registration = registrations[0] // Get the first (and should be only) registration
    const competition = competitions.find((c) => c.id === registration.competition_id)

    return {
      hasRegistration: true,
      competition,
      status: registration.status,
      registrationDate: registration.created_at,
      paymentProof: registration.payment_proof_url,
      registration,
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton for Welcome Header */}
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
        </div>

        {/* Skeleton for Important Notice Card */}
        <div className="animate-pulse bg-slate-800/50 rounded-lg h-36 border border-slate-700"></div>
        
        {/* Skeleton for Twibbon Card */}
        <div className="animate-pulse bg-slate-800/50 rounded-lg h-20 border border-slate-700"></div>

        {/* Skeleton for Current Batch Info Card */}
        <div className="animate-pulse bg-slate-800/50 rounded-lg p-4 sm:p-6 border border-slate-700">
          <div className="h-5 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-16 bg-slate-700/50 rounded-lg"></div>
        </div>

        {/* Skeleton for Registration Status Card */}
        <div className="animate-pulse bg-slate-800/50 rounded-lg p-4 sm:p-6 border border-slate-700">
          <div className="h-5 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-24 bg-slate-700/50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const registrationInfo = getRegistrationInfo()
  const statusBadge = registrationInfo.status ? getStatusBadge(registrationInfo.status) : null
  const StatusIcon = statusBadge?.icon

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Selamat datang, {userData?.full_name || userData?.fullName || "Peserta"}! 👋
        </h1>
        <p className="text-slate-400">
          Selamat datang di dashboard PRF XIII.
        </p>
      </div>

      {/* Important Notice */}
      <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Informasi Penting
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Pisahkan paragraf pembuka dari list */}
          <p className="text-slate-300 text-sm mb-2">
            <strong>PERHATIAN:</strong> Pastikan Anda membaca dan memahami informasi berikut sebelum mendaftar lomba.
          </p>
          {/* Tambahkan kelas pl-5 (padding-left) pada <ul> */}
          <ul className="list-disc list-outside space-y-1 text-sm text-slate-300 pl-5">
            <li>
              Setiap peserta individu/peserta tim hanya dapat mendaftar untuk <strong>SATU lomba saja</strong> karena semua lomba dilaksanakan pada relatif bertabrakan.
            </li>
            <li>
              Pastikan untuk memilih lomba dengan tepat sebelum melakukan pendaftaran.
            </li>
            <li>
              Harap mengisi data diri pada bagian <strong>Informasi Diri</strong> jika belum atau ada perubahan, menu <strong>Pendaftaran Lomba</strong> akan terbuka setelah Anda mengisi data diri (100% Lengkap).
            </li>
          </ul>
        </CardContent>
      </Card>

            {/* Card untuk Twibbon */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Yuk, Gunakan Twibbon PRF XIII !</h3>
                <p className="text-slate-400 text-sm">Tunjukkan dukungan dan partisipasi Travellers!</p>
              </div>
            </div>
            <a href="https://bit.ly/TwibbonPRFXIII" target="_blank" rel="noopener noreferrer">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Buka Link Twibbon
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Current Batch Info */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Batch Pendaftaran Saat Ini:
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentBatch ? (
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">{currentBatch.name}</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-400">Periode Pendaftaran: </span>
                  <span className="text-white">
                    {new Date(currentBatch.start_date).toLocaleDateString("id-ID")} -{" "}
                    {new Date(currentBatch.end_date).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              <p>Tidak ada batch aktif saat ini</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registration Status */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-orange-400" />
            Status Pendaftaran Lomba
          </CardTitle>
        </CardHeader>
        <CardContent>
          {registrationInfo.hasRegistration ? (
            <div className="space-y-4">
              {/* Competition Info */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {registrationInfo.competition?.title || "Kompetisi"}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {registrationInfo.competition?.category || "Kategori tidak tersedia"}
                      </p>
                    </div>
                  </div>
                  {statusBadge && StatusIcon && (
                    <Badge className={statusBadge.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusBadge.text}
                    </Badge>
                  )}
                </div>

                {/* Competition Details */}
                {registrationInfo.competition && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Tanggal Daftar:</span>
                        <span className="text-white">
                          {new Date(registrationInfo.registrationDate).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">Bukti Bayar:</span>
                        <span className={registrationInfo.paymentProof ? "text-green-300" : "text-yellow-300"}>
                          {registrationInfo.paymentProof ? "Sudah Upload" : "Belum Upload"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status-specific Information */}
                {registrationInfo.status === "approved" && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-300 font-medium">Pendaftaran Disetujui!</span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      Selamat! Pendaftaran Anda telah disetujui. Silakan pantau informasi lebih lanjut mengenai jadwal
                      dan lokasi lomba.
                    </p>
                  </div>
                )}

                {registrationInfo.status === "pending" && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-300 font-medium">Menunggu Verifikasi</span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      {registrationInfo.paymentProof
                        ? "Bukti pembayaran Anda sedang diverifikasi oleh admin. Mohon tunggu konfirmasi lebih lanjut."
                        : "Silakan lanjutkan pendaftaran/upload bukti pembayaran untuk melanjutkan proses verifikasi."}
                    </p>
                  </div>
                )}

                {registrationInfo.status === "rejected" && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-300 font-medium">Pendaftaran Ditolak</span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      Maaf, pendaftaran Anda tidak dapat diproses. Silakan hubungi admin untuk informasi lebih lanjut.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                <h3 className="text-white font-semibold mb-2">Belum Ada Pendaftaran</h3>
                <p className="text-slate-300 text-sm mb-4">
                  Anda belum mendaftar lomba apapun. Silakan pilih lomba yang ingin Anda ikuti pada laman Pendaftaran Lomba.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
