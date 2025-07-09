"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Mail, Phone, Calendar, MapPin, Upload } from "lucide-react"
import type React from "react"

interface FormFieldsProps {
  formData: any
  validationErrors: any
  validationSuccess: any
  onInputChange: (field: string, value: string) => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  isAdmin?: boolean
}

const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-white font-medium">
    {children} <span className="text-red-400 text-sm">(wajib)</span>
  </span>
)

const OptionalLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-white font-medium">
    {children} <span className="text-slate-400 text-sm">(optional)</span>
  </span>
)

const FieldDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs text-slate-400 mt-1 mb-2">{children}</p>
)

export function BasicInfoFields({ formData, validationErrors, onInputChange, isAdmin }: FormFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">
          <RequiredLabel>Nama Lengkap</RequiredLabel>
        </Label>
        <FieldDescription>Isi dengan nama lengkap sesuai dokumen resmi</FieldDescription>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => onInputChange("fullName", e.target.value)}
            className={`pl-10 bg-slate-800/50 border-slate-600 text-white ${
              validationErrors.fullName ? "border-red-500" : ""
            }`}
            placeholder={isAdmin ? "Nama lengkap administrator" : "Contoh: Ahmad Budi Santoso"}
          />
        </div>
        {validationErrors.fullName && <span className="text-xs text-red-400">{validationErrors.fullName}</span>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white font-medium">
          Email {isAdmin ? "Administrator" : "Peserta/Wali"}
        </Label>
        <FieldDescription>Email tidak dapat diubah setelah registrasi</FieldDescription>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            id="email"
            type="email"
            value={formData.email}
            disabled
            className="pl-10 bg-slate-800/30 border-slate-600 text-slate-400 cursor-not-allowed"
            placeholder={isAdmin ? "email@admin.com" : "email@contoh.com"}
          />
        </div>
        <p className="text-xs text-slate-500">Email tidak dapat diubah</p>
      </div>

      {!isAdmin && (
        <>
          <div className="space-y-2">
            <Label htmlFor="nickname">
              <OptionalLabel>Nama Panggilan</OptionalLabel>
            </Label>
            <FieldDescription>Isi dengan nama panggilan yang biasa digunakan</FieldDescription>
            <Input
              id="nickname"
              value={formData.nickname}
              onChange={(e) => onInputChange("nickname", e.target.value)}
              className="bg-slate-800/50 border-slate-600 text-white"
              placeholder="Contoh: Budi"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              <RequiredLabel>Nomor Telepon Peserta/Wali</RequiredLabel>
            </Label>
            <FieldDescription>Nomor telepon aktif yang dapat dihubungi (format: 08xxxxxxxxxx)</FieldDescription>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => onInputChange("phone", e.target.value)}
                className={`pl-10 bg-slate-800/50 border-slate-600 text-white ${
                  validationErrors.phone ? "border-red-500" : ""
                }`}
                placeholder="08123456789"
              />
            </div>
            {validationErrors.phone && <span className="text-xs text-red-400">{validationErrors.phone}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">
              <RequiredLabel>Tanggal Lahir</RequiredLabel>
            </Label>
            <FieldDescription>Pilih tanggal lahir sesuai dokumen resmi</FieldDescription>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => onInputChange("dateOfBirth", e.target.value)}
                className={`pl-10 bg-slate-800/50 border-slate-600 text-white ${
                  validationErrors.dateOfBirth ? "border-red-500" : ""
                }`}
              />
            </div>
            {validationErrors.dateOfBirth && (
              <span className="text-xs text-red-400">{validationErrors.dateOfBirth}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">
              <RequiredLabel>Jenis Kelamin</RequiredLabel>
            </Label>
            <FieldDescription>Pilih jenis kelamin sesuai dokumen resmi</FieldDescription>
            <Select value={formData.gender} onValueChange={(value) => onInputChange("gender", value)}>
              <SelectTrigger
                className={`bg-slate-800/50 border-slate-600 text-white ${
                  validationErrors.gender ? "border-red-500" : ""
                }`}
              >
                <SelectValue placeholder="Pilih jenis kelamin" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="laki-laki" className="text-white hover:bg-slate-700">
                  Laki-laki
                </SelectItem>
                <SelectItem value="perempuan" className="text-white hover:bg-slate-700">
                  Perempuan
                </SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.gender && <span className="text-xs text-red-400">{validationErrors.gender}</span>}
          </div>
        </>
      )}
    </div>
  )
}

