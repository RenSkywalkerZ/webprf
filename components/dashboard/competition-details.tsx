// components\dashboard\competition-details.tsx

"use client"
import { useState, useEffect, ChangeEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  Trophy,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Phone,
  User,
  ExternalLink,
  Info,
  Lock,
  MapPin,
  Upload,
  ImageIcon,
  KeyRound,
  Copy,
  Eye,
  EyeOff,
  Users// <-- Pastikan ikon ini diimpor
} from "lucide-react"

// Interface untuk data akun tim dari API baru
interface TeamAccount {
  team_member_name: string;
  cbt_username: string;
  cbt_password: string;
}

interface CbtAccount {
  cbt_username: string
  cbt_password: string
  education_level: string
  participant_code: string
}

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
  is_team_registration: boolean
  displayCategory: string
}

interface CompetitionDetailsProps {
  userData: UserData
}

export function CompetitionDetails({ userData }: CompetitionDetailsProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [reuploadFile, setReuploadFile] = useState<File | null>(null)
  const [isReuploading, setIsReuploading] = useState(false)
  const [cbtAccount, setCbtAccount] = useState<CbtAccount | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [lccTeamAccounts, setLccTeamAccounts] = useState<Record<string, TeamAccount[]>>({})
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

      const fetchData = async () => {
    try {
      const [regRes, compRes] = await Promise.all([
        fetch("/api/users/registrations"),
        fetch("/api/competitions")
      ]);

      const { registrations: fetchedRegistrations = [] } = await regRes.json();
      const { competitions: fetchedCompetitions = [] } = await compRes.json();
      
      setRegistrations(fetchedRegistrations);
      setCompetitions(fetchedCompetitions);

      // --- LOGIKA UNTUK PHYSICS COMPETITION (TIDAK DIUBAH) ---
      const pcRegistration = fetchedRegistrations.find((reg: Registration) =>
        reg.status === "approved" &&
        fetchedCompetitions.find((c: Competition) => c.id === reg.competition_id)?.title === "Physics Competition"
      );

      if (pcRegistration) {
        console.log("Found approved Physics Competition registration, fetching account...");
        const cbtResponse = await fetch("/api/users/cbt-account");
        if (cbtResponse.ok) {
          const { cbtAccount } = await cbtResponse.json();
          setCbtAccount(cbtAccount);
        }
      }

      // --- TAMBAHAN LANGKAH 2: Logika baru untuk Lomba Cerdas Cermat ---
      const lccRegistration = fetchedRegistrations.find((reg: Registration) => {
        const competition = fetchedCompetitions.find((c: Competition) => c.id === reg.competition_id);
        return reg.status === "approved" && competition?.title === "Cerdas Cermat";
      });

      if (lccRegistration) {
        console.log("Found approved LCC registration, fetching team accounts...");
        const teamAccountsRes = await fetch(`/api/users/cbt-team-account?competitionId=${lccRegistration.competition_id}`);
        
        if (teamAccountsRes.ok) {
          const { teamAccounts } = await teamAccountsRes.json();
          setLccTeamAccounts(prev => ({
            ...prev,
            [lccRegistration.id]: teamAccounts
          }));
        } else {
          console.warn("Failed to fetch LCC team accounts for registration:", lccRegistration.id);
        }
      }
      // --- AKHIR BLOK TAMBAHAN ---

    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReuploadFile(e.target.files[0])
    }
  }

  const handleReupload = async (registrationId: string) => {
    if (!reuploadFile) {
      toast({
        title: "File Belum Dipilih",
        description: "Silakan pilih file bukti pembayaran untuk diunggah.",
        variant: "destructive",
      })
      return
    }

    setIsReuploading(true)
    const formData = new FormData()
    formData.append("file", reuploadFile)
    formData.append("registrationId", registrationId)

    try {
      const response = await fetch("/api/registrations/reupload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "Berhasil Diunggah Ulang!",
          description: "Status pendaftaran Anda akan segera diperbarui oleh admin.",
        })
        setReuploadFile(null)
        fetchData()
      } else {
        const errorData = await response.json()
        toast({
          title: "Gagal Mengunggah",
          description: errorData.message || "Terjadi kesalahan pada server.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error re-uploading file:", error)
      toast({
        title: "Terjadi Kesalahan",
        description: "Tidak dapat terhubung ke server. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setIsReuploading(false)
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
          "📞 Hubungi Admin jika ada pertanyaan, CP ada pada \"Kontak\"",
          "📱 Bergabung dengan grup WhatsApp",
          "🗓️ Catat tanggal pelaksanaan lomba",
        ]
      case "pending":
        return [
          "⏳ Menunggu verifikasi pembayaran oleh admin",
          "📤 Harap upload bukti pembayaran beserta dokumen yang diperlukan jika belum dilakukan",
          "💬 Hubungi admin jika ada pertanyaan (Hugo: 0851 1738 5115) ",
          "⏰ Proses verifikasi maksimal 1x24 jam",
        ]
      case "rejected":
        return [
          "❌ Verifikasi pembayaran/berkas gagal.",
          "📤 Silakan unggah ulang bukti pembayaran atau berkas yang benar.",
          "💬 Hubungi admin untuk klarifikasi jika mengalami kendala.",
        ]
      default:
        return ["⏳ Status sedang diproses"]
    }
  }

  const getWhatsappLink = (competitionTitle: string) => {
    const whatsappLinks: { [key: string]: string } = {
      "Physics Competition": "https://chat.whatsapp.com/Bct2vK3MeI3A9veXApss82?mode=ac_t",
      "Depict Physics": "https://chat.whatsapp.com/Bct2vK3MeI3A9veXApss82?mode=ac_t",
      "Lomba Praktikum": "https://chat.whatsapp.com/Bct2vK3MeI3A9veXApss82?mode=ac_t",
      "Science Project": "https://chat.whatsapp.com/Bct2vK3MeI3A9veXApss82?mode=ac_t",
      "Scientific Writing": "https://chat.whatsapp.com/Bct2vK3MeI3A9veXApss82?mode=ac_t",
      "Cerdas Cermat": "https://chat.whatsapp.com/Bct2vK3MeI3A9veXApss82?mode=ac_t",
      "Roket Air": "https://chat.whatsapp.com/Bct2vK3MeI3A9veXApss82?mode=ac_t",
    };
    return whatsappLinks[competitionTitle] || "#";
  };

  const getCompetitionSchedule = (competitionTitle: string) => {
    const schedules = {
      "Physics Competition": [
        {
          "title": "Technical Meeting Babak Penyisihan",
          "date": "2025-09-26"
        },
        {
          "title": "Babak Penyisihan",
          "date": "2025-10-11"
        },
        {
          "title": "Pengumuman Babak Penyisihan",
          "date": "2025-10-17"
        },
        {
          "title": "Technical Meeting Babak Semifinal dan Final",
          "date": "2025-10-24"
        },
        {
          "title": "Babak Semifinal",
          "date": "2025-10-31"
        },
        {
          "title": "Pengumuman Babak Semifinal",
          "date": "2025-10-31"
        },
        {
          "title": "Babak Final dan Pengumuman Pemenang",
          "date": "2025-11-01"
        }
      ],
        "Depict Physics": [
        {
          "title": "Technical Meeting",
          "date": "2025-09-26"
        },
        {
          "title": "Babak Penyisihan",
          "startDate": "2025-09-26",
          "endDate": "2025-09-30"
        },
        {
          "title": "Pengumuman Babak Penyisihan",
          "date": "2025-10-11"
        },
        {
          "title": "Babak Final",
          "startDate": "2025-10-12",
          "endDate": "2025-10-25"
        },
        {
          "title": "Closing Ceremony dan Pengumuman Pemenang",
          "date": "2025-11-01"
        },
      ],
      "Lomba Praktikum": [
        {
          "title": "Technical Meeting",
          "date": "2025-09-26",
        },
        {
          "title": "Babak Penyisihan",
          "date": "2025-10-31",
        },
        {
          "title": "Pengumuman Babak Penyisihan",
          "date": "2025-10-31",
        },
        {
          "title": "Babak Final",
          "date": "2025-11-01",
        },
        {
          "title": "Pengumuman Babak Final",
          "date": "2025-11-01",
        },
        {
          "title": "Closing Ceremony dan Pengumuman Pemenang",
          "date": "2025-11-01",
        },
      ],
      "Science Project": [
        {
          "title": "Technical Meeting Babak Penyisihan",
          "date": "2025-09-26"
        },
        {
          "title": "Babak Penyisihan",
          "startDate": "2025-09-26",
          "endDate": "2025-09-30"
        },
        {
          "title": "Pengumuman Babak Penyisihan",
          "date": "2025-10-08"
        },
        {
          "title": "Babak Semifinal",
          "startDate": "2025-10-09",
          "endDate": "2025-10-15"
        },
        {
          "title": "Pengumuman Babak Semifinal",
          "date": "2025-10-24"
        },
        {
          "title": "Babak Final",
          "date": "2025-10-31"
        },
        {
          "title": "Closing Ceremony dan Pengumuman Pemenang",
          "date": "2025-11-01"
        },
      ],
      "Scientific Writing": [
        {
          "title": "Technical Meeting",
          "date": "2025-09-26",
        },
        {
          "title": "Babak Penyisihan",
          "startDate": "2025-09-26",
          "endDate": "2025-09-29",
        },
        {
          "title": "Pengumuman Babak Penyisihan",
          "date": "2025-10-01",
        },
        {
          "title": "Babak Semifinal",
          "startDate": "2025-10-01",
          "endDate": "2025-10-10",
        },
        {
          "title": "Pengumuman Babak Semifinal",
          "date": "2025-10-20",
        },
        {
          "title": "Babak Final",
          "date": "2025-10-31",
        },
        {
          "title": "Closing Ceremony dan Pengumuman Pemenang",
          "date": "2025-11-01",
        },
      ],
      "Cerdas Cermat": [
        {
          "title": "Technical Meeting Babak Penyisihan",
          "date": "2025-09-26",
        },
        {
          "title": "Babak Penyisihan",
          "date": "2025-10-11",
        },
        {
          "title": "Pengumuman Babak Penyisihan",
          "date": "2025-10-17",
        },
        {
          "title": "Technical Meeting Babak Semifinal dan Final",
          "date": "2025-10-24",
        },
        {
          "title": "Babak Semifinal",
          "date": "2025-10-31",
        },
        {
          "title": "Pengumuman Babak Semifinal",
          "date": "2025-10-31",
        },
        {
          "title": "Babak Final",
          "date": "2025-11-01",
        },
        {
          "title": "Closing Ceremony dan Pengumuman Pemenang",
          "date": "2025-11-01",
        },
      ],
      "Lomba Roket Air": [
        {
          "title": "Technical Meeting",
          "date": "2025-09-26",
        },
        {
          "title": "Pelaksanaan Perlombaan",
          "date": "2025-11-01",
        },
        {
          "title": "Closing Ceremony dan Pengumuman Pemenang",
          "date": "2025-11-01",
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

  const hasApprovedRegistration = registrations.some((reg: any) => reg.status === "approved")

   const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Berhasil Disalin!",
      description: `${fieldName} telah disalin ke clipboard.`,
    })
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
        <h1 className="text-3xl font-bold text-white mb-2">Detail Lomba</h1>
        <p className="text-slate-400">Informasi lengkap tentang lomba yang Anda ikuti</p>
      </div>

      {registrations.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Lomba Terdaftar</h3>
            <p className="text-slate-400 mb-6">
              Anda belum mendaftar lomba apapun. Mulai daftarkan diri Anda sekarang!
            </p>
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
              const teamAccounts = lccTeamAccounts[registration.id];

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
                          Informasi Lomba
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Kategori Jenjang:</span>
                            <span className="text-white font-medium">{registration.displayCategory}</span>
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
                          Pembayaran Anda telah diverifikasi. Silakan bergabung dengan grup WhatsApp lomba untuk
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
                          Anda belum upload bukti pembayaran <strong>ATAU</strong> bukti pembayaran Anda sedang diverifikasi oleh admin.
                        </p>
                      </div>
                    )}
                    
                    {/* --- BLOK UTAMA UNTUK UPLOAD ULANG --- */}
                    {registration.status === "rejected" && (
                      <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg p-4 space-y-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-400" />
                          <span className="text-red-300 font-semibold">Pendaftaran Ditolak</span>
                        </div>
                        <p className="text-slate-300 text-sm">
                          Pembayaran atau berkas Anda tidak dapat diverifikasi. Silakan unggah ulang berkas yang benar. Jika ada kendala, hubungi admin.
                        </p>
                        
                        {/* --- MODIFIKASI: Menambahkan Instruksi Detail --- */}
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                          <h4 className="text-amber-300 font-medium mb-2">Dokumen yang Wajib Diunggah:</h4>
                          <ul className="text-amber-100 text-sm space-y-1 list-disc list-inside">
                            <li>Bukti transfer</li>
                            <li>Foto diri peserta setengah badan (jika tim, seluruh anggota tim)</li>
                            <li>Kartu identitas peserta (jika tim, seluruh anggota tim)</li>
                            <li>Screenshot Twibbon yang telah dipasang pada instagram (jika tim, seluruh anggota tim)</li>
                          </ul>
                          <p className="text-amber-100 text-sm mt-2">
                            Seluruh dokumen di atas digabungkan jadi satu (merge) dan dikirim dalam format <span className="font-medium">.pdf, .jpeg, .jpg,</span> atau <span className="font-medium">.png</span>.
                          </p>
                           <div className="pt-3">
                            <a href="https://bit.ly/TwibbonPRFXIII" target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200">
                                <ImageIcon className="w-4 h-4 mr-2" />
                                Buka Link Twibbon
                              </Button>
                            </a>
                          </div>
                        </div>
                        
                        {/* FITUR UPLOAD ULANG */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Input
                            type="file"
                            onChange={handleFileChange}
                            className="bg-slate-800 border-slate-600 text-slate-300 file:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 hover:file:bg-slate-600"
                          />
                           <Button 
                            onClick={() => handleReupload(registration.id)} 
                            disabled={!reuploadFile || isReuploading}
                            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {isReuploading ? "Mengunggah..." : "Upload Ulang"}
                          </Button>
                        </div>
                        
                        <div className="pt-4 mt-4 border-t border-red-400/20">
                          <a href="https://wa.me/6285117385115" target="_blank" rel="noopener noreferrer">
                              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto">
                              <Phone className="w-4 h-4 mr-2" />
                              Hubungi Admin (WhatsApp)
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}
                  {registration.status === 'approved' &&
                    competition?.title === 'Physics Competition' &&
                    cbtAccount && (
                      <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-4">
                         <h3 className="text-white font-semibold flex items-center gap-2">
                            <KeyRound className="w-4 h-4 text-amber-400" />
                            Informasi Akun CBT
                          </h3>
                        {/* Username */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-slate-400 mb-1 sm:mb-0">Email</span>
                          <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-md">
                            <span className="text-white font-mono">{cbtAccount.cbt_username}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleCopy(cbtAccount.cbt_username, "Username")}
                            >
                              <Copy className="w-4 h-4 text-slate-400" />
                            </Button>
                          </div>
                        </div>
                        {/* Password */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-slate-400 mb-1 sm:mb-0">Password</span>
                          <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-md">
                            <span className="text-white font-mono">
                              {showPassword ? cbtAccount.cbt_password : "••••••••"}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4 text-slate-400" />
                              ) : (
                                <Eye className="w-4 h-4 text-slate-400" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleCopy(cbtAccount.cbt_password, "Password")}
                            >
                              <Copy className="w-4 h-4 text-slate-400" />
                            </Button>
                          </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                          <a href="https://prfxiii.sibiti.co.id/" target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Buka Halaman CBT
                            </Button>
                          </a>
                        </div>
                      </div>
                  )}
                  {competition?.title === 'Cerdas Cermat' && teamAccounts && teamAccounts.length > 0 && (
                    <div className="mt-4 pt-6 border-t border-slate-700/50 space-y-6">
                      <h3 className="text-white font-semibold flex items-center gap-3 text-lg">
                        <Users className="w-5 h-5 text-amber-400" />
                        Informasi Akun CBT Tim - Cerdas Cermat
                      </h3>

                      {teamAccounts.map((account: TeamAccount) => (
                        <div key={account.cbt_username} className="bg-slate-800/50 p-4 rounded-lg space-y-3">
                          <p className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2 mb-3">
                            Anggota Tim: <span className="font-bold text-white">{account.team_member_name}</span>
                          </p>
                          {/* Username */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-slate-400 mb-1 sm:mb-0">Email CBT</span>
                            <div className="flex items-center gap-2 bg-slate-900/70 p-2 rounded-md">
                              <span className="text-white font-mono text-sm">{account.cbt_username}</span>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(account.cbt_username, "Username")}>
                                <Copy className="w-4 h-4 text-slate-400" />
                              </Button>
                            </div>
                          </div>
                          {/* Password */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-slate-400 mb-1 sm:mb-0">Password CBT</span>
                            <div className="flex items-center gap-2 bg-slate-900/70 p-2 rounded-md">
                              <span className="text-white font-mono text-sm">
                                {showPassword ? account.cbt_password : "••••••••"}
                              </span>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(account.cbt_password, "Password")}>
                                <Copy className="w-4 h-4 text-slate-400" />
                              </Button>
                            </div>
                          </div>
                            <div className="pt-4 flex justify-end">
                            <a href="https://prfxiii.sibiti.co.id/" target="_blank" rel="noopener noreferrer">
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Buka Halaman CBT
                              </Button>
                            </a>
                          </div>
                        </div>
                      ))}
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
                        <p className="text-slate-400 text-sm">Jadwal khusus untuk lomba yang Anda ikuti</p>
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
                            if ('date' in event && event.date) {
                              displayDate = formatDate(event.date);
                            } else if ('startDate' in event && 'endDate' in event && event.startDate && event.endDate) {
                              displayDate = `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`;
                            } else {
                              displayDate = "Jadwal tidak tersedia";
                            }

                            return (
                              <div key={index} className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg">
                                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                                  <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-white font-semibold">{event.title}</h3>
                                  <p className="text-slate-400 text-sm mt-1">
                                    {displayDate}
                                  </p>
                                    {/* {'location' in event && event.location && (
                                      <div className="flex items-center gap-2 mt-2">
                                        <MapPin className="w-4 h-4 text-slate-500" />
                                        <p className="text-slate-400 text-sm">{event.location}</p>
                                      </div>
                                    )} */}
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
                    Jadwal lomba hanya dapat diakses setelah pembayaran Anda disetujui.
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