"use client"
import * as XLSX from "xlsx"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Shield,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  Phone,
  Mail,
  School,
  MapPin,
  Calendar,
  User,
  FileSpreadsheet,
  UserCheck,
  Crown,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Search,
  Filter,
  RefreshCw,
  BarChart3,
  AlertCircle,
  Eye,
  EyeOff,
  SortAsc,
  SortDesc,
  CalendarIcon,
  Activity,
  PieChart,
  CheckSquare,
  X,
  Plus,
  Minus,
  ArrowUpDown,
  Printer,
  ChevronLeft,
  SquareUser,
  VenusAndMars
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { id } from "date-fns/locale"

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

interface AdminPanelProps {
  userData: UserData
}

interface TeamMember {
  id: string
  role: string
  full_name: string
  email: string
  phone: string
  school: string
  grade: string
  address: any
  gender: string
  identity_type: string
  student_id?: string
}

interface Address {
  street: string
  rtRw?: string
  village: string
  district: string
  city: string
  province: string
  postalCode: string
}

interface Participant {
  id: string
  status: string
  batch_number: number
  registration_date: string
  competition_id: string
  payment_proof_url?: string
  is_team_registration: boolean
  users: {
    id: string
    email: string
    full_name: string
    phone: string
    school: string
    grade: string
    education_level: string
    address: Address
    date_of_birth: string
    gender: string
  }
  competitions: {
    id: string
    title: string
  }
  team_members?: TeamMember[]
}

interface FilterState {
  search: string
  status: string
  competition: string
  batch: string
  registrationType: string
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  school: string
  grade: string
}

interface SortConfig {
  key: keyof Participant | "users.full_name" | "users.email" | "users.school"
  direction: "asc" | "desc"
}

const ITEMS_PER_PAGE = 10

import React from "react" // Pastikan React di-import

// Letakkan helper function di sini agar bisa diakses oleh komponen baru
const getStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return { text: "Disetujui", color: "bg-green-500/20 text-green-300 border-green-500/30", icon: CheckCircle }
    case "pending":
      return { text: "Menunggu", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", icon: Clock }
    case "rejected":
      return { text: "Ditolak", color: "bg-red-500/20 text-red-300 border-red-500/30", icon: XCircle }
    default:
      return { text: "Menunggu", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", icon: Clock }
  }
}

const getRoleBadge = (role: string) => {
    switch (role) {
      case "leader":
        return { text: "Ketua Tim", color: "bg-purple-500/20 text-purple-300 border-purple-500/30", icon: Crown }
      case "member1":
        return { text: "Anggota 1", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: UserCheck }
      case "member2":
        return { text: "Anggota 2", color: "bg-green-500/20 text-green-300 border-green-500/30", icon: UserCheck }
      default:
        return { text: "Anggota", color: "bg-slate-500/20 text-slate-300 border-slate-500/30", icon: User }
    }
}

const EDUCATION_LEVEL_LABELS: { [key: string]: string } = {
    tk: "TK/Sederajat",
    sd: "SD/Sederajat",
    smp: "SMP/Sederajat",
    sma: "SMA/Sederajat",
    universitas: "Universitas/Perguruan Tinggi",
    umum: "Guru/Wali/Masyarakat Umum",
  };

const GENDER_LABELS: { [key: string]: string } = {
    "laki-laki": "Laki-laki",
    "perempuan": "Perempuan",
  };

const formatAddress = (address: any): string => {
  if (!address) return ""
  if (typeof address === "string") return address
  if (typeof address === "object" && address.street) {
    const parts = [
      address.street,
      address.rtRw ? `RT/RW ${address.rtRw}` : null,
      address.village,
      address.district,
      address.city,
      address.province,
      address.postalCode,
    ]
    return parts.filter(Boolean).join(", ")
  }
  return "Alamat tidak valid"
}

// Definisikan props untuk komponen baru kita
interface ParticipantCardProps {
  participant: Participant
  isSelected: boolean
  isTeamExpanded: boolean
  isRegistrantExpanded: boolean
  onSelectionChange: (id: string, checked: boolean) => void
  onStatusChange: (id: string, newStatus: string) => void
  onViewProof: (url: string | undefined) => void
  onToggleTeamExpansion: (id: string) => void
  onToggleRegistrantExpansion: (id: string) => void
  renderTeamMember: (member: TeamMember) => React.ReactNode
  GENDER_LABELS: { [key: string]: string }
}

