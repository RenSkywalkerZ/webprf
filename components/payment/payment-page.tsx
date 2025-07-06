"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CountdownTimer } from "@/components/ui/countdown-timer"
import {
  CreditCard,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Trophy,
  Users,
  User,
  CreditCardIcon as CardIcon,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Competition {
  id: string
  title: string
  description: string
  category: string
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
  batch_id: number
  status: string
  expires_at: string
  payment_proof_url?: string
  is_team_registration?: boolean
  team_data_complete?: boolean
}

interface TeamMember {
  id: string
  name: string
  email: string
  phone: string
  school: string
  grade: string
  identity_type: string
  identity_number: string
  address: string
  birth_date: string
  birth_place: string
  gender: string
  role: string
}

interface PaymentPageProps {
  competitionId: string
  batchId: number
  registrationId: string
  isTeamRegistration?: boolean
}

export function PaymentPage({ competitionId, batchId, registrationId, isTeamRegistration = false }: PaymentPageProps) {
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [batch, setBatch] = useState<Batch | null>(null)
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [price, setPrice] = useState<string>("Memuat...")
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [notes, setNotes] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [competitionId, batchId, registrationId])

  const fetchData = async () => {
    try {
      // Fetch competition data
      const competitionResponse = await fetch(`/api/competitions/${competitionId}`)
      if (competitionResponse.ok) {
        const { competition } = await competitionResponse.json()
        setCompetition(competition)
      }

      // Fetch batch data
      const batchResponse = await fetch(`/api/batches/${batchId}`)
      if (batchResponse.ok) {
        const { batch } = await batchResponse.json()
        setBatch(batch)
      }

      // Fetch registration data
      const registrationResponse = await fetch(`/api/users/registrations`)
      if (registrationResponse.ok) {
        const { registrations } = await registrationResponse.json()
        const currentRegistration = registrations.find((r: Registration) => r.id === registrationId)
        setRegistration(currentRegistration)

        // If it's a team registration, fetch team members
        if (currentRegistration?.is_team_registration) {
          const teamResponse = await fetch(`/api/team-members/${registrationId}`)
          if (teamResponse.ok) {
            const { teamMembers } = await teamResponse.json()
            setTeamMembers(teamMembers)
          }
        }
      }

      // Fetch pricing
      const pricingResponse = await fetch("/api/pricing")
      if (pricingResponse.ok) {
        const { pricing } = await pricingResponse.json()
        const competitionPrice = pricing[batchId]?.[competitionId] || 0
        setPrice(
          new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(competitionPrice),
        )
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Gagal memuat data pembayaran",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Format File Tidak Valid",
          description: "Hanya file gambar (JPEG, PNG, WebP) yang diperbolehkan",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Terlalu Besar",
          description: "Ukuran file maksimal 5MB",
          variant: "destructive",
        })
        return
      }

      setPaymentProof(file)
    }
  }

  const handleUpload = async () => {
    if (!paymentProof) {
      toast({
        title: "File Tidak Dipilih",
        description: "Silakan pilih file bukti pembayaran terlebih dahulu",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", paymentProof)
      formData.append("registrationId", registrationId)
      formData.append("competitionId", competitionId)
      formData.append("notes", notes)

      const response = await fetch("/api/payments/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Bukti Pembayaran Berhasil Diunggah!",
          description: "Pembayaran Anda sedang diverifikasi oleh admin. Anda akan mendapat notifikasi melalui email.",
        })

        // Update registration state
        if (registration) {
          setRegistration({
            ...registration,
            payment_proof_url: data.fileUrl,
          })
        }

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 3000)
      } else {
        throw new Error(data.error || "Gagal mengunggah bukti pembayaran")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Gagal Mengunggah",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat mengunggah file",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleTimerExpire = () => {
    toast({
      title: "Waktu Pendaftaran Habis",
      description: "Silakan daftar ulang untuk melanjutkan",
      variant: "destructive",
    })

    setTimeout(() => {
      window.location.href = "/dashboard"
    }, 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Memuat data pembayaran...</p>
        </div>
      </div>
    )
  }

  if (!competition || !batch || !registration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-900/50 border-slate-700 max-w-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Data Tidak Ditemukan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-slate-300 mb-4">
              Data pembayaran tidak dapat dimuat. Silakan coba lagi atau hubungi admin.
            </CardDescription>
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if registration has expired
  const isExpired = new Date(registration.expires_at) <= new Date()
  const hasPaymentProof = !!registration.payment_proof_url

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Pembayaran Kompetisi</h1>
              <p className="text-slate-400">Selesaikan pembayaran untuk menyelesaikan pendaftaran</p>
            </div>
          </div>
        </div>

        {/* Timer Card */}
        {!hasPaymentProof && !isExpired && (
          <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30">
            <CardContent className="p-4">
              <CountdownTimer expiresAt={registration.expires_at} onExpire={handleTimerExpire} />
              <p className="text-orange-200 text-sm mt-2">
                Selesaikan pembayaran sebelum waktu habis untuk menyelesaikan pendaftaran
              </p>
            </CardContent>
          </Card>
        )}

        {/* Expired Notice */}
        {isExpired && !hasPaymentProof && (
          <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-400" />
                Waktu Pendaftaran Habis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                Waktu pendaftaran telah habis. Silakan daftar ulang untuk melanjutkan.
              </p>
              <Button onClick={() => (window.location.href = "/dashboard")} className="bg-blue-600 hover:bg-blue-700">
                Kembali ke Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payment Success Notice */}
        {hasPaymentProof && (
          <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Pembayaran Berhasil Diunggah
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Bukti pembayaran Anda sedang diverifikasi oleh admin. Anda akan mendapat notifikasi melalui email
                setelah verifikasi selesai.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Competition Details */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Detail Kompetisi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-400">Nama Kompetisi</Label>
                <p className="text-white font-medium">{competition.title}</p>
              </div>
              <div>
                <Label className="text-slate-400">Kategori</Label>
                <p className="text-white">{competition.category}</p>
              </div>
              <div>
                <Label className="text-slate-400">Batch Pendaftaran</Label>
                <p className="text-white">{batch.name}</p>
              </div>
              <div>
                <Label className="text-slate-400">Jenis Pendaftaran</Label>
                <div className="flex items-center gap-2">
                  {registration.is_team_registration ? (
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      <Users className="w-3 h-3 mr-1" />
                      Tim (3 orang)
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      <User className="w-3 h-3 mr-1" />
                      Individu
                    </Badge>
                  )}
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <Label className="text-slate-400">Total Pembayaran</Label>
                <p className="text-2xl font-bold text-green-400">{price}</p>
                <p className="text-slate-400 text-sm">
                  {registration.is_team_registration ? "Untuk satu tim (3 orang)" : "Untuk satu peserta"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Team Members (if team registration) */}
          {registration.is_team_registration && teamMembers.length > 0 && (
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  Anggota Tim
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member, index) => (
                    <div key={member.id} className="bg-slate-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          className={`text-xs ${member.role === "leader" ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" : "bg-blue-500/20 text-blue-300 border-blue-500/30"}`}
                        >
                          {member.role === "leader" ? "Ketua Tim" : `Anggota ${index}`}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-slate-400">Nama</p>
                          <p className="text-white font-medium">{member.name}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Email</p>
                          <p className="text-white">{member.email}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Sekolah</p>
                          <p className="text-white">{member.school}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Kelas</p>
                          <p className="text-white">Kelas {member.grade}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Instructions */}
          <Card className="bg-slate-900/50 border-slate-700 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CardIcon className="w-5 h-5 text-green-400" />
                Instruksi Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Transfer Bank</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bank:</span>
                    <span className="text-white font-medium">BCA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">No. Rekening:</span>
                    <span className="text-white font-medium">1234567890</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Atas Nama:</span>
                    <span className="text-white font-medium">PRF XIII Committee</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Jumlah:</span>
                    <span className="text-green-400 font-bold">{price}</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <h4 className="text-amber-300 font-medium mb-2">Penting:</h4>
                <ul className="text-amber-100 text-sm space-y-1">
                  <li>• Transfer sesuai dengan jumlah yang tertera</li>
                  <li>• Simpan bukti transfer untuk diunggah</li>
                  <li>• Pembayaran akan diverifikasi dalam 1x24 jam</li>
                  <li>• Hubungi admin jika ada kendala</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Upload Payment Proof */}
          {!hasPaymentProof && !isExpired && (
            <Card className="bg-slate-900/50 border-slate-700 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-400" />
                  Upload Bukti Pembayaran
                </CardTitle>
                <CardDescription>Upload foto/screenshot bukti transfer pembayaran</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="payment-proof" className="text-white">
                    File Bukti Pembayaran *
                  </Label>
                  <Input
                    id="payment-proof"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="bg-slate-800 border-slate-700 text-white file:bg-slate-700 file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded-md"
                  />
                  <p className="text-slate-400 text-sm mt-1">Format: JPG, PNG, WebP. Maksimal 5MB</p>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-white">
                    Catatan (Opsional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tambahkan catatan jika diperlukan..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={!paymentProof || isUploading}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Mengunggah...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Bukti Pembayaran
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Back to Dashboard */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/dashboard")}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
