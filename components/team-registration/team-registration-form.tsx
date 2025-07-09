// File: components/team-registration/team-registration-form.tsx (Fixed Version)

"use client"
import { useState, useMemo, useEffect } from "react" // Added useEffect
// ... (all your other imports remain the same)
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Users, ArrowRight, ArrowLeft, CheckCircle, User, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Interface untuk props (tetap sama)
interface TeamRegistrationFormProps {
  competitionId: string;
  competitionTitle: string;
  registrationId: string;
  batchId: number;
  availableLevels: string[];
  maxTeamSize : number; 
  onComplete: () => void;
}

// Interface TeamMember dan initialMemberData (tetap sama)
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

// Definisikan semua kemungkinan kelas di satu tempat (tetap sama)
const ALL_CLASS_OPTIONS = [
  { value: "Kelas 1 (SD)", label: "Kelas 1 (SD/Sederajat)", level: "sd" },
  { value: "Kelas 2 (SD)", label: "Kelas 2 (SD/Sederajat)", level: "sd" },
  { value: "Kelas 3 (SD)", label: "Kelas 3 (SD/Sederajat)", level: "sd" },
  { value: "Kelas 4 (SD)", label: "Kelas 4 (SD/Sederajat)", level: "sd" },
  { value: "Kelas 5 (SD)", label: "Kelas 5 (SD/Sederajat)", level: "sd" },
  { value: "Kelas 6 (SD)", label: "Kelas 6 (SD/Sederajat)", level: "sd" },
  { value: "Kelas 7 (SMP)", label: "Kelas 7 (SMP/Sederajat)", level: "smp" },
  { value: "Kelas 8 (SMP)", label: "Kelas 8 (SMP/Sederajat)", level: "smp" },
  { value: "Kelas 9 (SMP)", label: "Kelas 9 (SMP/Sederajat)", level: "smp" },
  { value: "Kelas 10 (SMA)", label: "Kelas 10 (SMA/Sederajat)", level: "sma" },
  { value: "Kelas 11 (SMA)", label: "Kelas 11 (SMA/Sederajat)", level: "sma" },
  { value: "Kelas 12 (SMA)", label: "Kelas 12 (SMA/Sederajat)", level: "sma" },
  { value: "Mahasiswa", label: "Mahasiswa (Universitas/PT)", level: "universitas" },
  { value: "Umum", label: "Umum/Lainnya", level: "umum" },
];

