"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  User,
  ExternalLink,
  Info,
  Lock,
  MapPin,
} from "lucide-react"

interface UserData {
  id: string
  email: string
  full_name?: string
  role?: string
}

interface Competition {
  id: string
  title: string
  description: string
  category: string
  color?: string
}

interface Registration {
  id: string
  competition_id: string
  status: string
  created_at: string
  batch_number: number
}

interface CompetitionDetailsProps {
  userData: UserData
}

export function CompetitionDetails({ userData }: CompetitionDetailsProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [isLoading, setIsLoading] = useState(true)


  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch user registrations
      const registrationsResponse = await fetch("/api/users/registrations")
      if (registrationsResponse.ok) {
        const { registrations } = await registrationsResponse.json()
        setRegistrations(registrations)
      }

      // Fetch competitions
      const competitionsResponse = await fetch("/api/competitions")
      if (competitionsResponse.ok) {
        const { competitions } = await competitionsResponse.json()
        setCompetitions(competitions)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return { text: "Disetujui", color: "bg-green-500/20 text-green-300 border-green-500/30", icon: CheckCircle }
      case "pending":
        return {
          text: "Menunggu Verifikasi",
          color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
          icon: Clock,
        }
      case "rejected":
        return { text: "Ditolak", color: "bg-red-500/20 text-red-300 border-red-500/30", icon: AlertCircle }
      default:
        return { text: "Menunggu", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", icon: Clock }
    }
  }

  const getCompetitionById = (id: string) => {
    return competitions.find((c: Competition) => c.id === id)
  }

  const getNextSteps = (status: string) => {
    switch (status) {
      case "approved":
        return [
          "✅ Pembayaran telah diverifikasi",
          "📞 Hubungi Admin, CP ada pada \"Kontak\" jika ada pertanyaan",
          "📱 Bergabung dengan grup WhatsApp kompetisi",
          "🗓️ Catat tanggal pelaksanaan kompetisi",
        ]
      case "pending":
        return [
          "⏳ Menunggu verifikasi pembayaran oleh admin",
          "📤 Harap upload bukti pembayaran beserta dokumen yang diperlukan jika belum dilakukan",
          "💬 Hubungi admin jika ada pertanyaan",
          "⏰ Proses verifikasi maksimal 1x24 jam",
        ]
      case "rejected":
        return [
          "❌ Pembayaran tidak dapat diverifikasi",
          "📧 Cek email untuk alasan penolakan",
          "💬 Hubungi admin untuk klarifikasi",
          "🔄 Lakukan pendaftaran ulang jika diperlukan",
        ]
      default:
        return ["⏳ Status sedang diproses"]
    }
  }

  // Get WhatsApp link based on competition title
  const getWhatsappLink = (competitionTitle: string) => {
    const whatsappLinks: { [key: string]: string } = {
      "Physics Competition": "",
      "Depict Physics": "",
      "Lomba Praktikum": "",
      "Science Project": "",
      "Scientific Writing": "",
      "Cerdas Cermat": "",
      "Roket Air": "",
    };
    return whatsappLinks[competitionTitle] || "#"; // Returns a fallback link '#' if not found
  };

  // Competition-specific schedules
  const getCompetitionSchedule = (competitionTitle: string) => {
    const schedules = {
      "Physics Competition": [
        {
          title: "Technical Meeting Babak Penyisihan",
          date: "2025-09-02",
        },
        {
          title: "Babak Penyisihan",
          date: "2025-10-04",
          time: "08:00 - 11:00 WIB",
        },
        {
          title: "Pengumuman Babak Penyisihan",
          date: "2025-10-12",
          time: "15:00 WIB",
        },
        {
          title: "Technical Meeting Babak Semifinal dan Final",
          date: "2025-10-18",
          time: "19:00 WIB",
        },
        {
          title: "Babak Semifinal dan Pengumuman Finalis",
          date: "2025-10-31",
          time: "08:00 - 12:00 WIB",
        },
        {
          title: "Babak Final dan Pengumuman Pemenang",
          date: "2025-11-07",
          time: "15:00 WIB",
        },
      ],
        "Depict Physics": [
        {
          title: "Technical Meeting",
          date: "2025-09-02",
        },
        {
          title: "Babak Penyisihan",
          startDate: "2025-09-03",
          endDate: "2025-09-26",
        },
        {
          title: "Pengumuman Babak Penyisihan",
          date: "2025-09-29",
        },
        {
          title: "Babak Final",
          date: "2025-09-30",
        },
        {
          title: "Pengumuman Babak Final",
          date: "2025-10-13",
        },
        {
          title: "Pengumuman Pemenang",
          date: "2025-11-01",
        },
      ],
      "Lomba Praktikum": [
        {
          title: "Technical Meeting",
          date: "2025-09-12",
          location: "Zoom Meeting",
        },
        {
          title: "Babak Penyisihan",
          date: "2025-10-31",
          location: "Gedung UPP-IPD FMIPA UI",
        },
        {
          title: "Pengumuman Babak Penyisihan",
          date: "2025-10-31",
          location: "Balairung UI",
        },
        {
          title: "Babak Final",
          date: "2025-11-01",
          location: "Gedung UPP-IPD FMIPA UI",
        },
        {
          title: "Pengumuman Babak Final",
          date: "2025-11-01",
          location: "Balairung UI",
        },
      ],
      "Science Project": [
        {
          title: "Technical Meeting",
          date: "2025-09-02",
        },
        {
          title: "Babak Seleksi Proposal",
          startDate: "2025-09-03",
          endDate: "2025-09-17",
        },
        {
          title: "Pengumuman Babak Seleksi Proposal",
          date: "2025-09-29",
        },
        {
          title: "Babak Seleksi Video",
          startDate: "2025-09-30",
          endDate: "2025-10-10",
        },
        {
          title: "Pengumuman Babak Seleksi Video",
          date: "2025-10-17",
        },
        {
          title: "Babak Presentasi",
          date: "2025-10-31",
          location: "Gedung Lab. Riset Multidisiplin FMIPA UI",
        },
        {
          title: "Pengumuman Babak Presentasi",
          date: "2025-11-01",
          location: "Balairung UI",
        },
      ],
      "Scientific Writing": [
        {
          title: "Technical Meeting",
          date: "2025-09-02",
          location: "Zoom Meeting",
        },
        {
          title: "Babak Penyisihan",
          startDate: "2025-09-03",
          endDate: "2025-09-06",
          location: "Website Pesta Rakyat Fisika XIII",
        },
        {
          title: "Pengumuman Babak Penyisihan",
          date: "2025-09-08",
          location: "Website Pesta Rakyat Fisika XIII dan Grup WhatsApp",
        },
        {
          title: "Babak Semifinal",
          startDate: "2025-09-09",
          endDate: "2025-09-28",
          location: "Website Pesta Rakyat Fisika XIII",
        },
        {
          title: "Pengumuman Babak Semifinal",
          date: "2025-10-15",
          location: "Website Pesta Rakyat Fisika XIII dan Grup WhatsApp",
        },
        {
          title: "Babak Final",
          date: "2025-10-31",
          location: "Gedung Lab. Riset Multidisiplin FMIPA UI",
        },
        {
          title: "Pengumuman Babak Final",
          date: "2025-11-01",
          location: "Balairung UI",
        },
      ],
      "Cerdas Cermat": [
        {
          title: "Technical Meeting",
          date: "2025-09-02",
          location: "Zoom Meeting",
        },
        {
          title: "Babak Penyisihan",
          date: "2025-09-13",
          location: "Melalui laman Sibiti pada website Pesta Rakyat Fisika XIII",
        },
        {
          title: "Pengumuman Babak Penyisihan",
          date: "2025-10-17",
          location: "Melalui website Pesta Rakyat Fisika XIII dan Grup WhatsApp",
        },
        {
          title: "Babak Semifinal",
          date: "2025-10-31",
          location: "Gedung Lab. Riset Multidisiplin FMIPA UI",
        },
        {
          title: "Pengumuman Babak Semifinal",
          date: "2025-11-01",
          location: "Balairung UI",
        },
        {
          title: "Babak Final",
          date: "2025-11-01",
          location: "Balairung UI",
        },
        {
          title: "Pengumuman Pemenang",
          date: "2025-11-01",
          location: "Balairung UI",
        },
      ],
      "Lomba Roket Air": [
        {
          title: "Technical Meeting",
          date: "2025-09-02",
          location: "Zoom Meeting",
        },
        {
          title: "Babak Penyisihan",
          date: "2025-11-01",
          location: "Balairung UI",
        },
        {
          title: "Pengumuman Babak Penyisihan",
          date: "2025-11-01",
          location: "Balairung UI",
        },
        {
          title: "Babak Peluncuran",
          date: "2025-11-01",
          location: "Balairung UI",
        },
        {
          title: "Pengumuman Babak Peluncuran",
          date: "2025-11-01",
          location: "Balairung UI",
        },
      ],
    }

    return schedules[competitionTitle as keyof typeof schedules] || []
  }

  const coordinatorContacts = [
    {
      name: "Ahmad Amartia Nurfiqri",
      role: "CP Physics Competition",
      phone: "0821 4462 7340",
    },
    {
      name: "Muhammad Eric Cantona",
      role: "CP Scientific Writing",
      phone: "0881 8832 129",
    },
    {
      name: "Theresa Elizabeth",
      role: "CP Science Project",
      phone: "0822 0824 1138",
    },
    {
      name: "Muhammad Farhan",
      role: "CP Lomba Cerdas Cermat",
      phone: "0895 1654 6075",
    },
    {
      name: "Jauhar",
      role: "CP Lomba Praktikum",
      phone: "0858 9544 8523",
    },
    {
      name: "Gerardus Jeremy",
      role: "CP Lomba Roket Air",
      phone: "0812 9477 8480",
    },
    {
      name: "Giyar Saputra",
      role: "CP Depict Physics",
      phone: "0896 3754 5817",
    },
  ]

  // Check if user has approved registration
  const hasApprovedRegistration = registrations.some((reg: any) => reg.status === "approved")

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="animate-pulse bg-slate-800 rounded-lg p-6">
          <div className="h-6 bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Detail Kompetisi</h1>
        <p className="text-slate-400">Informasi lengkap tentang kompetisi yang Anda ikuti</p>
      </div>

      {registrations.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Kompetisi Terdaftar</h3>
            <p className="text-slate-400 mb-6">
              Anda belum mendaftar kompetisi apapun. Mulai daftarkan diri Anda sekarang!
            </p>
            <Button
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
              onClick={() => (window.location.hash = "#registration")}
            >
              Daftar Kompetisi
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="registrations" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 mb-6">
            <TabsTrigger value="registrations" className="data-[state=active]:bg-slate-700 text-white">
              <Trophy className="w-4 h-4 mr-2" />
              Pendaftaran
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="data-[state=active]:bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!hasApprovedRegistration}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Jadwal
              {!hasApprovedRegistration && <Lock className="w-3 h-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger
              value="contacts"
              className="data-[state=active]:bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!hasApprovedRegistration}
            >
              <Phone className="w-4 h-4 mr-2" />
              Kontak
              {!hasApprovedRegistration && <Lock className="w-3 h-3 ml-1" />}
            </TabsTrigger>
          </TabsList>

          {!hasApprovedRegistration && (
            <Card className="bg-yellow-500/10 border-yellow-500/30 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-300 font-medium">Akses Terbatas</span>
                </div>
                <p className="text-slate-300 text-sm">
                  Tab Jadwal dan Kontak hanya dapat diakses setelah pembayaran Anda disetujui. Silakan lengkapi
                  pembayaran beserta dokumen dan tunggu verifikasi admin.
                </p>
              </CardContent>
            </Card>
          )}

          <TabsContent value="registrations" className="space-y-6">
            {registrations.map((registration: Registration) => {
              const competition = getCompetitionById(registration.competition_id)
              const statusBadge = getStatusBadge(registration.status)
              const StatusIcon = statusBadge.icon
              const nextSteps = getNextSteps(registration.status)

              return (
                <Card key={registration.id} className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-xl">{competition?.title}</CardTitle>
                          <p className="text-slate-400 text-sm">
                            Didaftar: {new Date(registration.created_at).toLocaleDateString("id-ID")} • Batch{" "}
                            {registration.batch_number}
                          </p>
                        </div>
                      </div>
                      <Badge className={statusBadge.color}>
                        <StatusIcon className="w-4 h-4 mr-2" />
                        {statusBadge.text}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <Info className="w-4 h-4 text-blue-400" />
                          Informasi Kompetisi
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Kategori:</span>
                            <span className="text-white">{competition?.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">ID Pendaftaran:</span>
                            <span className="text-white font-mono">{registration.id.slice(0, 8)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Batch:</span>
                            <span className="text-white">Batch {registration.batch_number}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Status Pembayaran:</span>
                            <span className="text-white">{statusBadge.text}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Langkah Selanjutnya
                        </h3>
                        <div className="space-y-2">
                          {nextSteps.map((step, index) => (
                            <div key={index} className="text-sm text-slate-300 flex items-start gap-2">
                              <span className="text-xs mt-1">•</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {registration.status === "approved" && (
                      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-green-300 font-semibold">Selamat! Pendaftaran Anda Disetujui</span>
                        </div>
                        <p className="text-slate-300 text-sm mb-4">
                          Pembayaran Anda telah diverifikasi. Silakan bergabung dengan grup WhatsApp kompetisi untuk
                          mendapatkan informasi terbaru.
                        </p>
                        <div className="flex gap-2">
                          <a 
                            href={getWhatsappLink(competition?.title || "")} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Gabung Grup WA
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}

                    {registration.status === "pending" && (
                      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="w-5 h-5 text-yellow-400" />
                          <span className="text-yellow-300 font-semibold">Menunggu Verifikasi</span>
                        </div>
                        <p className="text-slate-300 text-sm">
                          Anda belum upload bukti pembayaran / bukti pembayaran Anda sedang diverifikasi oleh admin. Mohon tunggu.
                        </p>
                      </div>
                    )}

                    {registration.status === "rejected" && (
                      <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="w-5 h-5 text-red-400" />
                          <span className="text-red-300 font-semibold">Pendaftaran Ditolak</span>
                        </div>
                        <p className="text-slate-300 text-sm mb-4">
                          Pembayaran Anda tidak dapat diverifikasi. Silakan hubungi admin untuk informasi lebih lanjut
                          atau lakukan pendaftaran ulang.
                        </p>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                          <Phone className="w-4 h-4 mr-2" />
                          Hubungi Admin
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            {hasApprovedRegistration ? (
              registrations
                .filter((reg: any) => reg.status === "approved")
                .map((registration: any) => {
                  const competition = getCompetitionById(registration.competition_id)
                  const competitionSchedule = getCompetitionSchedule(competition?.title || "")

                  return (
                    <Card key={registration.id} className="bg-slate-900/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-cyan-400" />
                          Jadwal {competition?.title}
                        </CardTitle>
                        <p className="text-slate-400 text-sm">Jadwal khusus untuk kompetisi yang Anda ikuti</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {competitionSchedule.map((event, index) => {
                            const formatDate = (dateString: string) => {
                              return new Date(dateString).toLocaleDateString("id-ID", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              });
                            };

                            let displayDate: string;
                            // Use the 'in' operator as a robust type guard
                            if ('date' in event && event.date) {
                              displayDate = formatDate(event.date);
                            } else if ('startDate' in event && 'endDate' in event && event.startDate && event.endDate) {
                              displayDate = `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`;
                            } else {
                              displayDate = "Jadwal tidak tersedia"; // Fallback for safety
                            }

                            return (
                              <div key={index} className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg">
                                {/* Icon */}
                                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                                  <Calendar className="w-6 h-6 text-white" />
                                </div>

                                {/* Details */}
                                <div className="flex-1">
                                  <h3 className="text-white font-semibold">{event.title}</h3>
                                  
                                  {/* Date */}
                                  <p className="text-slate-400 text-sm mt-1">
                                    {displayDate}
                                  </p>

                                  {/* Location (displays only if event.location exists) */}
                                    {'location' in event && event.location && (
                                      <div className="flex items-center gap-2 mt-2">
                                        <MapPin className="w-4 h-4 text-slate-500" />
                                        <p className="text-slate-400 text-sm">{event.location}</p>
                                      </div>
                                    )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
            ) : (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="text-center py-12">
                  <Lock className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <h3 className="text-xl font-semibold text-white mb-2">Akses Terbatas</h3>
                  <p className="text-slate-400">
                    Jadwal kompetisi hanya dapat diakses setelah pembayaran Anda disetujui.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            {hasApprovedRegistration ? (
              <>
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Phone className="w-5 h-5 text-green-400" />
                      Contact Person
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {coordinatorContacts.map((contact, index) => (
                        <div key={index} className="bg-slate-800/50 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">{contact.name}</h3>
                              <p className="text-slate-400 text-sm">{contact.role}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-slate-400" />
                              <a href={`tel:${contact.phone}`} className="text-slate-300 hover:text-white">
                                {contact.phone}
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-400" />
                      Informasi Kontak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <p className="text-slate-300">
                        <strong>Jam Operasional:</strong> Senin - Jumat: 08:00 - 19:00 WIB
                      </p>
                      <p className="text-slate-300">
                        <strong>Hari Libur:</strong>
                        <br />
                        Sabtu - Minggu: 09:00 - 17:00 WIB
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="text-center py-12">
                  <Lock className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <h3 className="text-xl font-semibold text-white mb-2">Akses Terbatas</h3>
                  <p className="text-slate-400">
                    Informasi kontak hanya dapat diakses setelah pembayaran Anda disetujui.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
