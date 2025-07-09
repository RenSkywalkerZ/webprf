// File: payment-page.tsx (Versi Baru yang Disederhanakan)

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
import { CreditCard, Upload, CheckCircle, AlertCircle, Clock, Trophy, Users, User, CreditCardIcon as CardIcon, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Definisikan interface untuk struktur data baru dari API
interface PaymentDetails {
  registration: {
    id: string
    competition_id: string
    batch_number: number
    status: string
    expires_at: string
    payment_proof_url?: string
    is_team_registration: boolean
  }
  competitionTitle: string
  price: number
  displayCategory: string
  isTeamRegistration: boolean
  teamMembers: {
    name: string
    grade: string
    role: string
    email: string
    school: string 
    id: string
  }[]
}

interface PaymentPageProps {
  competitionId: string
  batchId: number
  registrationId: string
}

export function PaymentPage({ registrationId }: PaymentPageProps) {
  // Hanya ada dua state utama: untuk data dan untuk loading
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const [isUploading, setIsUploading] = useState(false)
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [notes, setNotes] = useState("")
  const { toast } = useToast()

  // useEffect sekarang hanya memanggil satu API
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!registrationId) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/payment-details/${registrationId}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Gagal memuat detail pembayaran")
        }
        const data: PaymentDetails = await response.json()
        setPaymentDetails(data)
      } catch (error) {
        console.error("Fetch payment details error:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Data pembayaran tidak dapat dimuat.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaymentDetails()
  }, [registrationId, toast])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
      if (!allowedTypes.includes(file.type)) {
        toast({ title: "Format File Tidak Valid", description: "Hanya file gambar (JPG, JPEG, PNG) dan PDF yang diperbolehkan.", variant: "destructive" })
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File Terlalu Besar", description: "Ukuran file maksimal 10MB.", variant: "destructive" })
        return
      }
      setPaymentProof(file)
    }
  }

    const handleUpload = async () => {
    if (!paymentProof || !paymentDetails) return;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("paymentProof", paymentProof);
      formData.append("registrationId", registrationId);
      formData.append("competitionId", paymentDetails.registration.competition_id);
      formData.append("notes", notes);

      const response = await fetch("/api/payments/upload", { method: "POST", body: formData });
      const data = await response.json();

      if (response.ok) {
        toast({ title: "Bukti Pembayaran Berhasil Diunggah!", description: "Pembayaran Anda akan diverifikasi oleh admin." });
        
        // Perbarui state agar UI menyembunyikan form upload
        setPaymentDetails(prevDetails => 
          prevDetails 
            ? { ...prevDetails, registration: { ...prevDetails.registration, status: 'pending_verification', payment_proof_url: data.fileUrl } } 
            : null
        );
        
        // Alihkan pengguna setelah beberapa saat
        setTimeout(() => { window.location.href = "/dashboard" }, 3000);
        
        // PENTING: Jangan set isUploading ke false di sini.
        // Biarkan tombol dalam keadaan loading sampai halaman dialihkan atau komponen hilang.

      } else {
        // Jika respons dari server tidak ok, lempar error untuk ditangkap di blok catch
        throw new Error(data.error || "Gagal mengunggah bukti pembayaran");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Gagal Mengunggah", description: error instanceof Error ? error.message : "Terjadi kesalahan.", variant: "destructive" });
      
      // Kembalikan tombol ke keadaan normal HANYA jika terjadi error
      setIsUploading(false);
    } 
    // Blok 'finally' dihapus agar isUploading tidak di-set ke false saat berhasil.
  }
  
  const handleTimerExpire = () => {
    toast({ title: "Waktu Pendaftaran Habis", description: "Silakan daftar ulang untuk melanjutkan.", variant: "destructive" });
    setTimeout(() => { window.location.href = "/dashboard" }, 2000);
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

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-900/50 border-slate-700 max-w-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-400" />Data Tidak Ditemukan</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-slate-300 mb-4">Data pembayaran tidak dapat dimuat. Mungkin pendaftaran sudah kedaluwarsa atau terjadi kesalahan. Silakan coba lagi atau hubungi admin.</CardDescription>
            <Button onClick={() => (window.location.href = "/dashboard")} className="w-full bg-blue-600 hover:bg-blue-700">Kembali ke Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { registration, competitionTitle, price, displayCategory, isTeamRegistration, teamMembers } = paymentDetails;
  const isExpired = new Date(registration.expires_at) <= new Date();
  const hasPaymentProof = !!registration.payment_proof_url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center"><CreditCard className="w-8 h-8 text-white" /></div>
            <div>
              <h1 className="text-3xl font-bold text-white">Pembayaran Kompetisi</h1>
              <p className="text-slate-400">Selesaikan pembayaran untuk menyelesaikan pendaftaran</p>
            </div>
          </div>
        </div>

        {/* Timer dan Notifikasi Status */}
        {!hasPaymentProof && !isExpired && (
            <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30">
                <CardContent className="p-4">
                    <CountdownTimer expiresAt={registration.expires_at} onExpire={handleTimerExpire} />
                    <p className="text-orange-200 text-sm mt-2">Selesaikan pembayaran sebelum waktu habis.</p>
                </CardContent>
            </Card>
        )}
        {isExpired && !hasPaymentProof && ( <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30"><CardHeader><CardTitle className="text-white flex items-center gap-2"><Clock className="w-5 h-5 text-red-400" />Waktu Pendaftaran Habis</CardTitle></CardHeader><CardContent><p className="text-slate-300 mb-4">Silakan daftar ulang.</p><Button onClick={() => (window.location.href = "/dashboard")} className="bg-blue-600 hover:bg-blue-700">Kembali ke Dashboard</Button></CardContent></Card>)}
        {hasPaymentProof && ( <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30"><CardHeader><CardTitle className="text-white flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400" />Pembayaran Berhasil Diunggah</CardTitle></CardHeader><CardContent><p className="text-slate-300">Bukti pembayaran Anda sedang diverifikasi oleh admin.</p></CardContent></Card>)}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Detail Kompetisi */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" />Detail Pendaftaran</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label className="text-slate-400">Nama Kompetisi</Label><p className="text-white font-medium">{competitionTitle}</p></div>
              <div><Label className="text-slate-400">Kategori Pendaftaran</Label><p className="text-white">{displayCategory}</p></div>
              <div><Label className="text-slate-400">Batch Pendaftaran</Label><p className="text-white">Batch {registration.batch_number}</p></div>
              <div><Label className="text-slate-400">Jenis Pendaftaran</Label><div className="flex items-center gap-2">{isTeamRegistration ? (<Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30"><Users className="w-3 h-3 mr-1" />Tim</Badge>) : (<Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30"><User className="w-3 h-3 mr-1" />Individu</Badge>)}</div></div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <Label className="text-slate-400">Total Pembayaran</Label>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(price)}</p>
                <p className="text-slate-400 text-sm">{isTeamRegistration ? "Untuk satu tim" : "Untuk satu peserta"}</p>
              </div>
            </CardContent>
            <CardContent>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/50">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-300 text-sm mb-3">
                      Dengan mendaftar, Anda setuju dengan syarat dan ketentuan yang berlaku pada guidebook kompetisi ini.
                    </p>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const guideBookLinks = {
                          "Physics Competition": "/guidebook/physics-competition",
                          "Scientific Writing": "/guidebook/scientific-writing", 
                          "Science Project": "/guidebook/science-project",
                          "Lomba Praktikum": "/guidebook/lomba-praktikum",
                          "Cerdas Cermat": "/guidebook/lomba-cerdas-cermat",
                          "Lomba Roket Air": "/guidebook/lomba-roket-air",
                          "Depict Physics": "/guidebook/depict-physics"
                        };
                        const link = guideBookLinks[competitionTitle as keyof typeof guideBookLinks];
                        if (link) {
                          window.open(link, '_blank');
                        }
                      }}
                      className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 hover:border-blue-500/50 text-xs"
                    >
                      <Trophy className="w-3 h-3 mr-1" />
                      Lihat Guidebook
                    </Button>
                  </div>
                </div>
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
                          {member.role === "leader" ? "Ketua Tim" : `Anggota ${index + 1}`}
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
                          <p className="text-slate-400">Kelas/Jenjang</p>
                          <p className="text-white">{member.grade}</p>
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
                    <span className="text-white font-medium">blu by BCA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">No. Rekening:</span>
                    <span className="text-white font-medium">006749948216</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Atas Nama:</span>
                    <span className="text-white font-medium">Aubin Athaya Raihan Setiawan</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Jumlah:</span>
                    <span className="text-green-400 font-bold">{formatCurrency(price)}</span>
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
                  Upload Bukti Pembayaran & Dokumen Lainnya
                </CardTitle>
                <CardDescription className="space-y-3">
                  {/* Deskripsi yang sudah ada */}
                  <p>
                    Unggah dokumen berikut: (1) bukti transfer; (2) foto diri; (3) kartu identitas; dan (4) twibbon yang telah dipasang.
                    Bagi peserta lomba ber-tim, seluruh dokumen tersebut wajib dikumpulkan untuk setiap anggota tim lomba.
                    Lalu semua dokumen digabungkan jadi satu dan dikirim dalam format .pdf, .jpeg, .jpg, atau .png.
                  </p>
                  
                  {/* Tombol Twibbon Baru */}
                  <div className="pt-2">
                    <a href="https://bit.ly/TwibbonPRFXIII" target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Buka Link Twibbon
                      </Button>
                    </a>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <h4 className="text-amber-300 font-medium mb-2">Dokumen yang Wajib Diunggah:</h4>
                <ul className="text-amber-100 text-sm space-y-1">
                  <li>• Bukti transfer</li>
                  <li>• Foto diri peserta setengah badan (jika tim, seluruh anggota tim)</li>
                  <li>• Kartu identitas peserta (jika tim, seluruh anggota tim)</li>
                  <li>• Screenshot Twibbon yang telah dipasang pada instagram (jika tim, seluruh anggota tim)</li>
                </ul>
                <p className="text-amber-100 text-sm mt-2">
                  Seluruh dokumen di atas digabungkan jadi satu (merge) dan dikirim dalam format <span className="font-medium">.pdf, .jpeg, .jpg,</span> atau <span className="font-medium">.png</span>.
                </p>
                <p className="text-amber-100 text-sm mt-2">
                  (Bisa menggunakan layanan seperti <a href="https://ilovepdf.com" className="text-blue-400 underline" target="_blank" rel="noopener noreferrer">ilovepdf.com</a> untuk menggabungkan/merge file).
                </p>
              </div>
              </CardContent>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="payment-proof" className="text-white">
                    Upload file <p className="text-red-500 inline">*</p>
                  </Label>
                  <Input
                    id="payment-proof"
                    type="file"
                    accept="image/jpeg, image/jpg, image/png, application/pdf"
                    onChange={handleFileChange}
                    className="bg-slate-800 border-slate-700 text-white file:bg-slate-700 file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded-md"
                  />
                  <p className="text-slate-400 text-sm mt-1">Format: JPG, JPEG, PNG, dan PDF Maksimal 10MB (Kompres bila terlalu besar: <a href="https://tinyjpg.com/" className="text-blue-400 underline" target="_blank" rel="noopener noreferrer">tinyjpg.com</a>, <a href="https://ilovepdf.com/" className="text-blue-400 underline" target="_blank" rel="noopener noreferrer">ilovepdf.com</a>. Terima kasih atas pengertiannya.)</p>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-white">
                    Catatan (Nama Pemilik Rekening pada Bukti Pembayaran)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Masukkan nama pemilik rekening pada bukti pembayaran"
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
                      Upload Bukti Pembayaran & Dokumen Lainnya
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Back to Dashboard Button */}
        <div className="text-center pt-4">
          <Button variant="outline" onClick={() => (window.location.href = "/dashboard")} className="border-slate-600 text-slate-300 hover:bg-slate-800">Kembali ke Dashboard</Button>
        </div>
      </div>
    </div>
  )
}