export function TeamRegistrationForm({
  competitionId,
  competitionTitle,
  registrationId,
  batchId,
  availableLevels,
  maxTeamSize,
  onComplete,
}: TeamRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => 
    Array.from({ length: maxTeamSize }, () => ({ ...initialMemberData }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // State untuk menyimpan jenjang (level) yang dipilih oleh ketua tim
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  // NEW: Track when level changes to show toast
  const [levelJustChanged, setLevelJustChanged] = useState(false);

  // NEW: useEffect to handle toast when level changes
  useEffect(() => {
    if (levelJustChanged && selectedLevel) {
      toast({ 
        title: "Jenjang Terpilih", 
        description: `Jenjang ${selectedLevel.toUpperCase()} telah ditetapkan. Anggota lain harus dari jenjang yang sama.` 
      });
      setLevelJustChanged(false); // Reset flag
    }
  }, [selectedLevel, levelJustChanged, toast]);

  const memberTitles = useMemo(() => {
    const titles = ["Ketua Tim"];
    for (let i = 1; i < maxTeamSize; i++) {
      titles.push(`Anggota ${i + 1}`);
    }
    return titles;
  }, [maxTeamSize]);

  const lastStepIndex = maxTeamSize - 1;

  const validateCurrentMember = (member: TeamMember): boolean => {
    const requiredFields = [
      "name", "email", "phone", "school", "grade",
      "identity_type", "identity_number", "address", "birth_date", "gender",
    ]
    return requiredFields.every((field) => {
      const value = member[field as keyof TeamMember]
      return value && value.toString().trim() !== ""
    })
  }

  // FIXED: Modified updateMember function
  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    setTeamMembers((prev) => {
      const updatedMembers = [...prev];
      updatedMembers[index] = { ...updatedMembers[index], [field]: value };

      // FIXED: Handle level selection without calling toast directly
      if (index === 0 && field === "grade") {
        const selectedOption = ALL_CLASS_OPTIONS.find(opt => opt.value === value);
        const newLevel = selectedOption ? selectedOption.level : null;

        // If level changes, update state and reset other members' grades
        if (newLevel !== selectedLevel) {
          setSelectedLevel(newLevel);
          setLevelJustChanged(true); // Set flag to trigger toast in useEffect
          
          // Reset other members' grades
          if (updatedMembers.length > 1) updatedMembers[1] = { ...updatedMembers[1], grade: "" };
          if (updatedMembers.length > 2) updatedMembers[2] = { ...updatedMembers[2], grade: "" };
        }
      }

      return updatedMembers;
    });
  };

  const handleNext = () => {
    if (!validateCurrentMember(teamMembers[currentStep])) {
      toast({ title: "Data Tidak Lengkap", description: "Mohon lengkapi semua field.", variant: "destructive" });
      return;
    }
    if (currentStep < lastStepIndex) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/team-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, competitionId, teamMembers }),
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Pendaftaran Tim Berhasil!", description: "Data tim telah disimpan. Lanjutkan ke pembayaran." });
        window.location.href = `/payment?competition=${competitionId}&batch=${batchId}&registration=${registrationId}`;
      } else {
        throw new Error(data.error || "Gagal menyimpan data tim");
      }
    } catch (error) {
      console.error("Team registration error:", error);
      toast({ title: "Gagal Menyimpan Data", description: error instanceof Error ? error.message : "Terjadi kesalahan.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const renderMemberForm = (memberIndex: number) => {
    const member = teamMembers[memberIndex];

    // Filter class options based on available levels
    let filteredClassOptions = ALL_CLASS_OPTIONS.filter(option => 
      availableLevels.includes(option.level)
    );

    // If not team leader and level is locked, filter further
    if (memberIndex > 0 && selectedLevel) {
      filteredClassOptions = filteredClassOptions.filter(option => 
        option.level === selectedLevel
      );
    }
    // If team leader hasn't chosen, other members can't choose
    else if (memberIndex > 0 && !selectedLevel) {
       filteredClassOptions = [];
    }

    return (
      <div className="space-y-6">
        {/* Nama Lengkap */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor={`name-${memberIndex}`} className="text-white">Nama Lengkap <span className="text-red-500">*</span></Label>
                <Input id={`name-${memberIndex}`} value={member.name} onChange={(e) => updateMember(memberIndex, "name", e.target.value)} placeholder="Masukkan nama lengkap" className="bg-slate-800 border-slate-700 text-white" required />
            </div>
            {/* Email */}
            <div className="space-y-2">
                <Label htmlFor={`email-${memberIndex}`} className="text-white">Email <span className="text-red-500">*</span></Label>
                <Input id={`email-${memberIndex}`} type="email" value={member.email} onChange={(e) => updateMember(memberIndex, "email", e.target.value)} placeholder="contoh@email.com" className="bg-slate-800 border-slate-700 text-white" required />
            </div>
             {/* Nomor Telepon */}
            <div className="space-y-2">
                <Label htmlFor={`phone-${memberIndex}`} className="text-white">Nomor Telepon <span className="text-red-500">*</span></Label>
                <Input id={`phone-${memberIndex}`} value={member.phone} onChange={(e) => updateMember(memberIndex, "phone", e.target.value)} placeholder="08xxxxxxxxxx" className="bg-slate-800 border-slate-700 text-white" required />
            </div>
            {/* Sekolah */}
            <div className="space-y-2">
                <Label htmlFor={`school-${memberIndex}`} className="text-white">Asal Sekolah <span className="text-red-500">*</span></Label>
                <Input id={`school-${memberIndex}`} value={member.school} onChange={(e) => updateMember(memberIndex, "school", e.target.value)} placeholder="Nama sekolah" className="bg-slate-800 border-slate-700 text-white" required />
            </div>

            {/* Kelas */}
            <div className="space-y-2">
                <Label htmlFor={`grade-${memberIndex}`} className="text-white">Kelas <span className="text-red-500">*</span></Label>
                <Select 
                    value={member.grade} 
                    onValueChange={(value) => updateMember(memberIndex, "grade", value)}
                    disabled={memberIndex > 0 && !selectedLevel} 
                >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder={memberIndex > 0 && !selectedLevel ? "Ketua tim harus memilih dulu" : "Pilih kelas"} />
                </SelectTrigger>
                <SelectContent>
                    {filteredClassOptions.length > 0 ? (
                    filteredClassOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                        {option.label}
                        </SelectItem>
                    ))
                    ) : (
                    <div className="p-4 text-center text-sm text-slate-400">
                        { memberIndex > 0 && !selectedLevel 
                            ? "Menunggu Ketua Tim memilih jenjang..." 
                            : "Jenjang tidak tersedia untuk lomba ini."
                        }
                    </div>
                    )}
                </SelectContent>
                </Select>
            </div>

            {/* Jenis Kelamin */}
            <div className="space-y-2">
                <Label htmlFor={`gender-${memberIndex}`} className="text-white">Jenis Kelamin <span className="text-red-500">*</span></Label>
                <Select value={member.gender} onValueChange={(value) => updateMember(memberIndex, "gender", value)}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="Pilih jenis kelamin" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                        <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {/* Jenis Identitas */}
            <div className="space-y-2">
                <Label htmlFor={`identity-type-${memberIndex}`} className="text-white">Jenis Identitas <span className="text-red-500">*</span></Label>
                <Select value={member.identity_type} onValueChange={(value) => updateMember(memberIndex, "identity_type", value)}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="Pilih jenis identitas" /></SelectTrigger>
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
                <Label htmlFor={`identity-number-${memberIndex}`} className="text-white">Nomor Identitas <span className="text-red-500">*</span></Label>
                <Input id={`identity-number-${memberIndex}`} value={member.identity_number} onChange={(e) => updateMember(memberIndex, "identity_number", e.target.value)} placeholder="Nomor identitas" className="bg-slate-800 border-slate-700 text-white" required />
            </div>
            {/* Tanggal Lahir */}
            <div className="space-y-2">
                <Label htmlFor={`birth-date-${memberIndex}`} className="text-white">Tanggal Lahir <span className="text-red-500">*</span></Label>
                <Input id={`birth-date-${memberIndex}`} type="date" value={member.birth_date} onChange={(e) => updateMember(memberIndex, "birth_date", e.target.value)} className="bg-slate-800 border-slate-700 text-white" required />
            </div>
        </div>
        {/* Alamat */}
        <div className="space-y-2">
          <Label htmlFor={`address-${memberIndex}`} className="text-white">Alamat <span className="text-red-500">*</span></Label>
          <Textarea id={`address-${memberIndex}`} value={member.address} onChange={(e) => updateMember(memberIndex, "address", e.target.value)} placeholder="Isi dengan alamat seperlunya" className="bg-slate-800 border-slate-700 text-white min-h-[100px]" required />
        </div>
      </div>
    );
  };
  
  // Main JSX render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"><Users className="w-8 h-8 text-white" /></div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Pendaftaran Tim</h1>
                        <p className="text-slate-400">{competitionTitle}</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-4">
                    {Array.from({ length: maxTeamSize }).map((_, step) => (
                    <div key={step} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step <= currentStep ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400"}`}>
                            {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step + 1}
                        </div>
                        {step < lastStepIndex && (<div className={`w-16 h-1 mx-2 transition-colors ${step < currentStep ? "bg-blue-600" : "bg-slate-700"}`} />)}
                    </div>
                    ))}
                </div>
            </div>
             <div className="flex justify-center mb-8">
                <div className="flex space-x-16 text-sm">
                    {memberTitles.map((title, index) => (<div key={index} className={`text-center transition-colors ${index <= currentStep ? "text-blue-400" : "text-slate-500"}`}>{title}</div>))}
                </div>
            </div>

            {/* Info Card */}
            <Card className="mt-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-amber-200 font-medium">Penting untuk diperhatikan:</p>
                    <ul className="list-disc list-outside pl-4 text-amber-100 text-sm space-y-1">
                      <li>Pastikan semua data yang diisi benar dan sesuai identitas</li>
                      <li>Data yang sudah disimpan tidak dapat diubah setelah pembayaran</li>
                      <li>Semua anggota tim harus dari jenjang pendidikan yang <strong>SAMA</strong> (Contoh: Semua anggota berjenjang SMA/Sederajat)</li>
                      <li><strong>TIDAK</strong> boleh ada salah satu anggota tim yang berbeda jenjang (Misal: Ketua Tim SMA, sedangkan salah satu/kedua Anggota Tim SMP)</li>
                      <li>Setiap peserta harus dari <strong>Asal Sekolah yang SAMA</strong></li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add spacing between cards */}
            <Card className="mt-6 bg-slate-900/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Step {currentStep + 1} of {maxTeamSize}</Badge>
                        {memberTitles[currentStep]}
                    </CardTitle>
                    <CardDescription>Lengkapi data {memberTitles[currentStep].toLowerCase()} dengan benar</CardDescription>
                </CardHeader>
                <CardContent>
                    {renderMemberForm(currentStep)}
                    <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
                        <Button variant="ghost" onClick={() => (window.location.href = "/dashboard")} className="text-slate-400 hover:bg-slate-800 hover:text-slate-200">Kembali ke Dashboard</Button>
                        <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0} className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"><ArrowLeft className="w-4 h-4 mr-2" />Sebelumnya</Button>
                        <Button onClick={handleNext} disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                            {isSubmitting ? "Menyimpan..." : currentStep === lastStepIndex ? (<>Selesai & Lanjut Pembayaran<CreditCard className="text-white w-4 h-4 ml-2" /></>) : (<>Selanjutnya<ArrowRight className="text-white w-4 h-4 ml-2" /></>)}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}