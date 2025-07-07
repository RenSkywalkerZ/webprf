// components/admin-panel.tsx

"use client"
import * as XLSX from "xlsx"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
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

export function AdminPanel({ userData }: AdminPanelProps) {
  const { toast } = useToast()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [bulkStatus, setBulkStatus] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedCompetition, setSelectedCompetition] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [isProofModalOpen, setIsProofModalOpen] = useState(false)
  const [currentProofUrl, setCurrentProofUrl] = useState("")
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set())


  //  Fungsi bantuan untuk memformat alamat dengan aman
  const formatAddress = (address: any): string => {
    if (!address) return "";
    
    // Untuk anggota tim, di mana alamat adalah string biasa
    if (typeof address === 'string') {
      return address;
    }

    // Untuk pendaftar individu, di mana alamat adalah objek
    if (typeof address === 'object' && address.street) {
      const parts = [
        address.street,
        address.rtRw ? `RT/RW ${address.rtRw}` : null,
        address.village,
        address.district,
        address.city,
        address.province,
        address.postalCode,
      ];
      return parts.filter(Boolean).join(', ');
    }

    return "Alamat tidak valid";
  };


  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch participants (sudah termasuk data anggota tim dari API)
      const participantsResponse = await fetch("/api/admin/participants")
      if (participantsResponse.ok) {
        const { participants } = await participantsResponse.json()
        setParticipants(participants)
      }

      // Fetch competitions
      const competitionsResponse = await fetch("/api/competitions")
      if (competitionsResponse.ok) {
        const { competitions } = await competitionsResponse.json()
        const filteredCompetitions = competitions.filter(
          (comp: any) => comp.id !== "computer-science" && !comp.title.includes("Robotik"),
        )
        setCompetitions(filteredCompetitions)
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
        return { text: "Menunggu", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", icon: Clock }
      case "rejected":
        return { text: "Ditolak", color: "bg-red-500/20 text-red-300 border-red-500/30", icon: XCircle }
      default:
        return { text: "Menunggu", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", icon: Clock }
    }
  }
  
  // ... sisa kode tidak perlu diubah, biarkan sama seperti sebelumnya ...

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

    try {
      const response = await fetch("/api/admin/participants/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantIds: selectedParticipants,
          status: bulkStatus,
        }),
      })

      if (response.ok) {
        setParticipants((prev) =>
          prev.map((p: Participant) => (selectedParticipants.includes(p.id) ? { ...p, status: bulkStatus } : p)),
        )
        setSelectedParticipants([])
        setBulkStatus("")
        toast({
          title: `Berhasil mengubah status ${selectedParticipants.length} peserta`,
          variant: "default",
        })
      } else {
        toast({
          title: "Gagal mengubah status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating bulk status:", error)
      toast({
        title: "Terjadi kesalahan saat mengubah status",
        variant: "destructive",
      })
    }
  }

  // FUNGSI EKSPOR CSV YANG TELAH DIPERBAIKI
  const exportToXlsx = (competitionId: string) => {
  setIsExporting(true);
  try {
    const competitionParticipants = getParticipantsByCompetition(competitionId);
    const competition = competitions.find((c: any) => c.id === competitionId);

    // Langkah 1: Cek apakah SEMUA peserta dalam ekspor ini adalah tim
    const areAllTeams =
      competitionParticipants.length > 0 &&
      competitionParticipants.every(p => p.is_team_registration);

    // Langkah 2: Buat headers (judul kolom) secara dinamis
    let headers;
    if (areAllTeams) {
      // Jika semua peserta adalah tim, maka HILANGKAN kolom "Tanggal Lahir"
      headers = [
        "ID Registrasi", "Nama Tim / Pendaftar", "Jenis Pendaftaran", "Role Tim",
        "Nama Lengkap Anggota", "Email", "No. Telepon", "Sekolah", "Kelas",
        "Alamat", "Jenis Kelamin", "Batch", "Tanggal Daftar",
        "Status", "Kompetisi",
      ];
    } else {
      // Jika ada peserta individu, kolom "Tanggal Lahir" TETAP ADA
      headers = [
        "ID Registrasi", "Nama Tim / Pendaftar", "Jenis Pendaftaran", "Role Tim",
        "Nama Lengkap Anggota", "Email", "No. Telepon", "Sekolah", "Kelas",
        "Alamat", "Tanggal Lahir", "Jenis Kelamin", "Batch", "Tanggal Daftar",
        "Status", "Kompetisi",
      ];
    }

    // Langkah 3: Siapkan baris data sesuai dengan headers yang telah ditentukan
    const dataRows = competitionParticipants.flatMap((participant) => {
      const commonData = {
        registrationId: participant.id,
        teamName: participant.users?.full_name || "N/A",
        batch: participant.batch_number,
        registrationDate: new Date(participant.registration_date).toLocaleDateString("id-ID"),
        status: participant.status === "approved" ? "Disetujui" : participant.status === "pending" ? "Menunggu" : "Ditolak",
        competition: participant.competitions?.title || "N/A",
      };

      if (participant.is_team_registration && participant.team_members && participant.team_members.length > 0) {
        return participant.team_members.map(member => {
          if (areAllTeams) {
            // Jika semua peserta adalah tim, baris data dibuat TANPA kolom tanggal lahir
            return [
              commonData.registrationId, commonData.teamName, "Tim", member.role || "Anggota",
              member.full_name || "", member.email || "", member.phone || "", member.school || "",
              member.grade || "", formatAddress(member.address),
              member.gender || "", commonData.batch, commonData.registrationDate,
              commonData.status, commonData.competition,
            ];
          } else {
            // Jika ada campuran (individu + tim), baris tim perlu placeholder kosong
            // agar sejajar dengan header yang memiliki kolom 'Tanggal Lahir'
            return [
              commonData.registrationId, commonData.teamName, "Tim", member.role || "Anggota",
              member.full_name || "", member.email || "", member.phone || "", member.school || "",
              member.grade || "", formatAddress(member.address),
              "", // Placeholder kosong untuk 'Tanggal Lahir'
              member.gender || "", commonData.batch, commonData.registrationDate,
              commonData.status, commonData.competition,
            ];
          }
        });
      } else {
        // Untuk peserta individu, data 'Tanggal Lahir' selalu disertakan
        const user = participant.users;
        return [[
          commonData.registrationId, commonData.teamName, "Individu", "Individu",
          user?.full_name || "", user?.email || "", user?.phone || "", user?.school || "",
          user?.grade || "", formatAddress(user?.address),
          user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString("id-ID") : "",
          user?.gender || "", commonData.batch, commonData.registrationDate,
          commonData.status, commonData.competition,
        ]];
      }
    });

    // Langkah 4: Buat & Unduh File Excel (tidak ada perubahan di sini)
    const finalData = [headers, ...dataRows];
    const worksheet = XLSX.utils.aoa_to_sheet(finalData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Peserta");
    
    const columnWidths = headers.map((header) => ({
      wch: header.toLowerCase().includes('nama') || header.toLowerCase().includes('alamat') ? 30 : 15,
    }));
    worksheet["!cols"] = columnWidths;

    const fileName = `${competition?.title || "Kompetisi"}_Peserta_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: `Data peserta ${competition?.title} berhasil diekspor!`,
      variant: "default",
    });

  } catch (error) {
    console.error("Export error:", error);
    toast({
      title: "Gagal mengekspor data",
      description: "Terjadi kesalahan saat membuat file Excel.",
      variant: "destructive",
    });
  } finally {
    setIsExporting(false);
  }
};

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

  const filteredParticipants = (competitionParticipants: Participant[]) => {
    return competitionParticipants.filter((participant: Participant) => {
      const matchesSearch =
        participant.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.users?.school?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (participant.team_members &&
          participant.team_members.some(
            (member) =>
              member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              member.school?.toLowerCase().includes(searchTerm.toLowerCase()),
          ))
      const matchesStatus = filterStatus === "all" || participant.status === filterStatus
      return matchesSearch && matchesStatus
    })
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
            <User className="w-4 h-4 text-slate-400" />
            <span>Kelas {member.grade || "Tidak ada"}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>
              {member.address || "Tidak ada"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>
              {member.gender || "Tidak ada"}
            </span>
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
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Shield className="w-8 h-8 text-purple-400" />
          Manajemen Peserta
        </h1>
        <p className="text-slate-400">Kelola pendaftaran peserta berdasarkan kompetisi (Individu & Tim)</p>
      </div>

      <Tabs value={selectedCompetition} onValueChange={setSelectedCompetition} className="w-full">
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
          const filtered = filteredParticipants(competitionParticipants)

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
                            Export Excel (.xlsx)
                          </div>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              )}

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-white">{statusCounts.total}</div>
                    <div className="text-slate-400 text-sm">Total Peserta</div>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-500/10 border-yellow-500/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-300">{statusCounts.pending}</div>
                    <div className="text-slate-400 text-sm">Menunggu</div>
                  </CardContent>
                </Card>
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-300">{statusCounts.approved}</div>
                    <div className="text-slate-400 text-sm">Disetujui</div>
                  </CardContent>
                </Card>
                <Card className="bg-red-500/10 border-red-500/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-300">{statusCounts.rejected}</div>
                    <div className="text-slate-400 text-sm">Ditolak</div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters and Bulk Actions */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-white text-sm">Cari Peserta</Label>
                      <Input
                        placeholder="Nama, email, atau sekolah..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white text-sm">Filter Status</Label>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
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
                    <div className="flex items-end">
                      <Button
                        onClick={handleBulkStatusChange}
                        disabled={selectedParticipants.length === 0 || !bulkStatus}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Ubah ({selectedParticipants.length})
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Participants Management */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Daftar Peserta ({filtered.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filtered.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      {competitionParticipants.length === 0
                        ? "Belum ada peserta yang mendaftar untuk kompetisi ini"
                        : "Tidak ada peserta yang sesuai dengan filter"}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filtered.map((participant: Participant) => {
                        const statusBadge = getStatusBadge(participant.status)
                        const StatusIcon = statusBadge.icon
                        const isSelected = selectedParticipants.includes(participant.id)
                        const isTeamExpanded = expandedTeams.has(participant.id)

                        return (
                          <div
                            key={participant.id}
                            className={`p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-colors border-2 ${
                              isSelected ? "border-blue-500/50" : "border-transparent"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4 flex-1">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedParticipants((prev) => [...prev, participant.id])
                                    } else {
                                      setSelectedParticipants((prev) => prev.filter((id) => id !== participant.id))
                                    }
                                  }}
                                  className="mt-1 w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                                />

                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                      {participant.is_team_registration ? (
                                        <Users className="w-5 h-5 text-white" />
                                      ) : (
                                        <User className="w-5 h-5 text-white" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h3 className="text-white font-semibold text-lg">
                                          {participant.users?.full_name}
                                        </h3>
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
                                      <Badge className={statusBadge.color}>
                                        <StatusIcon className="w-3 h-3 mr-1" />
                                        {statusBadge.text}
                                      </Badge>
                                    </div>
                                  </div>

                                  {/* Individual Registration Info */}
                                  {!participant.is_team_registration && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
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
                                        <User className="w-4 h-4 text-slate-400" />
                                        <span>Jenjang/Kelas: {participant.users?.grade || "Tidak ada"}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-slate-300">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        <span>
                                          {participant.users?.address
                                            ? `${participant.users.address.street}, ${participant.users.address.rtRw ? `RT/RW ${participant.users.address.rtRw}, ` : ""}${participant.users.address.village}, ${participant.users.address.district}, ${participant.users.address.city}, ${participant.users.address.province}, ${participant.users.address.postalCode}`
                                            : "Tidak ada"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-slate-300">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <span>
                                          Batch {participant.batch_number} •{" "}
                                          {new Date(participant.registration_date).toLocaleDateString("id-ID")}
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Team Registration Info */}
                                  {participant.is_team_registration && (
                                    <div>
                                      <div className="flex items-center gap-2 text-slate-300 mb-3">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <span>
                                          Batch {participant.batch_number} •{" "}
                                          {new Date(participant.registration_date).toLocaleDateString("id-ID")} •{" "}
                                          {participant.team_members?.length || 0} anggota tim
                                        </span>
                                      </div>

                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleTeamExpansion(participant.id)}
                                        className="mb-3 border-slate-600 text-white hover:bg-slate-700"
                                      >
                                        {isTeamExpanded ? (
                                          <>
                                            <ChevronDown className="w-4 h-4 mr-2" />
                                            Sembunyikan Anggota Tim
                                          </>
                                        ) : (
                                          <>
                                            <ChevronRight className="w-4 h-4 mr-2" />
                                            Lihat Anggota Tim ({participant.team_members?.length || 0})
                                          </>
                                        )}
                                      </Button>

                                      {isTeamExpanded && participant.team_members && (
                                        <div className="space-y-3 mt-3">
                                          {participant.team_members
                                            .sort((a, b) => {
                                              const order = { leader: 0, member1: 1, member2: 2 }
                                              return (
                                                (order[a.role as keyof typeof order] || 3) -
                                                (order[b.role as keyof typeof order] || 3)
                                              )
                                            })
                                            .map((member) => renderTeamMember(member))}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {participant.users?.date_of_birth && !participant.is_team_registration && (
                                    <div className="mt-2 text-sm text-slate-400">
                                      <span>
                                        Tgl Lahir: {new Date(participant.users.date_of_birth).toLocaleDateString("id-ID")} •{" "}
                                      </span>
                                      <span>Jenis Kelamin: {participant.users?.gender || "Tidak ada"}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 ml-4">
                                <Select
                                  value={participant.status}
                                  onValueChange={(value) => handleStatusChange(participant.id, value)}
                                >
                                  <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white text-xs">
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
                                {participant.payment_proof_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                  onClick={async () => {
  if (participant.payment_proof_url) {
    const url = participant.payment_proof_url;
    const isPdf = url.toLowerCase().endsWith(".pdf");

    // Ekstrak HANYA nama file dari URL
    const urlParts = url.split("/");
    const filePath = urlParts[urlParts.length - 1]; // <-- PERUBAHAN DI SINI

    if (!filePath) {
      toast({
        title: "URL Bukti pembayaran tidak valid.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/storage/signed-url?filePath=${encodeURIComponent(filePath)}`);
      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: `Gagal mendapatkan URL: ${errorData.error || 'Unknown error'}`,
          variant: "destructive",
        });
        return;
      }
      
      const { signedUrl } = await response.json();

      if (isPdf) {
        window.open(signedUrl, '_blank', 'noopener,noreferrer');
      } else {
        setCurrentProofUrl(signedUrl);
        setIsProofModalOpen(true);
      }

    } catch (error) {
      console.error("Error fetching signed URL:", error);
      toast({
        title: "Terjadi kesalahan saat mengambil bukti pembayaran",
        variant: "destructive",
      });
    }
  }
}}
                                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    Lihat Bukti Bayar dan Berkas
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>

      <Dialog open={isProofModalOpen} onOpenChange={setIsProofModalOpen}>
        <DialogContent className="sm:max-w-4xl w-[90%] bg-slate-900 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Bukti Pembayaran</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center p-4">
            {currentProofUrl ? (
              <img
                src={currentProofUrl}
                alt="Bukti Pembayaran"
                className="max-w-full h-auto rounded-md"
              />
            ) : (
              <p>Gagal memuat gambar.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}