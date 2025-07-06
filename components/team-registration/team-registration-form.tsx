"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Users, ArrowRight, ArrowLeft, CheckCircle, User, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TeamMember {
  name: string
  email: string
  phone: string
  school: string
  grade: string
  identity_type: string
  identity_number: string
  address: string
  birth_date: string
  gender: string
}

interface TeamRegistrationFormProps {
  competitionId: string
  competitionTitle: string
  registrationId: string
  batchId: number
  onComplete: () => void
}

const initialMemberData: TeamMember = {
  name: "",
  email: "",
  phone: "",
  school: "",
  grade: "",
  identity_type: "",
  identity_number: "",
  address: "",
  birth_date: "",
  gender: "",
}

export function TeamRegistrationForm({
  competitionId,
  competitionTitle,
  registrationId,
  batchId,
  onComplete,
}: TeamRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { ...initialMemberData },
    { ...initialMemberData },
    { ...initialMemberData },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const memberTitles = ["Ketua Tim", "Anggota 1", "Anggota 2"]
  const memberIcons = [User, User, User]

  const validateCurrentMember = (member: TeamMember): boolean => {
    const requiredFields = [
      "name",
      "email",
      "phone",
      "school",
      "grade",
      "identity_type",
      "identity_number",
      "address",
      "birth_date",
      "gender",
    ]

    return requiredFields.every((field) => {
      const value = member[field as keyof TeamMember]
      return value && value.toString().trim() !== ""
    })
  }

  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    setTeamMembers((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleNext = () => {
    const currentMember = teamMembers[currentStep]

    if (!validateCurrentMember(currentMember)) {
      toast({
        title: "Data Tidak Lengkap",
        description: "Mohon lengkapi semua field yang diperlukan",
        variant: "destructive",
      })
      return
    }

    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/team-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationId,
          competitionId,
          teamMembers,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Pendaftaran Tim Berhasil!",
          description: "Data tim telah disimpan. Lanjutkan ke pembayaran.",
        })

        // Redirect to payment page
        window.location.href = `/payment?competition=${competitionId}&batch=${batchId}&registration=${registrationId}&team=true`
      } else {
        throw new Error(data.error || "Gagal menyimpan data tim")
      }
    } catch (error) {
      console.error("Team registration error:", error)
      toast({
        title: "Gagal Menyimpan Data",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan data tim",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderMemberForm = (memberIndex: number) => {
    const member = teamMembers[memberIndex]
    const MemberIcon = memberIcons[memberIndex]

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <MemberIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{memberTitles[memberIndex]}</h3>
            <p className="text-slate-400">Lengkapi data anggota tim</p>
          </div>
        </div>

        <p className="text-red-500 inline">* Wajib diisi</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nama Lengkap */}
          <div className="space-y-2">
            <Label htmlFor={`name-${memberIndex}`} className="text-white">
              Nama Lengkap <p className="text-red-500 inline">*</p>
            </Label>
            <Input
              id={`name-${memberIndex}`}
              value={member.name}
              onChange={(e) => updateMember(memberIndex, "name", e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor={`email-${memberIndex}`} className="text-white">
              Email <p className="text-red-500 inline">*</p>
            </Label>
            <Input
              id={`email-${memberIndex}`}
              type="email"
              value={member.email}
              onChange={(e) => updateMember(memberIndex, "email", e.target.value)}
              placeholder="contoh@email.com"
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          {/* Nomor Telepon */}
          <div className="space-y-2">
            <Label htmlFor={`phone-${memberIndex}`} className="text-white">
              Nomor Telepon <p className="text-red-500 inline">*</p>
            </Label>
            <Input
              id={`phone-${memberIndex}`}
              value={member.phone}
              onChange={(e) => updateMember(memberIndex, "phone", e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          {/* Sekolah */}
          <div className="space-y-2">
            <Label htmlFor={`school-${memberIndex}`} className="text-white">
              Asal Sekolah <p className="text-red-500 inline">*</p>
            </Label>
            <Input
              id={`school-${memberIndex}`}
              value={member.school}
              onChange={(e) => updateMember(memberIndex, "school", e.target.value)}
              placeholder="Nama sekolah"
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          {/* Kelas */}
          <div className="space-y-2">
            <Label htmlFor={`grade-${memberIndex}`} className="text-white">
              Kelas <p className="text-red-500 inline">*</p>
            </Label>
            <Select value={member.grade} onValueChange={(value) => updateMember(memberIndex, "grade", value)}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Kelas 1 (SD/Sederajat)</SelectItem>
                <SelectItem value="2">Kelas 2 (SD/Sederajat)</SelectItem>
                <SelectItem value="3">Kelas 3 (SD/Sederajat)</SelectItem>
                <SelectItem value="4">Kelas 4 (SD/Sederajat)</SelectItem>
                <SelectItem value="5">Kelas 5 (SD/Sederajat)</SelectItem>
                <SelectItem value="6">Kelas 6 (SD/Sederajat)</SelectItem>
                <SelectItem value="7">Kelas 7 (SMP/Sederajat)</SelectItem>
                <SelectItem value="8">Kelas 8 (SMP/Sederajat)</SelectItem>
                <SelectItem value="9">Kelas 9 (SMA/Sederajat)</SelectItem>
                <SelectItem value="10">Kelas 10 (SMA/Sederajat)</SelectItem>
                <SelectItem value="11">Kelas 11 (SMA/Sederajat)</SelectItem>
                <SelectItem value="12">Kelas 12 (SMA/Sederajat)</SelectItem>
                <SelectItem value="Univ/PT">Universitas/Perguruan Tinggi</SelectItem>
                <SelectItem value="umum">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Jenis Kelamin */}
          <div className="space-y-2">
            <Label htmlFor={`gender-${memberIndex}`} className="text-white">
              Jenis Kelamin <p className="text-red-500 inline">*</p>
            </Label>
            <Select value={member.gender} onValueChange={(value) => updateMember(memberIndex, "gender", value)}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Pilih jenis kelamin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                <SelectItem value="Perempuan">Perempuan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Jenis Identitas */}
          <div className="space-y-2">
            <Label htmlFor={`identity-type-${memberIndex}`} className="text-white">
              Jenis Identitas <p className="text-red-500 inline">*</p>
            </Label>
            <Select
              value={member.identity_type}
              onValueChange={(value) => updateMember(memberIndex, "identity_type", value)}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Pilih jenis identitas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KTP">KTP</SelectItem>
                <SelectItem value="Kartu Pelajar">Kartu Pelajar</SelectItem>
                <SelectItem value="Kartu Tanda Mahasiswa">Kartu Tanda Mahasiswa/KTM</SelectItem>
                <SelectItem value="Lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nomor Identitas */}
          <div className="space-y-2">
            <Label htmlFor={`identity-number-${memberIndex}`} className="text-white">
              Nomor Identitas <p className="text-red-500 inline">*</p>
            </Label>
            <Input
              id={`identity-number-${memberIndex}`}
              value={member.identity_number}
              onChange={(e) => updateMember(memberIndex, "identity_number", e.target.value)}
              placeholder="Nomor identitas"
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          {/* Tanggal Lahir */}
          <div className="space-y-2">
            <Label htmlFor={`birth-date-${memberIndex}`} className="text-white">
              Tanggal Lahir <p className="text-red-500 inline">*</p>
            </Label>
            <Input
              id={`birth-date-${memberIndex}`}
              type="date"
              value={member.birth_date}
              onChange={(e) => updateMember(memberIndex, "birth_date", e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>
        </div>

        {/* Alamat */}
        <div className="space-y-2">
          <Label htmlFor={`address-${memberIndex}`} className="text-white">
            Alamat <p className="text-red-500 inline">*</p>
          </Label>
          <Textarea
            id={`address-${memberIndex}`}
            value={member.address}
            onChange={(e) => updateMember(memberIndex, "address", e.target.value)}
            placeholder="Isi dengan alamat seperlunya"
            className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
            required
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Pendaftaran Tim</h1>
              <p className="text-slate-400">{competitionTitle}</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[0, 1, 2].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step <= currentStep ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step + 1}
                </div>
                {step < 2 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-colors ${step < currentStep ? "bg-blue-600" : "bg-slate-700"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Labels */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-16 text-sm">
            {memberTitles.map((title, index) => (
              <div
                key={index}
                className={`text-center transition-colors ${index <= currentStep ? "text-blue-400" : "text-slate-500"}`}
              >
                {title}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Step {currentStep + 1} of 3</Badge>
              {memberTitles[currentStep]}
            </CardTitle>
            <CardDescription>Lengkapi data {memberTitles[currentStep].toLowerCase()} dengan benar</CardDescription>
          </CardHeader>
          <CardContent>
            {renderMemberForm(currentStep)}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
              <Button
                variant="ghost"
                onClick={() => (window.location.href = "/dashboard")}
                className="text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                Kembali ke Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Sebelumnya
              </Button>

              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSubmitting ? (
                  "Menyimpan..."
                ) : currentStep === 2 ? (
                  <>
                    Selesai & Lanjut Pembayaran
                    <CreditCard className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Selanjutnya
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div className="space-y-2">
                <p className="text-amber-200 font-medium">Penting untuk diperhatikan:</p>
                <ul className="text-amber-100 text-sm space-y-1">
                  <li>• Pastikan semua data yang diisi sudah benar dan sesuai identitas</li>
                  <li>• Data yang sudah disimpan tidak dapat diubah setelah pembayaran</li>
                  <li>• Semua anggota tim harus dari jenjang pendidikan yang sama (SMA/SMK)</li>
                  <li>• Ketua tim akan menjadi contact person utama untuk komunikasi</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