export function AddressFields({ formData, validationErrors, onInputChange }: FormFieldsProps) {
  const provinces = [
    "Aceh",
    "Sumatera Utara",
    "Sumatera Barat",
    "Riau",
    "Kepulauan Riau",
    "Jambi",
    "Sumatera Selatan",
    "Kepulauan Bangka Belitung",
    "Bengkulu",
    "Lampung",
    "DKI Jakarta",
    "Jawa Barat",
    "Jawa Tengah",
    "DI Yogyakarta",
    "Jawa Timur",
    "Banten",
    "Bali",
    "Nusa Tenggara Barat",
    "Nusa Tenggara Timur",
    "Kalimantan Barat",
    "Kalimantan Tengah",
    "Kalimantan Selatan",
    "Kalimantan Timur",
    "Kalimantan Utara",
    "Sulawesi Utara",
    "Sulawesi Tengah",
    "Sulawesi Selatan",
    "Sulawesi Tenggara",
    "Gorontalo",
    "Sulawesi Barat",
    "Maluku",
    "Maluku Utara",
    "Papua",
    "Papua Barat",
    "Papua Selatan",
    "Papua Tengah",
    "Papua Pegunungan",
    "Papua Barat Daya",
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="street">
          <RequiredLabel>Alamat Jalan</RequiredLabel>
        </Label>
        <FieldDescription>Isi dengan nama jalan, nomor rumah, dan detail alamat</FieldDescription>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
          <textarea
            id="street"
            value={formData.address.street}
            onChange={(e) => onInputChange("address.street", e.target.value)}
            className={`w-full pl-10 pt-2 pb-2 pr-3 bg-slate-800/50 border border-slate-600 rounded-md text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 resize-none ${
              validationErrors.street ? "border-red-500" : ""
            }`}
            rows={2}
            placeholder="Contoh: Jl. Merdeka No. 123, RT 01/RW 02"
          />
        </div>
        {validationErrors.street && <span className="text-xs text-red-400">{validationErrors.street}</span>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="rtRw">
          <OptionalLabel>RT/RW</OptionalLabel>
        </Label>
        <FieldDescription>Format: RT/RW (contoh: 01/02)</FieldDescription>
        <Input
          id="rtRw"
          value={formData.address.rtRw}
          onChange={(e) => onInputChange("address.rtRw", e.target.value)}
          className="bg-slate-800/50 border-slate-600 text-white"
          placeholder="01/02"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="village">
          <RequiredLabel>Kelurahan/Desa</RequiredLabel>
        </Label>
        <FieldDescription>Nama kelurahan atau desa tempat tinggal</FieldDescription>
        <Input
          id="village"
          value={formData.address.village}
          onChange={(e) => onInputChange("address.village", e.target.value)}
          className={`bg-slate-800/50 border-slate-600 text-white ${validationErrors.village ? "border-red-500" : ""}`}
          placeholder="Contoh: Kelurahan Menteng"
        />
        {validationErrors.village && <span className="text-xs text-red-400">{validationErrors.village}</span>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="district">
          <RequiredLabel>Kecamatan</RequiredLabel>
        </Label>
        <FieldDescription>Nama kecamatan tempat tinggal</FieldDescription>
        <Input
          id="district"
          value={formData.address.district}
          onChange={(e) => onInputChange("address.district", e.target.value)}
          className={`bg-slate-800/50 border-slate-600 text-white ${validationErrors.district ? "border-red-500" : ""}`}
          placeholder="Contoh: Kecamatan Menteng"
        />
        {validationErrors.district && <span className="text-xs text-red-400">{validationErrors.district}</span>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">
          <RequiredLabel>Kota/Kabupaten</RequiredLabel>
        </Label>
        <FieldDescription>Nama kota atau kabupaten tempat tinggal</FieldDescription>
        <Input
          id="city"
          value={formData.address.city}
          onChange={(e) => onInputChange("address.city", e.target.value)}
          className={`bg-slate-800/50 border-slate-600 text-white ${validationErrors.city ? "border-red-500" : ""}`}
          placeholder="Contoh: Jakarta Pusat"
        />
        {validationErrors.city && <span className="text-xs text-red-400">{validationErrors.city}</span>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="province">
          <RequiredLabel>Provinsi</RequiredLabel>
        </Label>
        <FieldDescription>Pilih provinsi tempat tinggal</FieldDescription>
        <Select value={formData.address.province} onValueChange={(value) => onInputChange("address.province", value)}>
          <SelectTrigger
            className={`bg-slate-800/50 border-slate-600 text-white ${
              validationErrors.province ? "border-red-500" : ""
            }`}
          >
            <SelectValue placeholder="Pilih provinsi" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600 max-h-60">
            {provinces.map((province) => (
              <SelectItem key={province} value={province} className="text-white hover:bg-slate-700">
                {province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {validationErrors.province && <span className="text-xs text-red-400">{validationErrors.province}</span>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="postalCode">
          <OptionalLabel>Kode Pos</OptionalLabel>
        </Label>
        <FieldDescription>5 digit kode pos (contoh: 12345)</FieldDescription>
        <Input
          id="postalCode"
          value={formData.address.postalCode}
          onChange={(e) => onInputChange("address.postalCode", e.target.value)}
          className="bg-slate-800/50 border-slate-600 text-white"
          placeholder="12345"
          maxLength={5}
        />
      </div>
    </div>
  )
}

export function EducationFields({ formData, validationErrors, onInputChange, onFileChange }: FormFieldsProps) {
  const educationLevels = [
    { value: "tk", label: "TK/PAUD" },
    { value: "sd", label: "SD/MI" },
    { value: "smp", label: "SMP/MTs" },
    { value: "sma", label: "SMA/MA/SMK" },
    { value: "universitas", label: "Universitas/Perguruan Tinggi" },
    { value: "umum", label: "Guru/Wali/Masyarakat Umum" },
  ]

  const identityTypes = [
    { value: "ktp", label: "KTP (Kartu Tanda Penduduk)" },
    { value: "sim", label: "SIM (Surat Izin Mengemudi)" },
    { value: "paspor", label: "Paspor" },
    { value: "kk", label: "KK (Kartu Keluarga)" },
    { value: "kartu_pelajar", label: "Kartu Pelajar" },
    { value: "ktm", label: "KTM (Kartu Tanda Mahasiswa)" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="educationLevel">
          <RequiredLabel>Jenjang Pendidikan</RequiredLabel>
        </Label>
        <FieldDescription>Pilih jenjang pendidikan saat ini</FieldDescription>
        <Select value={formData.educationLevel} onValueChange={(value) => onInputChange("educationLevel", value)}>
          <SelectTrigger
            className={`bg-slate-800/50 border-slate-600 text-white ${
              validationErrors.educationLevel ? "border-red-500" : ""
            }`}
          >
            <SelectValue placeholder="Pilih jenjang pendidikan" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            {educationLevels.map((level) => (
              <SelectItem key={level.value} value={level.value} className="text-white hover:bg-slate-700">
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {validationErrors.educationLevel && (
          <span className="text-xs text-red-400">{validationErrors.educationLevel}</span>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="school">
          {formData.educationLevel && formData.educationLevel !== "umum" ? (
            <RequiredLabel>Asal Sekolah/Universitas</RequiredLabel>
          ) : (
            <OptionalLabel>Asal Sekolah/Universitas</OptionalLabel>
          )}
        </Label>
        <FieldDescription>
          {formData.educationLevel === "umum"
            ? "Isi jika memiliki latar belakang pendidikan formal"
            : "Nama lengkap sekolah/universitas tempat belajar"}
        </FieldDescription>
        <Input
          id="school"
          value={formData.school}
          onChange={(e) => onInputChange("school", e.target.value)}
          className={`bg-slate-800/50 border-slate-600 text-white ${validationErrors.school ? "border-red-500" : ""}`}
          placeholder="Contoh: SMA Negeri 1 Jakarta"
        />
        {validationErrors.school && <span className="text-xs text-red-400">{validationErrors.school}</span>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="grade">
          {formData.educationLevel && formData.educationLevel !== "umum" ? (
            <RequiredLabel>Kelas/Semester</RequiredLabel>
          ) : (
            <OptionalLabel>Kelas/Semester</OptionalLabel>
          )}
        </Label>
        <FieldDescription>Kelas atau semester saat ini (jika masih bersekolah/kuliah)</FieldDescription>
        <Input
          id="grade"
          value={formData.grade}
          onChange={(e) => onInputChange("grade", e.target.value)}
          className="bg-slate-800/50 border-slate-600 text-white"
          placeholder="Contoh: Kelas 12 IPA / Semester 6"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="studentId">
          <OptionalLabel>NISN/NIM/NPM</OptionalLabel>
        </Label>
        <FieldDescription>Nomor induk siswa/mahasiswa (jika ada)</FieldDescription>
        <Input
          id="studentId"
          value={formData.studentId}
          onChange={(e) => onInputChange("studentId", e.target.value)}
          className="bg-slate-800/50 border-slate-600 text-white"
          placeholder="Contoh: 1234567890"
        />
      </div>
    </div>
  )
}