const ParticipantCard = React.memo(
  ({
    participant,
    isSelected,
    isTeamExpanded,
    isRegistrantExpanded,
    onSelectionChange,
    onStatusChange,
    onViewProof,
    onToggleTeamExpansion,
    onToggleRegistrantExpansion,
    renderTeamMember,
    GENDER_LABELS
  }: ParticipantCardProps) => {
    // Ini adalah JSX yang Anda pindahkan dari dalam .map()
    return (
      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => {
                onSelectionChange(participant.id, !!checked)
              }}
              className="border-slate-600 mt-1"
            />
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-white font-semibold">{participant.users?.full_name || "Nama tidak tersedia"}</h3>
                <Badge className="text-xs">{participant.id}</Badge>
                <Badge
                  className={
                    participant.is_team_registration
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      : "bg-green-500/20 text-green-300 border-green-500/30"
                  }
                >
                  {participant.is_team_registration ? "Tim" : "Individu"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{participant.users?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{participant.users?.phone || "Tidak ada"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <School className="w-4 h-4 text-slate-400" />
                  <span>{participant.users?.school || "Tidak ada"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  <span>{EDUCATION_LEVEL_LABELS[participant.users?.education_level] || "N/A"}</span><span>({participant.users?.grade || "N/A"})</span>
                </div>
              </div>
              
              <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 text-sm">
                Jenis Kelamin: {GENDER_LABELS[participant.users?.gender] || "N/A"}
              </span>
              </div>

              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {(() => {
                  const statusInfo = getStatusBadge(participant.status)
                  const StatusIcon = statusInfo.icon
                  return (
                    <Badge className={statusInfo.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo.text}
                    </Badge>
                  )
                })()}
                <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                  {participant.competitions?.title || "Nama Lomba Tidak Ada"}
                </Badge>
                <span className="text-slate-400 text-sm">
                  Batch {participant.batch_number} • Terdaftar pada{" "}
                  {new Date(participant.registration_date).toLocaleDateString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Select value={participant.status} onValueChange={(value) => onStatusChange(participant.id, value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="pending" className="text-white hover:bg-slate-700">
                  Menunggu
                </SelectItem>
                <SelectItem value="approved" className="text-white hover:bg-slate-700">
                  Disetujui
                </SelectItem>
                <SelectItem value="rejected" className="text-white hover:bg-slate-700">
                  Ditolak
                </SelectItem>
              </SelectContent>
            </Select>
            {!participant.is_team_registration && participant.payment_proof_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewProof(participant.payment_proof_url)}
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                Lihat Bukti Bayar
              </Button>
            )}
          </div>
        </div>

        {participant.is_team_registration && (
          <>
            <Separator className="bg-slate-700 my-3" />
            <div className="flex items-center justify-between">
              <h4 className="text-white font-semibold">Detail Tim ({participant.team_members?.length || 0} Anggota)</h4>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleRegistrantExpansion(participant.id)}
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  {isRegistrantExpanded ? (
                    <ChevronDown className="w-4 h-4 mr-2" />
                  ) : (
                    <ChevronRight className="w-4 h-4 mr-2" />
                  )}
                  Data Pendaftar/Perwakilan
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleTeamExpansion(participant.id)}
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  {isTeamExpanded ? "Sembunyikan Anggota" : "Lihat Anggota"}
                </Button>
              </div>
            </div>

            {isRegistrantExpanded && (
              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700 my-3 space-y-2 text-sm">
                <h4 className="text-white font-semibold mb-2">Detail Akun Perwakilan/Pendaftar:</h4>
                <div className="flex items-center gap-2 text-slate-300">
                  <User className="w-4 h-4" />
                  <span>{participant.users?.full_name}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <VenusAndMars className="w-4 h-4" />
                  <span>{[GENDER_LABELS[participant.users?.gender]]}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-4 h-4" />
                  <span>{participant.users?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-4 h-4" />
                  <span>{participant.users?.phone}</span>
                </div>
              </div>
            )}

            {isTeamExpanded && (
              <div className="mt-3 space-y-3">{participant.team_members?.map((member) => renderTeamMember(member))}</div>
            )}
          </>
        )}
      </div>
    )
  },
)

export function AdminPanel({ userData }: AdminPanelProps) {
  const { toast } = useToast()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [bulkStatus, setBulkStatus] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [isProofModalOpen, setIsProofModalOpen] = useState(false)
  const [currentProofUrl, setCurrentProofUrl] = useState("")
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set())
  const [expandedRegistrants, setExpandedRegistrants] = useState<Set<string>>(new Set())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "registration_date", direction: "desc" })
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [pendingBulkAction, setPendingBulkAction] = useState<{ action: string; count: number } | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [searchTerm, setSearchTerm] = useState("")

      // BUAT FUNGSI STABIL INI JIKA BELUM ADA
    // Ini penting agar memoization bekerja dengan baik.
    const handleSelectionChange = useCallback((id: string, checked: boolean) => {
        setSelectedParticipants(prev => {
          if (checked) {
            // Pastikan tidak ada duplikat
            return [...new Set([...prev, id])];
          } else {
            return prev.filter(pId => pId !== id);
          }
        });
    }, []);

    const handleViewProof = useCallback(async (url: string | undefined) => {
        if (!url) return;
        
        // Ekstrak HANYA nama file dari URL
        const urlParts = url.split("/");
        const filePath = urlParts[urlParts.length - 1]; 

        if (!filePath) {
          toast({ title: "URL Bukti pembayaran tidak valid.", variant: "destructive" });
          return;
        }

        try {
          const response = await fetch(`/api/storage/signed-url?filePath=${encodeURIComponent(filePath)}`);
          if (!response.ok) {
            const errorData = await response.json();
            toast({ title: `Gagal mendapatkan URL: ${errorData.error || 'Unknown error'}`, variant: "destructive"});
            return;
          }

          const { signedUrl } = await response.json();
          const isPdf = url.toLowerCase().endsWith(".pdf");

          if (isPdf) {
            window.open(signedUrl, '_blank', 'noopener,noreferrer');
          } else {
            setCurrentProofUrl(signedUrl);
            setIsProofModalOpen(true);
          }

        } catch (error) {
          console.error("Error fetching signed URL:", error);
          toast({ title: "Terjadi kesalahan saat mengambil bukti pembayaran", variant: "destructive" });
        }
    }, [toast]);

  // Enhanced filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    competition: "all",
    batch: "all",
    registrationType: "all",
    dateRange: { from: undefined, to: undefined },
    school: "",
    grade: "",
  })

  const EDUCATION_LEVEL_LABELS: { [key: string]: string } = {
    tk: "TK/Sederajat",
    sd: "SD/Sederajat",
    smp: "SMP/Sederajat",
    sma: "SMA/Sederajat",
    universitas: "Universitas/Perguruan Tinggi",
    umum: "Guru/Wali/Masyarakat Umum",
  }

  const GENDER_LABELS: { [key: string]: string } = {
    "laki-laki": "Laki-laki",
    perempuan: "Perempuan",
  }

  // Debounce effect for search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }))
    }, 300) // 300ms delay

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm])

  // Auto-refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(() => {
        handleRefresh()
      }, 30000) // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const toggleRegistrantExpansion = (participantId: string) => {
    const newExpanded = new Set(expandedRegistrants)
    if (newExpanded.has(participantId)) {
      newExpanded.delete(participantId)
    } else {
      newExpanded.add(participantId)
    }
    setExpandedRegistrants(newExpanded)
  }

  const formatAddress = (address: any): string => {
    if (!address) return ""

    if (typeof address === "string") {
      return address
    }

    if (typeof address === "object" && address.street) {
      const parts = [
        address.street,
        address.rtRw ? `RT/RW ${address.rtRw}` : null,
        address.village,
        address.district,
        address.city,
        address.province,
        address.postalCode,
      ]
      return parts.filter(Boolean).join(", ")
    }

    return "Alamat tidak valid"
  }

  const fetchData = useCallback(async () => {
    try {
      const participantsResponse = await fetch("/api/admin/participants")
      if (participantsResponse.ok) {
        const { participants } = await participantsResponse.json()
        setParticipants(participants)
      }

      const competitionsResponse = await fetch("/api/competitions")
      if (competitionsResponse.ok) {
        const { competitions } = await competitionsResponse.json()
        const filteredCompetitions = competitions.filter(
          (comp: any) => comp.id !== "computer-science" && !comp.title.includes("Robotik"),
        )
        setCompetitions(filteredCompetitions)
      }
      setLastRefresh(new Date())
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Gagal memuat data",
        description: "Terjadi kesalahan saat mengambil data dari server",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [toast])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await fetchData()
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Enhanced analytics calculations
  const analytics = useMemo(() => {
    const totalParticipants = participants.length
    const individualCount = participants.filter((p) => !p.is_team_registration).length
    const teamCount = participants.filter((p) => p.is_team_registration).length
    const teamMembersCount = participants
      .filter((p) => p.is_team_registration)
      .reduce((sum, p) => sum + (p.team_members?.length || 0), 0)

    const statusBreakdown = {
      pending: participants.filter((p) => p.status === "pending").length,
      approved: participants.filter((p) => p.status === "approved").length,
      rejected: participants.filter((p) => p.status === "rejected").length,
    }

    const competitionBreakdown = competitions.map((comp) => ({
      id: comp.id,
      title: comp.title,
      count: participants.filter((p) => p.competition_id === comp.id).length,
      approved: participants.filter((p) => p.competition_id === comp.id && p.status === "approved").length,
    }))

    const batchBreakdown = Array.from(new Set(participants.map((p) => p.batch_number)))
      .sort((a, b) => a - b)
      .map((batch) => ({
        batch,
        count: participants.filter((p) => p.batch_number === batch).length,
        approved: participants.filter((p) => p.batch_number === batch && p.status === "approved").length,
      }))

    const recentRegistrations = participants.filter((p) => {
      const regDate = new Date(p.registration_date)
      const dayAgo = new Date()
      dayAgo.setDate(dayAgo.getDate() - 1)
      return regDate > dayAgo
    }).length

    return {
      totalParticipants,
      individualCount,
      teamCount,
      teamMembersCount,
      statusBreakdown,
      competitionBreakdown,
      batchBreakdown,
      recentRegistrations,
      approvalRate: totalParticipants > 0 ? Math.round((statusBreakdown.approved / totalParticipants) * 100) : 0,
    }
  }, [participants, competitions])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return { text: "Disetujui", color: "bg-green-500/20 text-green-300 border-green-500/30", icon: CheckCircle }
      case "pending":
        return { text: "Menunggu", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", icon: Clock }
      case "rejected":
        return { text: "Ditolak", color: "bg-red-500/20 text-red-300 border-red-500/30", icon: XCircle }
      default:
        return { text: "Menunggu", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", icon: Clock }
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "leader":
        return { text: "Ketua Tim", color: "bg-purple-500/20 text-purple-300 border-purple-500/30", icon: Crown }
      case "member1":
        return { text: "Anggota 1", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: UserCheck }
      case "member2":
        return { text: "Anggota 2", color: "bg-green-500/20 text-green-300 border-green-500/30", icon: UserCheck }
      default:
        return { text: "Anggota", color: "bg-slate-500/20 text-slate-300 border-slate-500/30", icon: User }
    }
  }

  const handleStatusChange = async (participantId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/admin/participants/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantIds: [participantId],
          status: newStatus,
        }),
      })

      if (response.ok) {
        setParticipants((prev) =>
          prev.map((p: Participant) => (p.id === participantId ? { ...p, status: newStatus } : p)),
        )
        toast({
          title: "Status berhasil diubah",
          variant: "default",
        })
      } else {
        toast({
          title: "Gagal mengubah status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Terjadi kesalahan saat mengubah status",
        variant: "destructive",
      })
    }
  }

  const handleBulkStatusChange = async () => {
    if (selectedParticipants.length === 0 || !bulkStatus) {
      toast({
        title: "Pilih peserta dan status terlebih dahulu",
        variant: "destructive",
      })
      return
    }

    setPendingBulkAction({ action: bulkStatus, count: selectedParticipants.length })
    setIsConfirmDialogOpen(true)
  }

  const confirmBulkAction = async () => {
    if (!pendingBulkAction) return

    const previousParticipants = [...participants]
    const participantIds = [...selectedParticipants]
    const newStatus = pendingBulkAction.action

    setParticipants((prevParticipants) =>
      prevParticipants.map((participant) =>
        participantIds.includes(participant.id) ? { ...participant, status: newStatus } : participant,
      ),
    )
    setSelectedParticipants([])
    setBulkStatus("")
    setIsConfirmDialogOpen(false)
    setPendingBulkAction(null)

    try {
      const response = await fetch("/api/admin/participants/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantIds: participantIds,
          status: newStatus,
        }),
      })

      if (response.ok) {
        toast({
          title: `Berhasil mengubah status ${participantIds.length} peserta`,
          variant: "default",
        })
      } else {
        toast({
          title: "Gagal mengubah status massal",
          description: "Mengembalikan data ke kondisi semula.",
          variant: "destructive",
        })
        setParticipants(previousParticipants)
      }
    } catch (error) {
      console.error("Error updating bulk status:", error)
      toast({
        title: "Terjadi kesalahan saat mengubah status",
        description: "Periksa koneksi Anda dan coba lagi.",
        variant: "destructive",
      })
      setParticipants(previousParticipants)
    }
  }

  const exportToXlsx = (competitionId: string) => {
    setIsExporting(true)
    try {
      const competitionParticipants = getParticipantsByCompetition(competitionId)
      const competition = competitions.find((c: any) => c.id === competitionId)
      let filesExported = 0

      const individualParticipants = competitionParticipants.filter((p) => !p.is_team_registration)
      const teamParticipants = competitionParticipants.filter((p) => p.is_team_registration)

      if (teamParticipants.length > 0) {
        const teamHeaders = [
          "ID Registrasi",
          "Kompetisi",
          "Status",
          "Batch",
          "Tanggal Daftar",
          "Nama Perwakilan",
          "Email Perwakilan",
          "No. Telp Perwakilan",
          "Role Anggota",
          "Nama Lengkap Anggota",
          "Email Anggota",
          "No. Telepon Anggota",
          "Sekolah",
          "Kelas",
          "Alamat",
          "Jenis Kelamin",
        ]
        const teamDataRows = teamParticipants.flatMap(
          (participant) =>
            participant.team_members?.map((member) => [
              participant.id,
              participant.competitions?.title,
              participant.status,
              participant.batch_number,
              new Date(participant.registration_date).toLocaleDateString("id-ID"),
              participant.users?.full_name,
              participant.users?.email,
              participant.users?.phone,
              member.role,
              member.full_name,
              member.email,
              member.phone,
              member.school,
              member.grade,
              formatAddress(member.address),
              member.gender,
            ]) || [],
        )

        const teamWorksheet = XLSX.utils.aoa_to_sheet([teamHeaders, ...teamDataRows])
        teamWorksheet["!cols"] = teamHeaders.map((h) => ({
          wch: h.includes("Nama") || h.includes("Alamat") || h.includes("Email") ? 30 : 18,
        }))
        const teamWorkbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(teamWorkbook, teamWorksheet, "Peserta Tim")

        XLSX.writeFile(
          teamWorkbook,
          `${competition?.title || "Semua"}_Peserta_Tim_${new Date().toISOString().split("T")[0]}.xlsx`,
        )
        filesExported++
      }

      if (individualParticipants.length > 0) {
        const individualHeaders = [
          "ID Registrasi",
          "Kompetisi",
          "Status",
          "Batch",
          "Tanggal Daftar",
          "Nama Lengkap",
          "Email",
          "No. Telepon",
          "Sekolah",
          "Kelas",
          "Jenjang Pendidikan",
          "Alamat",
          "Tgl Lahir",
          "Jenis Kelamin",
        ]
        const individualDataRows = individualParticipants.map((participant) => {
          const user = participant.users
          const educationLabel = user?.education_level ? EDUCATION_LEVEL_LABELS[user.education_level] : "N/A"
          return [
            participant.id,
            participant.competitions?.title,
            participant.status,
            participant.batch_number,
            new Date(participant.registration_date).toLocaleDateString("id-ID"),
            user?.full_name,
            user?.email,
            user?.phone,
            user?.school,
            user?.grade,
            educationLabel,
            formatAddress(user?.address),
            user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString("id-ID") : "",
            user?.gender,
          ]
        })

        const individualWorksheet = XLSX.utils.aoa_to_sheet([individualHeaders, ...individualDataRows])
        individualWorksheet["!cols"] = individualHeaders.map((h) => ({
          wch: h.includes("Nama") || h.includes("Alamat") || h.includes("Email") ? 30 : 18,
        }))
        const individualWorkbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(individualWorkbook, individualWorksheet, "Peserta Individu")

        XLSX.writeFile(
          individualWorkbook,
          `${competition?.title || "Semua"}_Peserta_Individu_${new Date().toISOString().split("T")[0]}.xlsx`,
        )
        filesExported++
      }

      if (filesExported > 0) {
        toast({ title: `Berhasil mengekspor ${filesExported} file.` })
      } else {
        toast({ title: "Tidak ada data untuk diekspor", variant: "destructive" })
      }
    } catch (error) {
      console.error("Export error:", error)
      toast({ title: "Gagal mengekspor data", variant: "destructive" })
    } finally {
      setIsExporting(false)
    }
  }

  const getParticipantsByCompetition = (competitionId: string): Participant[] => {
    if (competitionId === "all") return participants
    return participants.filter((p: Participant) => p.competition_id === competitionId)
  }

  const getStatusCounts = (competitionParticipants: Participant[]) => {
    return {
      total: competitionParticipants.length,
      pending: competitionParticipants.filter((p: Participant) => p.status === "pending").length,
      approved: competitionParticipants.filter((p: Participant) => p.status === "approved").length,
      rejected: competitionParticipants.filter((p: Participant) => p.status === "rejected").length,
    }
  }

  // Enhanced filtering logic
  const filteredParticipants = useMemo(() => {
    const competitionParticipants = getParticipantsByCompetition(filters.competition)

    return competitionParticipants.filter((participant: Participant) => {
      // Search filter
      const searchMatch =
        !filters.search ||
        participant.users?.full_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        participant.users?.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        participant.users?.school?.toLowerCase().includes(filters.search.toLowerCase()) ||
        participant.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        (participant.team_members &&
          participant.team_members.some(
            (member) =>
              member.full_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
              member.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
              member.school?.toLowerCase().includes(filters.search.toLowerCase()),
          ))

      // Status filter
      const statusMatch = filters.status === "all" || participant.status === filters.status

      // Batch filter
      const batchMatch = filters.batch === "all" || participant.batch_number.toString() === filters.batch

      // Registration type filter
      const typeMatch =
        filters.registrationType === "all" ||
        (filters.registrationType === "individual" && !participant.is_team_registration) ||
        (filters.registrationType === "team" && participant.is_team_registration)

      // Date range filter
      const dateMatch =
        !filters.dateRange.from ||
        !filters.dateRange.to ||
        (new Date(participant.registration_date) >= filters.dateRange.from &&
          new Date(participant.registration_date) <= filters.dateRange.to)

      // School filter
      const schoolMatch =
        !filters.school ||
        participant.users?.school?.toLowerCase().includes(filters.school.toLowerCase()) ||
        (participant.team_members &&
          participant.team_members.some((member) =>
            member.school?.toLowerCase().includes(filters.school.toLowerCase()),
          ))

      // Grade filter
      const gradeMatch =
        !filters.grade ||
        participant.users?.grade?.toLowerCase().includes(filters.grade.toLowerCase()) ||
        (participant.team_members &&
          participant.team_members.some((member) => member.grade?.toLowerCase().includes(filters.grade.toLowerCase())))

      return searchMatch && statusMatch && batchMatch && typeMatch && dateMatch && schoolMatch && gradeMatch
    })
  }, [participants, filters])

  // Sorting logic
  const sortedParticipants = useMemo(() => {
    const sorted = [...filteredParticipants].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortConfig.key) {
        case "users.full_name":
          aValue = a.users?.full_name || ""
          bValue = b.users?.full_name || ""
          break
        case "users.email":
          aValue = a.users?.email || ""
          bValue = b.users?.email || ""
          break
        case "users.school":
          aValue = a.users?.school || ""
          bValue = b.users?.school || ""
          break
        case "registration_date":
          aValue = new Date(a.registration_date)
          bValue = new Date(b.registration_date)
          break
        default:
          aValue = a[sortConfig.key as keyof Participant]
          bValue = b[sortConfig.key as keyof Participant]
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
      return 0
    })

    return sorted
  }, [filteredParticipants, sortConfig])

  // Pagination
  const paginatedParticipants = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedParticipants.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [sortedParticipants, currentPage])

  const totalPages = Math.ceil(sortedParticipants.length / ITEMS_PER_PAGE)

  const handleSort = (key: SortConfig["key"]) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const toggleTeamExpansion = (participantId: string) => {
    const newExpanded = new Set(expandedTeams)
    if (newExpanded.has(participantId)) {
      newExpanded.delete(participantId)
    } else {
      newExpanded.add(participantId)
    }
    setExpandedTeams(newExpanded)
  }

  const renderTeamMember = (member: TeamMember) => {
    const roleBadge = getRoleBadge(member.role)
    const RoleIcon = roleBadge.icon

    return (
      <div key={member.id} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <RoleIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-white font-semibold">{member.full_name}</h4>
            <Badge className={roleBadge.color}>
              <RoleIcon className="w-3 h-3 mr-1" />
              {roleBadge.text}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <Mail className="w-4 h-4 text-slate-400" />
            <span>{member.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Phone className="w-4 h-4 text-slate-400" />
            <span>{member.phone || "Tidak ada"}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <School className="w-4 h-4 text-slate-400" />
            <span>{member.school || "Tidak ada"}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <GraduationCap className="w-4 h-4 text-slate-400" />
            <span>{member.grade || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{member.address || "Tidak ada"}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <VenusAndMars className="w-4 h-4 text-slate-400" />
            <span>{member.gender || "Tidak ada"}</span>
          </div>
        </div>

        {member.identity_type && (
          <div className="mt-2 text-sm text-slate-400">
            <span>ID: {member.identity_type}</span>
            {member.student_id && <span> • {member.student_id}</span>}
          </div>
        )}
      </div>
    )
  }

  const clearAllFilters = () => {
    setFilters({
      search: "",
      status: "all",
      competition: "all",
      batch: "all",
      registrationType: "all",
      dateRange: { from: undefined, to: undefined },
      school: "",
      grade: "",
    })
    setCurrentPage(1)
  }

  const selectAllVisible = () => {
    const visibleIds = paginatedParticipants.map((p) => p.id)
    setSelectedParticipants((prev) => [...new Set([...prev, ...visibleIds])])
  }

  const deselectAll = () => {
    setSelectedParticipants([])
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="animate-pulse bg-slate-800 rounded-lg">
          <div className="p-4 border-b border-slate-700">
            <div className="flex space-x-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-slate-700 rounded w-20"></div>
              ))}
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-slate-700 rounded-lg p-4">
                  <div className="h-8 bg-slate-600 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-slate-600 rounded w-1/3"></div>
                </div>
              ))}
            </div>
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Shield className="w-8 h-8 text-purple-400" />
            Manajemen Peserta
          </h1>
          <p className="text-slate-400">
            Kelola pendaftaran peserta berdasarkan kompetisi • Terakhir diperbarui:{" "}
            {format(lastRefresh, "HH:mm:ss", { locale: id })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`border-slate-600 ${autoRefresh ? "bg-green-600/20 text-green-300" : "text-white"}`}
          >
            <Activity className="w-4 h-4 mr-2" />
            Auto Refresh {autoRefresh ? "ON" : "OFF"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-400" />
              Dashboard Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{analytics.totalParticipants}</div>
                <div className="text-slate-400 text-sm">Total Peserta</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-300">{analytics.individualCount}</div>
                <div className="text-slate-400 text-sm">Individu</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-300">{analytics.teamCount}</div>
                <div className="text-slate-400 text-sm">Tim</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-300">{analytics.teamMembersCount}</div>
                <div className="text-slate-400 text-sm">Anggota Tim</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-300">{analytics.recentRegistrations}</div>
                <div className="text-slate-400 text-sm">24 Jam Terakhir</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-300">{analytics.approvalRate}%</div>
                <div className="text-slate-400 text-sm">Tingkat Persetujuan</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Competition Breakdown */}
              <div>
                <h4 className="text-white font-semibold mb-3">Breakdown per Kompetisi</h4>
                <div className="space-y-2">
                  {analytics.competitionBreakdown.map((comp) => (
                    <div key={comp.id} className="flex items-center justify-between bg-slate-800/30 rounded p-2">
                      <span className="text-slate-300 text-sm">{comp.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {comp.count} total
                        </Badge>
                        <Badge className="bg-green-500/20 text-green-300 text-xs">{comp.approved} approved</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Batch Breakdown */}
              <div>
                <h4 className="text-white font-semibold mb-3">Breakdown per Batch</h4>
                <div className="space-y-2">
                  {analytics.batchBreakdown.map((batch) => (
                    <div key={batch.batch} className="flex items-center justify-between bg-slate-800/30 rounded p-2">
                      <span className="text-slate-300 text-sm">Batch {batch.batch}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {batch.count} total
                        </Badge>
                        <Badge className="bg-green-500/20 text-green-300 text-xs">{batch.approved} approved</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs
        value={filters.competition}
        onValueChange={(value) => setFilters((prev) => ({ ...prev, competition: value }))}
      >
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 bg-slate-800 mb-6 overflow-x-auto">
          <TabsTrigger value="all" className="data-[state=active]:bg-slate-700 text-xs">
            Semua
          </TabsTrigger>
          {competitions.map((competition: any) => (
            <TabsTrigger
              key={competition.id}
              value={competition.id}
              className="data-[state=active]:bg-slate-700 text-xs whitespace-nowrap"
            >
              <Trophy className="w-3 h-3 mr-1" />
              {competition.title.split(" ")[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {["all", ...competitions.map((c: any) => c.id)].map((competitionId) => {
          const competitionParticipants = getParticipantsByCompetition(competitionId)
          const statusCounts = getStatusCounts(competitionParticipants)
          const competition = competitions.find((c: any) => c.id === competitionId)

          return (
            <TabsContent key={competitionId} value={competitionId} className="space-y-6">
              {/* Competition Header */}
              {competition && (
                <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-purple-400" />
                          {competition.title}
                        </CardTitle>
                        <p className="text-slate-300 mt-2">{competition.description}</p>
                        <Badge className="mt-2 bg-purple-500/20 text-purple-300 border-purple-500/30">
                          {competition.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.print()}
                          className="border-slate-600 text-white hover:bg-slate-700"
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          Print
                        </Button>
                        <Button
                          onClick={() => exportToXlsx(competitionId)}
                          disabled={isExporting || competitionParticipants.length === 0}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isExporting ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Export...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <FileSpreadsheet className="w-4 h-4" />
                              Export Excel
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )}

              {/* Enhanced Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900/50 border-slate-700 hover:bg-slate-900/70 transition-colors">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-white">{statusCounts.total}</div>
                    <div className="text-slate-400 text-sm">Total Peserta</div>
                    <div className="mt-2">
                      <Progress value={100} className="h-1" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20 transition-colors">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-300">{statusCounts.pending}</div>
                    <div className="text-slate-400 text-sm">Menunggu</div>
                    <div className="mt-2">
                      <Progress
                        value={statusCounts.total > 0 ? (statusCounts.pending / statusCounts.total) * 100 : 0}
                        className="h-1"
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-500/10 border-green-500/30 hover:bg-green-500/20 transition-colors">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-300">{statusCounts.approved}</div>
                    <div className="text-slate-400 text-sm">Disetujui</div>
                    <div className="mt-2">
                      <Progress
                        value={statusCounts.total > 0 ? (statusCounts.approved / statusCounts.total) * 100 : 0}
                        className="h-1"
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-red-500/10 border-red-500/30 hover:bg-red-500/20 transition-colors">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-300">{statusCounts.rejected}</div>
                    <div className="text-slate-400 text-sm">Ditolak</div>
                    <div className="mt-2">
                      <Progress
                        value={statusCounts.total > 0 ? (statusCounts.rejected / statusCounts.total) * 100 : 0}
                        className="h-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Filters */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <Filter className="w-5 h-5" />
                      Filter & Pencarian
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className="border-slate-600 text-white hover:bg-slate-700"
                      >
                        {showAdvancedFilters ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                        {showAdvancedFilters ? "Sembunyikan" : "Tampilkan"} Filter Lanjutan
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reset Filter
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Basic Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <Label className="text-white text-sm">Cari Peserta</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          placeholder="Nama, email, ID, sekolah..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-slate-800 border-slate-600 text-white pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-white text-sm">Status</Label>
                      <Select
                        value={filters.status}
                        onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="all" className="text-white hover:bg-slate-700">
                            Semua Status
                          </SelectItem>
                          <SelectItem value="pending" className="text-white hover:bg-slate-700">
                            Menunggu
                          </SelectItem>
                          <SelectItem value="approved" className="text-white hover:bg-slate-700">
                            Disetujui
                          </SelectItem>
                          <SelectItem value="rejected" className="text-white hover:bg-slate-700">
                            Ditolak
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white text-sm">Tipe Registrasi</Label>
                      <Select
                        value={filters.registrationType}
                        onValueChange={(value) => setFilters((prev) => ({ ...prev, registrationType: value }))}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="all" className="text-white hover:bg-slate-700">
                            Semua Tipe
                          </SelectItem>
                          <SelectItem value="individual" className="text-white hover:bg-slate-700">
                            Individu
                          </SelectItem>
                          <SelectItem value="team" className="text-white hover:bg-slate-700">
                            Tim
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white text-sm">Batch</Label>
                      <Select
                        value={filters.batch}
                        onValueChange={(value) => setFilters((prev) => ({ ...prev, batch: value }))}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="all" className="text-white hover:bg-slate-700">
                            Semua Batch
                          </SelectItem>
                          {Array.from(new Set(participants.map((p) => p.batch_number)))
                            .sort((a, b) => a - b)
                            .map((batch) => (
                              <SelectItem
                                key={batch}
                                value={batch.toString()}
                                className="text-white hover:bg-slate-700"
                              >
                                Batch {batch}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white text-sm">Ubah Status Massal</Label>
                      <Select value={bulkStatus} onValueChange={setBulkStatus}>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="pending" className="text-white hover:bg-slate-700">
                            Menunggu
                          </SelectItem>
                          <SelectItem value="approved" className="text-white hover:bg-slate-700">
                            Disetujui
                          </SelectItem>
                          <SelectItem value="rejected" className="text-white hover:bg-slate-700">
                            Ditolak
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Advanced Filters */}
                  {showAdvancedFilters && (
                    <>
                      <Separator className="bg-slate-700" />
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-white text-sm">Sekolah</Label>
                          <Input
                            placeholder="Cari berdasarkan sekolah..."
                            value={filters.school}
                            onChange={(e) => setFilters((prev) => ({ ...prev, school: e.target.value }))}
                            className="bg-slate-800 border-slate-600 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-white text-sm">Kelas</Label>
                          <Input
                            placeholder="Cari berdasarkan kelas..."
                            value={filters.grade}
                            onChange={(e) => setFilters((prev) => ({ ...prev, grade: e.target.value }))}
                            className="bg-slate-800 border-slate-600 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-white text-sm">Tanggal Mulai</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filters.dateRange.from
                                  ? format(filters.dateRange.from, "PPP", { locale: id })
                                  : "Pilih tanggal"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={filters.dateRange.from}
                                onSelect={(date) =>
                                  setFilters((prev) => ({
                                    ...prev,
                                    dateRange: { ...prev.dateRange, from: date },
                                  }))
                                }
                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                initialFocus
                                className="bg-slate-800 text-white"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label className="text-white text-sm">Tanggal Akhir</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filters.dateRange.to
                                  ? format(filters.dateRange.to, "PPP", { locale: id })
                                  : "Pilih tanggal"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={filters.dateRange.to}
                                onSelect={(date) =>
                                  setFilters((prev) => ({
                                    ...prev,
                                    dateRange: { ...prev.dateRange, to: date },
                                  }))
                                }
                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                initialFocus
                                className="bg-slate-800 text-white"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Bulk Actions */}
                  <Separator className="bg-slate-700" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={
                            selectedParticipants.length === paginatedParticipants.length &&
                            paginatedParticipants.length > 0
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              selectAllVisible()
                            } else {
                              deselectAll()
                            }
                          }}
                          className="border-slate-600"
                        />
                        <Label className="text-white text-sm">
                          Pilih Semua ({selectedParticipants.length} dipilih)
                        </Label>
                      </div>
                      {selectedParticipants.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={selectAllVisible}
                            className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Pilih Halaman Ini
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={deselectAll}
                            className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
                          >
                            <Minus className="w-4 h-4 mr-1" />
                            Batal Pilih Semua
                          </Button>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={handleBulkStatusChange}
                      disabled={selectedParticipants.length === 0 || !bulkStatus}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <CheckSquare className="w-4 h-4 mr-2" />
                      Ubah Status ({selectedParticipants.length})
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Results Summary */}
              {filteredParticipants.length !== competitionParticipants.length && (
                <Alert className="bg-blue-500/10 border-blue-500/30">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-blue-300">
                    Menampilkan {filteredParticipants.length} dari {competitionParticipants.length} peserta berdasarkan
                    filter yang diterapkan.
                  </AlertDescription>
                </Alert>
              )}

              {/* Participants Management */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Daftar Peserta ({filteredParticipants.length})
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {/* Sorting Controls */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSort("users.full_name")}
                          className="border-slate-600 text-white hover:bg-slate-700"
                        >
                          <ArrowUpDown className="w-4 h-4 mr-1" />
                          Nama
                          {sortConfig.key === "users.full_name" &&
                            (sortConfig.direction === "asc" ? (
                              <SortAsc className="w-3 h-3 ml-1" />
                            ) : (
                              <SortDesc className="w-3 h-3 ml-1" />
                            ))}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSort("registration_date")}
                          className="border-slate-600 text-white hover:bg-slate-700"
                        >
                          <ArrowUpDown className="w-4 h-4 mr-1" />
                          Tanggal
                          {sortConfig.key === "registration_date" &&
                            (sortConfig.direction === "asc" ? (
                              <SortAsc className="w-3 h-3 ml-1" />
                            ) : (
                              <SortDesc className="w-3 h-3 ml-1" />
                            ))}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSort("status")}
                          className="border-slate-600 text-white hover:bg-slate-700"
                        >
                          <ArrowUpDown className="w-4 h-4 mr-1" />
                          Status
                          {sortConfig.key === "status" &&
                            (sortConfig.direction === "asc" ? (
                              <SortAsc className="w-3 h-3 ml-1" />
                            ) : (
                              <SortDesc className="w-3 h-3 ml-1" />
                            ))}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredParticipants.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <div className="text-slate-400 text-lg mb-2">
                        {competitionParticipants.length === 0
                          ? "Belum ada peserta yang mendaftar untuk kompetisi ini"
                          : "Tidak ada peserta yang sesuai dengan filter"}
                      </div>
                      {competitionParticipants.length > 0 && (
                        <Button
                          variant="outline"
                          onClick={clearAllFilters}
                          className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
                        >
                          Reset Filter
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                        <div className="space-y-4">
                            {paginatedParticipants.map((participant: Participant) => (
                                <ParticipantCard
                                  key={participant.id}
                                  participant={participant}
                                  isSelected={selectedParticipants.includes(participant.id)}
                                  isTeamExpanded={expandedTeams.has(participant.id)}
                                  isRegistrantExpanded={expandedRegistrants.has(participant.id)}
                                  onSelectionChange={handleSelectionChange}
                                  onStatusChange={handleStatusChange} // Anda sudah punya ini di-wrap useCallback
                                  onViewProof={handleViewProof}
                                  onToggleTeamExpansion={toggleTeamExpansion} // Anda sudah punya ini di-wrap useCallback
                                  onToggleRegistrantExpansion={toggleRegistrantExpansion} // Anda sudah punya ini di-wrap useCallback
                                  renderTeamMember={renderTeamMember} // renderTeamMember juga sudah di-wrap useCallback
                                  GENDER_LABELS={GENDER_LABELS}
                                />
                            ))}
                        </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                          <Button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            variant="outline"
                            className="border-slate-600 text-white hover:bg-slate-700"
                          >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Sebelumnya
                          </Button>
                          <span className="text-slate-400 text-sm">
                            Halaman {currentPage} dari {totalPages}
                          </span>
                          <Button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            variant="outline"
                            className="border-slate-600 text-white hover:bg-slate-700"
                          >
                            Selanjutnya
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>

      {/* Proof Modal */}
      <Dialog open={isProofModalOpen} onOpenChange={setIsProofModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-600 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bukti Pembayaran</DialogTitle>
          </DialogHeader>
          {currentProofUrl ? (
            <img src={currentProofUrl || "/placeholder.svg"} alt="Bukti Pembayaran" className="rounded-md" />
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Tidak ada bukti pembayaran yang tersedia.</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button onClick={() => setIsProofModalOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-600 text-white">
          <DialogHeader>
            <DialogTitle>Konfirmasi Aksi</DialogTitle>
          </DialogHeader>
          {pendingBulkAction && (
            <p>
              Anda yakin ingin mengubah status {pendingBulkAction.count} peserta menjadi "{pendingBulkAction.action}"?
            </p>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsConfirmDialogOpen(false)}>
              Batal
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={confirmBulkAction}>
              Konfirmasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
