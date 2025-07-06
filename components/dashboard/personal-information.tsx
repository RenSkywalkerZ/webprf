"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { ProfileCompletion } from "./personal-info/profile-completion"
import { BasicInfoFields, AddressFields, EducationFields } from "./personal-info/form-fields"
import { User, Save, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PersonalInformationProps {
  userData: any
  onUpdateUser: (userData: any) => void
}

export function PersonalInformation({ userData, onUpdateUser }: PersonalInformationProps) {
  const { toast } = useToast()

  // --- KEY CHANGE 1: The form state is now initialized directly from props ---
  const [formData, setFormData] = useState(() => {
    let addressData = userData?.address
    if (typeof addressData === "string") {
      try {
        addressData = JSON.parse(addressData)
      } catch (e) {
        addressData = { street: addressData || "", rtRw: "", village: "", district: "", city: "", province: "", postalCode: "" }
      }
    } else if (!addressData || typeof addressData !== "object") {
      addressData = { street: "", rtRw: "", village: "", district: "", city: "", province: "", postalCode: "" }
    }

    return {
      fullName: userData?.full_name || "",
      nickname: userData?.nickname || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
      dateOfBirth: userData?.date_of_birth || "",
      address: addressData,
      educationLevel: userData?.education_level || "",
      school: userData?.school || "",
      grade: userData?.grade || "",
      gender: userData?.gender || "",
      studentId: userData?.student_id || "",
      identityType: userData?.identity_type || "",
      identityCard: null as File | null,
    }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    type: "success" as "success" | "error" | "warning",
    title: "",
    description: "",
  })

  // --- KEY CHANGE 2: The problematic useEffect has been DELETED ---
  // The useEffect that reset the form state based on `userData` props is now gone.

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (userData?.role === "admin") {
      const adminFields = [formData.fullName, formData.email]
      const completedAdminFields = adminFields.filter((field) => field && field.trim() !== "").length
      return Math.round((completedAdminFields / adminFields.length) * 100)
    }

    const requiredFields = [
      formData.fullName,
      formData.email,
      formData.phone,
      formData.dateOfBirth,
      formData.address.street,
      formData.address.village,
      formData.address.district,
      formData.address.city,
      formData.address.province,
      formData.educationLevel,
      formData.gender,
    ]

    if (formData.educationLevel && formData.educationLevel !== "umum") {
      requiredFields.push(formData.school)
    }

    const completedFields = requiredFields.filter((field) => field && field.trim() !== "").length
    return Math.round((completedFields / requiredFields.length) * 100)
  }

  const handleInputChange = (field: string, value: string) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 1024 * 1024) {
        setValidationErrors((prev) => ({ ...prev, identityCard: "Ukuran file maksimal 1MB" }))
        return
      }
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setValidationErrors((prev) => ({ ...prev, identityCard: "Format file harus JPG atau PNG" }))
        return
      }
      setFormData((prev) => ({ ...prev, identityCard: file }))
      setValidationErrors((prev) => ({ ...prev, identityCard: "" }))
    }
  }

  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    if (userData?.role === "admin") {
      if (!formData.fullName.trim()) errors.fullName = "Nama lengkap wajib diisi"
      setValidationErrors(errors)
      return Object.keys(errors).length === 0
    }

    if (!formData.fullName.trim()) errors.fullName = "Nama lengkap wajib diisi"
    if (!formData.phone.trim()) errors.phone = "Nomor telepon wajib diisi"
    if (!formData.dateOfBirth) errors.dateOfBirth = "Tanggal lahir wajib diisi"
    if (!formData.address.street.trim()) errors.street = "Alamat jalan wajib diisi"
    if (!formData.address.village.trim()) errors.village = "Kelurahan/Desa wajib diisi"
    if (!formData.address.district.trim()) errors.district = "Kecamatan wajib diisi"
    if (!formData.address.city.trim()) errors.city = "Kota/Kabupaten wajib diisi"
    if (!formData.address.province.trim()) errors.province = "Provinsi wajib diisi"
    if (!formData.educationLevel) errors.educationLevel = "Jenjang pendidikan wajib dipilih"
    if (!formData.gender) errors.gender = "Jenis kelamin wajib dipilih"

    if (formData.educationLevel && formData.educationLevel !== "umum" && !formData.school.trim()) {
      errors.school = "Asal sekolah/universitas wajib diisi untuk pelajar/mahasiswa"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setConfirmationDialog({
        isOpen: true,
        type: "error",
        title: "Form Tidak Valid",
        description: "Mohon lengkapi semua field yang wajib diisi sebelum menyimpan.",
      })
      return
    }

    setIsLoading(true)

    try {
      const updateData: any = {
        fullName: formData.fullName,
      }

      if (userData?.role !== "admin") {
        updateData.nickname = formData.nickname
        updateData.phone = formData.phone
        updateData.dateOfBirth = formData.dateOfBirth
        updateData.address = formData.address
        updateData.educationLevel = formData.educationLevel
        updateData.school = formData.school
        updateData.grade = formData.grade
        updateData.gender = formData.gender
        updateData.studentId = formData.studentId
        updateData.identityType = formData.identityType
      }

      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (response.ok) {
        if (onUpdateUser && data.user) {
          onUpdateUser(data.user)
        }

        setConfirmationDialog({
          isOpen: true,
          type: "success",
          title: "Profil Berhasil Diperbarui!",
          description: "Semua perubahan telah disimpan dengan sukses.",
        })

        toast({
          title: "Profil Berhasil Diperbarui",
          description: "Semua perubahan telah disimpan dengan sukses.",
          variant: "default",
        })
      } else {
        setConfirmationDialog({
          isOpen: true,
          type: "error",
          title: "Gagal Memperbarui Profil",
          description: `Terjadi kesalahan: ${data.error}. Silakan coba lagi.`,
        })
      }
    } catch (error) {
      setConfirmationDialog({
        isOpen: true,
        type: "error",
        title: "Kesalahan Sistem",
        description: "Terjadi kesalahan saat memperbarui profil. Silakan periksa koneksi internet Anda dan coba lagi.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const profileCompletion = calculateProfileCompletion()
  const isAdmin = userData?.role === "admin"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          {isAdmin ? <Shield className="w-8 h-8 text-purple-400" /> : <User className="w-8 h-8 text-cyan-400" />}
          {isAdmin ? "Profil Administrator" : "Informasi Pribadi"}
        </h1>
        <p className="text-slate-400">
          {isAdmin
            ? "Kelola informasi dasar akun administrator Anda"
            : "Lengkapi informasi pribadi Anda dengan teliti untuk keperluan kompetisi."}
        </p>
      </div>

      <ProfileCompletion completion={profileCompletion} isAdmin={isAdmin} />

      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            {isAdmin ? "Informasi Administrator" : "Informasi Pribadi"}
          </CardTitle>
          <CardDescription>
            {isAdmin
              ? "Sebagai administrator, Anda hanya perlu mengatur informasi dasar akun"
              : "Pastikan semua informasi yang Anda masukkan akurat dan sesuai dengan dokumen resmi"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">Data Diri</h3>
              <BasicInfoFields
                formData={formData}
                validationErrors={validationErrors}
                validationSuccess={{}}
                onInputChange={handleInputChange}
                onFileChange={handleFileChange}
                isAdmin={isAdmin}
              />
            </div>

            {!isAdmin && (
              <>
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">Alamat Lengkap</h3>
                  <AddressFields
                    formData={formData}
                    validationErrors={validationErrors}
                    validationSuccess={{}}
                    onInputChange={handleInputChange}
                    onFileChange={handleFileChange}
                  />
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                    Informasi Pendidikan
                  </h3>
                  <EducationFields
                    formData={formData}
                    validationErrors={validationErrors}
                    validationSuccess={{}}
                    onInputChange={handleInputChange}
                    onFileChange={handleFileChange}
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className={`${
                isAdmin
                  ? "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  : "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
              } text-white`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={() => setConfirmationDialog({ ...confirmationDialog, isOpen: false })}
        type={confirmationDialog.type}
        title={confirmationDialog.title}
        description={confirmationDialog.description}
      />
    </div>
  )
}
