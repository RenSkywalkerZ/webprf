"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, CheckCircle, BookOpen, Clock, Info, CreditCard, AlertCircle, AlertTriangle, Users, Phone, Bot, Rocket, FlaskConical, NotebookPen, CircuitBoard, Microscope, ImageIcon, Calculator, Loader2 } from "lucide-react"
import { CountdownTimer } from "@/components/ui/countdown-timer"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Competition {
  id: string
  title: string
  description: string
  category: string
  color?: string
  icon: string
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
  team_data_complete?: boolean
}

interface CompetitionRegistrationProps {
  userData: any
  onRegisterCompetition: (competitionId: string, batch: number) => void
}

export function CompetitionRegistration({ userData, onRegisterCompetition }: CompetitionRegistrationProps) {
  const router = useRouter()
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [currentBatchId, setCurrentBatchId] = useState<number | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [registrationClosed, setRegistrationClosed] = useState(false)
  const [competitionPrices, setCompetitionPrices] = useState<Record<string, string>>({})
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingCompetitionId, setPendingCompetitionId] = useState<string | null>(null);
  const ICON_MAP: { [key: string]: React.ReactNode } = {
    // nama ikon (dari DB) : komponen ikon
    book: <BookOpen className="w-6 h-6 text-white" />,
    rocket: <Rocket className="w-6 h-6 text-white" />,
    lab: <FlaskConical className="w-6 h-6 text-white" />,
    notebook: <NotebookPen className="w-6 h-6 text-white" />,
    circuitBoard: <CircuitBoard className="w-6 h-6 text-white" />,
    microscope: <Microscope className="w-6 h-6 text-white" />,
    imageIcon: <ImageIcon className="w-6 h-6 text-white" />,
    calculator: <Calculator className="w-6 h-6 text-white" />,
  };
  const EDUCATION_LEVEL_MAP: { [key: string]: string } = {
  tk: "TK",
  sd: "SD/Sederajat",
  smp: "SMP/Sederajat",
  sma: "SMA/Sederajat",
  universitas: "Universitas/Perguruan Tinggi",
  umum: "Umum",
  };
  
  // 1. Fungsi untuk MEMBUKA modal konfirmasi
const openCancelDialog = (registrationId: string) => {
    setCancelDialog({ isOpen: true, registrationId: registrationId });
};
const { toast } = useToast();
// 2. Fungsi untuk MENJALANKAN pembatalan setelah dikonfirmasi di modal
const handleConfirmCancelation = async () => {
    const { registrationId } = cancelDialog;
    if (!registrationId) return;

    // Set loading state ke true
    setIsLoading(true);

    try {
        const response = await fetch(`/api/registrations/${registrationId}`, {
            method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
            setRegistrations(prev => prev.filter(r => r.id !== registrationId));
            // Gunakan toast untuk notifikasi sukses
            toast({
                title: "Pendaftaran Dibatalkan",
                description: "Pendaftaran Anda untuk kompetisi ini telah berhasil dibatalkan.",
            });
            setTimeout(() => {
              window.location.reload();
            }, 100);
        } else {
            // Gunakan toast untuk notifikasi gagal
            toast({
                title: "Gagal Membatalkan",
                description: data.error || "Terjadi kesalahan.",
                variant: "destructive",
            });
        }
    } catch (error) {
        // Gunakan toast untuk notifikasi error sistem
        toast({
            title: "Error",
            description: "Tidak dapat terhubung ke server. Silakan coba lagi.",
            variant: "destructive",
        });
        console.error("Cancelation error:", error);
    } finally {
        // Set loading state ke false dan tutup modal
        setIsLoading(false);
        setCancelDialog({ isOpen: false, registrationId: null });
    }
};
  
  const [cancelDialog, setCancelDialog] = useState({
  isOpen: false,
  registrationId: null as string | null,
  });

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
  // Taruh ini di bagian atas komponen Anda
const COMPETITION_STARTING_PRICES: { [key: string]: number } = {
  // UUID: Harga Awal (dari Batch 1)
  "b4415647-d77b-40af-81ac-956a49498ff2": 100000,   // Physics Competition
  "22270c4a-4f38-40fb-854e-daa58336f0d9": 280000,   // Lomba Roket Air
  "331aeb0c-8851-4638-aa34-6502952f098b": 90000,   // Depict Physics
  "3d4e5cca-cf3d-45d7-8849-2a614b82f4d4": 120000,   // Scientific Writing
  "43ec1f50-2102-4a4b-995b-e33e61505b22": 250000,   // Science Project
  "4cbe04f2-222b-4d44-8dd2-25821a66d467": 200000,   // Lomba Praktikum
  "9517aa1c-3d72-4b6d-a30c-0ca4eed9a5b0": 150000,   // Cerdas Cermat
};

const GUIDEBOOK_LINKS: { [key: string]: string } = {
  "b4415647-d77b-40af-81ac-956a49498ff2": "https://tinyurl.com/PhysicsCompetitionGBPRFXIII",
  "3d4e5cca-cf3d-45d7-8849-2a614b82f4d4": "https://tinyurl.com/ScientificWritingsGBPRFXIII", 
  "9517aa1c-3d72-4b6d-a30c-0ca4eed9a5b0": "https://tinyurl.com/CerdasCermatGBPRFXIII",
  "331aeb0c-8851-4638-aa34-6502952f098b": "https://tinyurl.com/DepictPhysicsGBPRFXIII",
  "4cbe04f2-222b-4d44-8dd2-25821a66d467": "https://tinyurl.com/PraktikumGBPRFXIII",
  "22270c4a-4f38-40fb-854e-daa58336f0d9": "https://tinyurl.com/RoketAirPRFXIII",
  "43ec1f50-2102-4a4b-995b-e33e61505b22": "https://tinyurl.com/ScienceProjectGBPRFXIII",
  "7b8cd68d-74be-4113-b36e-6953634ed53c": "https://tinyurl.com/RobotikGBPRFXIII"
};

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
  }, [competitions])

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
    // 1. Ambil harga dari objek hardcoded, atau 0 jika tidak ditemukan.
    const price = COMPETITION_STARTING_PRICES[competitionId] || 0;

    // 2. Format harga ke dalam mata uang Rupiah.
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
};

  const handleRegister = (competitionId: string) => {
  // 1. Simpan ID kompetisi yang dipilih
  setPendingCompetitionId(competitionId);
  // 2. Buka modal konfirmasi
  setIsModalOpen(true);
};

const handleCancelRegistration = () => {
  // Reset loading state dan tutup modal
  setIsLoading(false);
  setIsModalOpen(false);
  setPendingCompetitionId(null);
};

const handleConfirmRegistration = async () => {
  // Pastikan ada kompetisi yang dipilih
  if (!pendingCompetitionId) return;

  // Set loading state ke true
  setIsLoading(true);

  try {
    // --- Mulai Logika Pendaftaran Asli ---
    if (registrationClosed) {
      alert("Pendaftaran sedang ditutup sementara untuk rekapitulasi data.");
      return;
    }

    const hasApprovedRegistration = registrations.some((reg) => reg.status === "approved");
    const hasPendingWithPayment = registrations.some((reg) => reg.status === "pending" && reg.payment_proof_url);

    if (hasApprovedRegistration || hasPendingWithPayment) {
      alert(
        "Anda sudah terdaftar di salah satu kompetisi atau sedang dalam proses verifikasi. Setiap peserta hanya dapat mendaftar satu kompetisi.",
      );
      handleCancelRegistration(); // Tutup modal setelah alert
      return;
    }

    const isTeamCompetition = teamCompetitionUUIDs.includes(pendingCompetitionId);

    const response = await fetch("/api/competitions/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        competitionId: pendingCompetitionId,
        batchNumber: currentBatchId,
        isTeamRegistration: isTeamCompetition,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      const newRegistration: Registration = {
        id: data.registration.id,
        competition_id: pendingCompetitionId,
        status: "pending",
        created_at: new Date().toISOString(),
        expires_at: data.expiresAt,
        is_team_registration: isTeamCompetition,
      };
      setRegistrations((prev) => [...prev, newRegistration]);
      onRegisterCompetition(pendingCompetitionId, currentBatchId || 1);

      if (isTeamCompetition) {
        window.location.href = `/team-registration?competition=${pendingCompetitionId}&batch=${currentBatchId || 1}&registration=${data.registration.id}`;
      } else {
        window.location.href = `/payment?competition=${pendingCompetitionId}&batch=${currentBatchId || 1}&registration=${data.registration.id}`;
      }
    } else {
      alert("Gagal mendaftar: " + data.error);
    }
  } catch (error) {
    console.error("Registration error:", error);
    alert("Terjadi kesalahan saat mendaftar");
  } finally {
    // Set loading state ke false dan tutup modal
    setIsLoading(false);
    handleCancelRegistration();
  }
};

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
      return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Sedang Ditutup Sementara</Badge>
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

  // 2. Perbarui logika handleContinueRegistration
  const handleContinueRegistration = (competitionId: string, registration: Registration) => {
  // Jika ini pendaftaran tim...
  if (registration.is_team_registration) {
    // ...dan data tim BELUM LENGKAP, arahkan ke form pengisian data tim.
    if (!registration.team_data_complete) {
      window.location.href = `/team-registration?competition=${competitionId}&batch=${currentBatchId || 1}&registration=${registration.id}`;
    } else {
      // ...tapi jika SUDAH LENGKAP, langsung arahkan ke pembayaran.
      window.location.href = `/payment?competition=${competitionId}&batch=${currentBatchId || 1}&registration=${registration.id}`;
    }
  } else {
    // Jika bukan pendaftaran tim, langsung ke pembayaran (alur individu).
    window.location.href = `/payment?competition=${competitionId}&batch=${currentBatchId || 1}&registration=${registration.id}`;
  }
};

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
              Pendaftaran sedang ditutup untuk rekapitulasi data peserta / dalam perbaikan. Silakan tunggu pengumuman pembukaan batch
              selanjutnya.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Batch Information - Show All Batches */}
      {!registrationClosed && (
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
      )}

      {/* Competition Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card
        key="manual-robotik"
        className="bg-slate-900/50 border-slate-700 hover:border-slate-600 transition-colors" // Border & shadow ungu untuk pembeda
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Ikon untuk lomba tim (disesuaikan) */}
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-lg">Lomba Robotik</CardTitle>
                <div className="flex gap-2 mt-1">
                  {/* Badge/Kategori manual */}
                  <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                    TK - SMA/MA
                  </Badge>
                  <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                    Tim/Individu
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
          <CardContent className="space-y-4">
            {/* Deskripsi manual */}
            <CardDescription className="text-slate-300 leading-relaxed">
              Adu kreativitas dan kemampuan rekayasa dalam merancang, membangun, dan memprogram dalam bidang robotika untuk menyelesaikan misi yang menantang.
            </CardDescription>

            {/* Tombol dengan link manual */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
              {/* Ganti "#" dengan link ke form pendaftaran (misal: Google Form) */}
              <a href="https://tinyurl.com/RobotikGBPRFXIII" target="_blank" rel="noopener noreferrer">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Info Pendaftaran
                </Button>
              </a>
            </div>
          </CardContent>
      </Card>
        
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
                    <div className={`w-12 h-12 bg-gradient-to-r ${competition.color || "from-blue-500 to-purple-600"} rounded-lg flex items-center justify-center`}>
                      {/* Mengambil ikon dari map, atau fallback ke Trophy jika tidak ditemukan */}
                      {ICON_MAP[competition.icon] || <Trophy className="w-6 h-6 text-white" />}
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{competition.title}</CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                          {competition.category}
                        </Badge>
                        {isTeamCompetition ? (
                          <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                            Tim (3 orang)
                          </Badge>
                        ) : (
                          <Badge className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                            Individu
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
                      <p className="text-slate-400 text-sm">Biaya pendaftaran <strong>MULAI</strong> dari:</p>
                      <p className="text-white font-semibold text-lg">{price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs">{isTeamCompetition ? "Per tim" : "Per peserta"}</p>
                      <p className="text-slate-300 text-sm">Sekali bayar</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  {/* Tombol Batal akan muncul di sini jika kondisi terpenuhi */}
                  {registrationStatus === 'pending' && registration && !registration.payment_proof_url ? (
                      <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openCancelDialog(registration.id)}
                      >
                          Batal
                      </Button>
                  ) : (
                  <div className="flex gap-2">
                    {GUIDEBOOK_LINKS[competition.id] ? (
                    <a href={GUIDEBOOK_LINKS[competition.id]} target="_blank" rel="noopener noreferrer">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Guidebook
                      </Button>
                    </a>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent opacity-50 cursor-not-allowed"
                      disabled
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Guidebook
                    </Button>
                  )}
                  </div>
                  )}
                  {/* Tombol Daftar/Pembayaran */}
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
                        (registrationStatus !== "pending" || !!(registration && registration.payment_proof_url))) ||
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
                                  : `bg-blue-500 hover:opacity-90 hover:bg-blue-600`
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
                            Lanjutkan Pendaftaran/Pembayaran
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
      <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardContent className="p-4"> {/* Mengatur padding menjadi lebih kecil */}
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <p className="text-slate-300 text-sm">
                Butuh bantuan atau ada kendala pada sistem pendaftaran? Hubungi/WA: <strong className="text-white">0812 1843 8566 (Haekal)</strong>
              </p>
            </div>
          </CardContent>
      </Card>
      {/* Modal untuk Lomba Individu */}
      {isModalOpen && pendingCompetitionId && !competitions.find(c => c.id === pendingCompetitionId)?.is_team_competition && (() => {
        // ▼▼▼ TAMBAHKAN LOGIKA INI ▼▼▼
        const isEducationLevelEligible = 
          userData?.education_level && 
          ['smp', 'sma', 'universitas'].includes(userData.education_level);
          return(
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="bg-slate-900 border-slate-700 w-full max-w-md animate-in fade-in-0 zoom-in-95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-6 h-6" />
                Konfirmasi Pendaftaran
              </CardTitle>
              <CardDescription className="text-slate-400 pt-2">
                Setiap peserta hanya dapat mendaftar untuk <strong>SATU</strong> kompetisi.
                Apakah Anda yakin ingin melanjutkan?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm mb-4 bg-slate-800/50 p-3 rounded-lg">
                Anda akan mendaftar untuk kompetisi:{" "}
                <strong className="text-white">
                  {competitions.find(c => c.id === pendingCompetitionId)?.title || ""}
                </strong>
              </p>
              <p className="text-slate-300 text-sm mb-4 bg-slate-800/50 p-3 rounded-lg">
                Jenjang Anda adalah:{" "}
                <strong className="text-white">
                  {EDUCATION_LEVEL_MAP[userData?.education_level] || "Data tidak ditemukan, silakan periksa/isi di <strong>Informasi Pribadi</strong> Anda."}
                </strong>
              </p>
            </CardContent>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-300">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Lomba Individu - Anda mendaftar sendiri</span>
                </div>
                <p className="text-slate-400 text-sm">
                  Setelah menekan <strong className="text-white">Ya, Lanjutkan</strong>, Anda akan diarahkan langsung ke halaman pembayaran.
                  Pastikan jenjang pendidikan Anda sudah tepat dan sudah memilih kompetisi yang tepat.
                </p>
              </div>
              {/* ▼▼▼ TAMBAHKAN PESAN PERINGATAN INI ▼▼▼ */}
              {!isEducationLevelEligible && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-300 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Pendaftaran hanya dibuka untuk jenjang SMP, SMA, dan Universitas.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-3 bg-slate-900/50 p-4 rounded-b-lg">
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                onClick={handleCancelRegistration}
                disabled={isLoading}  // Tambahkan disabled saat loading
              >
                Batal
              </Button>
              <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleConfirmRegistration}
              disabled={!isEducationLevelEligible || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Ya, Lanjutkan ke Pembayaran
                </>
              )}
            </Button>
            </CardFooter>
          </Card>
        </div>
        );
      })()}

      <ConfirmationDialog
      isOpen={cancelDialog.isOpen}
      onClose={() => setCancelDialog({ isOpen: false, registrationId: null })}
      onConfirm={handleConfirmCancelation}
      type="warning"
      title="Konfirmasi Pembatalan"
      description="Apakah Anda yakin ingin membatalkan pendaftaran untuk kompetisi ini? Tindakan ini tidak dapat diurungkan."
      confirmText="Ya, Batalkan"
      cancelText="Tidak"
      isLoading={isLoading}
      />

      {/* Modal untuk Lomba Tim */}
      {isModalOpen && pendingCompetitionId && competitions.find(c => c.id === pendingCompetitionId)?.is_team_competition && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="bg-slate-900 border-slate-700 w-full max-w-md animate-in fade-in-0 zoom-in-95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-400">
                <Users className="w-6 h-6" />
                Konfirmasi Pendaftaran
              </CardTitle>
              <CardDescription className="text-slate-400 pt-2">
                Setiap peserta hanya dapat mendaftar untuk <strong>SATU</strong> kompetisi.
                Apakah Anda yakin ingin melanjutkan?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 text-sm mb-4 bg-slate-800/50 p-3 rounded-lg">
                Anda akan mendaftar untuk kompetisi:{" "}
                <strong className="text-white">
                  {competitions.find(c => c.id === pendingCompetitionId)?.title || ""}
                </strong>
              </p>
            </CardContent>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-purple-300">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Lomba Tim - Maksimal 3 anggota per tim</span>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <p className="text-purple-300 text-sm font-medium mb-2">Yang perlu disiapkan:</p>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>• Data lengkap 3 anggota tim</li>
                    <li>• Kartu pelajar/identitas semua anggota tim</li>
                    <li>• Foto diri semua anggota tim</li>
                    <li>• Twibbon yang sudah dipasang semua anggota tim</li>
                  </ul>
                  <p className="text-slate-400 text-xs mt-2">
                    Pastikan semua data sudah lengkap sebelum melanjutkan pendaftaran.
                  </p>
                </div>
                <p className="text-slate-400 text-sm">
                  Setelah menekan <strong className="text-white">Ya, Lanjutkan Daftar Tim</strong>, Anda akan diarahkan ke halaman 
                  pengisian data tim terlebih dahulu, kemudian ke pembayaran.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 bg-slate-900/50 p-4 rounded-b-lg">
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                onClick={handleCancelRegistration}
                disabled={isLoading}  // Tambahkan disabled saat loading
              >
                Batal
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={handleConfirmRegistration}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Ya, Lanjutkan Daftar Tim
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
