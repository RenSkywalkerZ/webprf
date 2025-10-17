"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  Upload,
  FileText,
  ImageIcon,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Trophy,
  Loader2,
  CalendarDays,
  Timer,
  Zap,
  FileCheck
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Registration {
  id: string
  competition_id: string
  status: string
  displayCategory: string
}

interface Competition {
  id: string
  title: string
  allowedTypes: string[]
  accept: string
  deadline: string
  description?: string
}

interface Submission {
  id: string
  title?: string
  created_at: string
  file_url: string
  competition_id: string
  original_filename: string
  file_public_id?: string
  mime_type?: string
  size_bytes?: number
  submission_type?: 'karya' | 'surat_pernyataan'
}

interface SubmissionsProps {
  userData: any
}

// [MODIFIED] Konfigurasi untuk babak PENYISIHAN (digunakan sebagai fallback/referensi)
const PRELIMINARY_COMPETITION_CONFIG: Record<string, Competition> = {
  "3d4e5cca-cf3d-45d7-8849-2a614b82f4d4": { id: "3d4e5cca-cf3d-45d7-8849-2a614b82f4d4", title: "Scientific Writing", allowedTypes: ["application/pdf"], accept: ".pdf", deadline: "2025-09-29T23:59:59", description: "Babak Penyisihan" },
  "43ec1f50-2102-4a4b-995b-e33e61505b22": { id: "43ec1f50-2102-4a4b-995b-e33e61505b22", title: "Science Project", allowedTypes: ["application/pdf"], accept: ".pdf", deadline: "2025-09-30T23:59:59", description: "Babak Penyisihan" },
  "331aeb0c-8851-4638-aa34-6502952f098b": { id: "331aeb0c-8851-4638-aa34-6502952f098b", title: "Depict Physics", allowedTypes: ["image/jpeg", "image/jpg", "image/png"], accept: ".jpg,.jpeg,.png", deadline: "2025-09-30T23:59:59", description: "Babak Penyisihan" },
}

// [NEW] "SAKLAR UTAMA": Konfigurasi ini menandakan bahwa pengumuman semifinal/final SUDAH DIRILIS
const NEXT_STAGE_CONFIG: Record<string, Competition> = {
  "3d4e5cca-cf3d-45d7-8849-2a614b82f4d4": {
    id: "3d4e5cca-cf3d-45d7-8849-2a614b82f4d4",
    title: "Scientific Writing",
    allowedTypes: ["application/pdf"],
    accept: ".pdf",
    deadline: "2025-10-10T23:59:59",
    description: "Babak Semifinal"
  },
    "43ec1f50-2102-4a4b-995b-e33e61505b22": { 
    id: "43ec1f50-2102-4a4b-995b-e33e61505b22", 
    title: "Science Project", 
    allowedTypes: ["video/external"], // UBAH INI
    accept: "", // Kosongkan (tidak dipakai untuk link)
    deadline: "2025-10-15T23:59:59", 
    description: "Babak Semifinal" 
    },
    "331aeb0c-8851-4638-aa34-6502952f098b": {
    id: "331aeb0c-8851-4638-aa34-6502952f098b",
    title: "Depict Physics",
    allowedTypes: ["video/external"],
    accept: "",
    deadline: "2025-10-25T23:59:59", // Atur deadline FINAL DP di sini
    description: "Babak Final" // Ubah deskripsi menjadi "Babak Final"
  },

  // Kapan pun SP atau DP siap, cukup tambahkan konfigurasinya di sini
}

const DECLARATION_TEXT =
  "Saya yang mengumpulkan dokumen ini dengan sebenarnya menyatakan bahwa karya ini Saya susun tanpa tindakan plagiarisme. Jika di kemudian hari ternyata Saya melakukan tindakan plagiarisme, Saya akan bertanggung jawab sepenuhnya dan menerima sanksi yang dijatuhkan."

// Validation constants
const MAX_DESCRIPTION_LENGTH = 100
const MAX_DECLARATION_DESC_LENGTH = 100
const SCIENCE_PROJECT_ID = "43ec1f50-2102-4a4b-995b-e33e61505b22"

// --- HELPER FUNCTIONS (Unchanged) ---
const calculateTimeLeft = (deadline: string) => {
  const now = new Date().getTime()
  const deadlineTime = new Date(deadline).getTime()
  const difference = deadlineTime - now
  if (difference <= 0) return { expired: true, days: 0, hours: 0, minutes: 0 }
  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
  return { expired: false, days, hours, minutes }
}

const isDeadlinePassed = (deadline: string) => {
  return new Date().getTime() > new Date(deadline).getTime()
}

const getUrgencyStyle = (days: number) => {
  if (days <= 1) return { gradient: "from-red-500 to-orange-500", bgColor: "bg-red-500/10", borderColor: "border-red-500/30", textColor: "text-red-300", icon: Zap }
  if (days <= 3) return { gradient: "from-orange-500 to-yellow-500", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/30", textColor: "text-orange-300", icon: Timer }
  return { gradient: "from-blue-500 to-purple-500", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30", textColor: "text-blue-300", icon: CalendarDays }
}

// --- SUB-COMPONENTS ---
const DeadlineReminderCard = ({ registrations, semifinalCompetitions }: { registrations: Registration[], semifinalCompetitions: string[] }) => {
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    const upcomingDeadlines = registrations
        .filter(reg => semifinalCompetitions.includes(reg.competition_id) && NEXT_STAGE_CONFIG[reg.competition_id])
        .map(reg => {
            const competition = NEXT_STAGE_CONFIG[reg.competition_id]!
            const timeLeft = calculateTimeLeft(competition.deadline)
            return { ...reg, competition, timeLeft, urgencyStyle: getUrgencyStyle(timeLeft.days) }
        })
        .filter((item): item is NonNullable<typeof item> => item !== null && !item.timeLeft.expired)
        .sort((a, b) => a.timeLeft.days - b.timeLeft.days)

    if (upcomingDeadlines.length === 0) return null

    const mostUrgent = upcomingDeadlines[0]!
    const UrgentIcon = mostUrgent.urgencyStyle.icon

    return (
        <Card className={`${mostUrgent.urgencyStyle.bgColor} ${mostUrgent.urgencyStyle.borderColor} border-2`}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${mostUrgent.urgencyStyle.gradient}`}><UrgentIcon className="w-5 h-5 text-white" /></div>
                    Deadline Submisi Babak Semifinal
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {upcomingDeadlines.map((item) => {
                    const ItemIcon = item.urgencyStyle.icon
                    const timeLeft = item.timeLeft
                    return (
                        <div key={item.id} className={`p-4 rounded-lg ${item.urgencyStyle.bgColor} ${item.urgencyStyle.borderColor} border`}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg bg-gradient-to-r ${item.urgencyStyle.gradient}`}><ItemIcon className="w-4 h-4 text-white" /></div>
                                    <div>
                                        <h4 className="font-semibold text-white">{item.competition.title}</h4>
                                        <p className="text-slate-300 text-sm">{item.competition.description}</p>
                                        <p className="text-slate-400 text-xs mt-1">Deadline: {new Date(item.competition.deadline).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-lg font-bold ${item.urgencyStyle.textColor}`}>{timeLeft.days > 0 && `${timeLeft.days} hari `}{timeLeft.hours} jam {timeLeft.minutes} menit</div>
                                    <div className="text-slate-400 text-xs">tersisa</div>
                                </div>
                            </div>
                            {timeLeft.days <= 1 && (<div className="mt-3 flex items-center gap-2 p-2 bg-red-500/20 rounded border border-red-500/30"><Zap className="w-4 h-4 text-red-300" /><span className="text-red-300 text-sm font-medium">{timeLeft.days === 0 ? "Batas akhir hari ini!" : "Batas akhir besok!"}</span></div>)}
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}

export function Submissions({ userData }: SubmissionsProps) {
    const [registrations, setRegistrations] = useState<Registration[]>([])
    const [submissions, setSubmissions] = useState<Record<string, Submission[]>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [semifinalCompetitions, setSemifinalCompetitions] = useState<string[]>([])
    const [uploadStates, setUploadStates] = useState<Record<string, any>>({})
    const { toast } = useToast()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [semifinalRes, registrationsRes, submissionsRes] = await Promise.all([
                fetch("/api/users/semifinal-status"),
                fetch("/api/users/registrations"),
                fetch("/api/submissions")
            ]);

            if (!semifinalRes.ok || !registrationsRes.ok || !submissionsRes.ok) throw new Error("Gagal memuat data.");

            const { semifinalCompetitions: semifinalIds } = await semifinalRes.json();
            setSemifinalCompetitions(semifinalIds || []);

            const { registrations: allRegistrations } = await registrationsRes.json();
            const approvedRegistrations = allRegistrations.filter((reg: Registration) => reg.status === "approved");
            setRegistrations(approvedRegistrations);

            const initialStates: Record<string, any> = {};
            approvedRegistrations.forEach((reg: Registration) => {
              if (NEXT_STAGE_CONFIG[reg.competition_id]) {
                initialStates[reg.competition_id] = {
                  file: null,
                  videoLink: "", // Pastikan baris ini ada
                  description: "",
                  declarationFile: null,
                  declarationDescription: "Surat Pernyataan Orisinalitas",
                  declarationChecked: false,
                  isUploading: false,
                  isUploadingDeclaration: false,
                };
              }
            });
            setUploadStates(initialStates);

            const { submissions: userSubmissions } = await submissionsRes.json();
            const groupedSubmissions = userSubmissions.reduce((acc: Record<string, Submission[]>, sub: Submission) => {
                (acc[sub.competition_id] = acc[sub.competition_id] || []).push(sub);
                return acc;
            }, {});
            setSubmissions(groupedSubmissions);

        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (competitionId: string, file: File | null, type: 'main' | 'declaration' = 'main') => {
        const competition = NEXT_STAGE_CONFIG[competitionId];
        if (!file || !competition) return;

        const allowedTypes = type === 'declaration' ? ['application/pdf'] : competition.allowedTypes;
        const accept = type === 'declaration' ? '.pdf' : competition.accept;

        if (!allowedTypes.includes(file.type)) { toast({ title: "Tipe File Salah", description: `Hanya file ${accept} yang diizinkan.`, variant: "destructive" }); return; }
        if (file.size > 10 * 1024 * 1024) { toast({ title: "File Terlalu Besar", description: "Ukuran file maksimal 10MB.", variant: "destructive" }); return; }

        const fieldName = type === 'declaration' ? 'declarationFile' : 'file';
        setUploadStates(prev => ({ ...prev, [competitionId]: { ...prev[competitionId], [fieldName]: file } }));
    };

    const handleInputChange = (competitionId: string, field: string, value: string | boolean) => {
        setUploadStates(prev => ({ ...prev, [competitionId]: { ...prev[competitionId], [field]: value } }));
    };

   const handleSubmit = async (competitionId: string, type: 'main' | 'declaration' = 'main') => {
  const state = uploadStates[competitionId]
  const competition = NEXT_STAGE_CONFIG[competitionId]
  if (!competition || !state) return

  // Conditional validation
  if (competitionId === SCIENCE_PROJECT_ID || competitionId === "331aeb0c-8851-4638-aa34-6502952f098b") {
    // Validate link for Science Project
    if (!state.videoLink || !state.videoLink.includes('drive.google.com')) {
      toast({
        title: "Link Tidak Valid",
        description: "Masukkan link Google Drive yang valid",
        variant: "destructive"
      })
      return
    }
  } else {
    // Validate file for others
    const file = type === 'declaration' ? state.declarationFile : state.file
    if (!file) return
  }

  if (type === 'main' && !state.declarationChecked) return
  if (isDeadlinePassed(competition.deadline)) {
    toast({ title: "Deadline Terlewat", variant: "destructive" })
    return
  }

  const uploadingField = type === 'declaration' ? 'isUploadingDeclaration' : 'isUploading'
  setUploadStates(prev => ({ 
    ...prev, 
    [competitionId]: { ...prev[competitionId], [uploadingField]: true } 
  }))

  const formData = new FormData()
  formData.append("competition_id", competitionId)
  formData.append("description", state.description || "")
  formData.append("submission_type", type === 'declaration' ? 'surat_pernyataan' : 'karya')
  formData.append("declaration_checked", "true")
  
  // Conditional: append link OR file
  if ((competitionId === SCIENCE_PROJECT_ID || competitionId === "331aeb0c-8851-4638-aa34-6502952f098b") && type === 'main') {
    formData.append("video_link", state.videoLink)
  } else {
    const file = type === 'declaration' ? state.declarationFile : state.file
    formData.append("file", file)
  }

  try {
    const response = await fetch("/api/submissions", { method: "POST", body: formData })
    const data = await response.json()
    
    if (!response.ok) throw new Error(data.error || "Gagal submit")
    
    toast({ 
      title: "Submisi Berhasil!", 
      description: competitionId === SCIENCE_PROJECT_ID 
        ? "Link video berhasil disimpan" 
        : "File berhasil diunggah" 
    })
    
    await fetchData()
  } catch (error: any) {
    toast({ title: "Submisi Gagal", description: error.message, variant: "destructive" })
  } finally {
    setUploadStates(prev => ({ 
      ...prev, 
      [competitionId]: { ...prev[competitionId], [uploadingField]: false } 
    }))
  }
} 

    const handleDelete = async (submission: Submission) => {
        if (!confirm("Anda yakin ingin menghapus submisi ini? Tindakan ini tidak dapat diurungkan.")) return;
        try {
            const res = await fetch(`/api/submissions/${submission.id}`, { method: "DELETE" });
            if (res.ok) {
                toast({ title: "Berhasil Dihapus", description: "Submisi Anda telah dihapus." });
                await fetchData();
            } else {
                const errorData = await res.json();
                throw new Error(errorData.error || "Gagal menghapus submisi");
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="text-center"><div className="flex items-center justify-center gap-3 mb-4"><div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse"><Upload className="w-8 h-8 text-white" /></div><div><h1 className="text-3xl font-bold text-white">Submissions</h1><p className="text-slate-400">Loading...</p></div></div></div>
                {[1, 2, 3].map((i) => (<Card key={i} className="bg-slate-900/50 border-slate-700 animate-pulse"><CardHeader><div className="h-6 bg-slate-700 rounded w-1/3"></div></CardHeader><CardContent><div className="space-y-4"><div className="h-4 bg-slate-700 rounded w-3/4"></div><div className="h-32 bg-slate-700/50 rounded"></div></div></CardContent></Card>))}
            </div>
        );
    }

    const visibleRegistrations = registrations.filter(reg => PRELIMINARY_COMPETITION_CONFIG[reg.competition_id]);
    
    return (
        <div className="space-y-6">
            <div className="text-center"><div className="flex items-center justify-center gap-3 mb-4"><div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"><Upload className="w-8 h-8 text-white" /></div><div><h1 className="text-3xl font-bold text-white">Submisi Babak Semifinal</h1><p className="text-slate-400">Status dan unggah karya untuk babak selanjutnya.</p></div></div></div>
            <DeadlineReminderCard registrations={registrations} semifinalCompetitions={semifinalCompetitions} />

            {visibleRegistrations.length === 0 && (<Card className="bg-slate-900/50 border-slate-700"><CardContent className="text-center py-12"><Trophy className="w-16 h-16 mx-auto mb-4 text-slate-600" /><h3 className="text-white font-semibold mb-2">Tidak Ada Submisi Aktif</h3><p className="text-slate-400 text-sm max-w-md mx-auto">Anda tidak terdaftar di kompetisi yang memerlukan submisi pada tahap ini.</p></CardContent></Card>)}
            
            {visibleRegistrations.map((registration) => {
                const { competition_id } = registration;
                const isSemifinalist = semifinalCompetitions.includes(competition_id);
                
                // Cek apakah pengumuman untuk lomba ini sudah dirilis
                const isNextStageAnnounced = !!NEXT_STAGE_CONFIG[competition_id];

                if (isNextStageAnnounced) {
                    // --- LOGIKA UNTUK LOMBA YANG PENGUMUMANNYA SUDAH RILIS (misal: Scientific Writing) ---
                    if (isSemifinalist) {
                        // Tampilkan form submisi lengkap untuk yang lolos
                        const competition = NEXT_STAGE_CONFIG[competition_id]!;
                        const state = uploadStates[competition_id] || {};
                        const competitionSubmissions = submissions[competition_id] || [];
                        const deadlinePassed = isDeadlinePassed(competition.deadline);
                        const timeLeft = calculateTimeLeft(competition.deadline);
                        const karyaSubmissions = competitionSubmissions.filter(s => !s.submission_type || s.submission_type === 'karya');
                        const declarationSubmissions = competitionSubmissions.filter(s => s.submission_type === 'surat_pernyataan');
                        const isPdf = competition.allowedTypes.includes("application/pdf");

                        return (
                            <Card key={registration.competition_id} className="bg-slate-900/50 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">{isPdf ? (<FileText className="w-5 h-5 text-blue-400" />) : (<ImageIcon className="w-5 h-5 text-green-400" />)}{competition.title}{deadlinePassed && (<Badge className="bg-red-500/20 text-red-300 border-red-500/30 ml-auto">Deadline Passed</Badge>)}{!deadlinePassed && timeLeft.days <= 1 && (<Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 ml-auto animate-pulse">Closing Soon!</Badge>)}</CardTitle>
                                    <CardDescription className="flex items-center gap-2 flex-wrap"><Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">{competition.description}</Badge><span className="text-slate-400">Upload karya dan surat pernyataan orisinalitas</span>{!deadlinePassed && (<span className="text-slate-500 text-xs">• Deadline: {new Date(competition.deadline).toLocaleString("id-ID", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>)}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {deadlinePassed && (<div className="bg-red-500/10 border-2 border-red-500/30 rounded-lg p-4"><div className="flex items-start gap-3"><AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" /><div><h4 className="text-red-300 font-semibold mb-1">Submission Period Closed</h4><p className="text-red-200 text-sm">The deadline for this competition has passed. You can no longer submit new files.</p></div></div></div>)}
                                    <div className="space-y-4"><div className="flex items-center gap-2 mb-4">{isPdf ? (<FileText className="w-5 h-5 text-blue-400" />) : (<ImageIcon className="w-5 h-5 text-green-400" />)}<h3 className="text-white font-semibold text-lg">Upload Karya Utama</h3>{deadlinePassed && (<Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">Closed</Badge>)}</div>{competition_id === SCIENCE_PROJECT_ID || competition_id === "331aeb0c-8851-4638-aa34-6502952f098b" ? (
  // === SCIENCE PROJECT: LINK INPUT ===
  <>
    <div>
      <Label htmlFor={`video-link-${competition_id}`} className="text-white">
        Link Video Google Drive <span className="text-red-500">*</span>
      </Label>
      <Input
        id={`video-link-${competition_id}`}
        type="url"
        placeholder="https://drive.google.com/..."
        value={state.videoLink || ""}
        onChange={(e) => handleInputChange(competition_id, "videoLink", e.target.value)}
        className="bg-slate-800 border-slate-700 text-white"
        disabled={state.isUploading || deadlinePassed}
      />
      <div className="mt-2 space-y-2">
        <p className="text-slate-400 text-sm">
          💡 Upload karya Anda ke Google Drive, set permission "Anyone with the link",
           lalu paste link-nya di sini.
        </p>
        <details className="text-slate-400 text-xs">
          <summary className="cursor-pointer hover:text-slate-300">
            📖 Cara upload ke Google Drive →
          </summary>
          <ol className="list-decimal ml-5 mt-2 space-y-1 text-slate-500">
            <li>Upload karya ke Google Drive Anda</li>
            <li>Klik kanan pada video → Get link / Bagikan</li>
            <li>Ubah permission ke "Anyone with the link can view"</li>
            <li>Copy link dan paste di form ini</li>
          </ol>
        </details>
      </div>
    </div>
  </>
) : (
  // === OTHER COMPETITIONS: FILE UPLOAD ===
  <>
    <div>
      <Label htmlFor={`file-${competition_id}`} className="text-white">
        File Karya <span className="text-red-500">*</span>
      </Label>
      <Input
        id={`file-${competition_id}`}
        type="file"
        accept={competition.accept}
        onChange={(e) => handleFileChange(competition_id, e.target.files?.[0] || null, 'main')}
        className="bg-slate-800 border-slate-700 text-white file:bg-slate-700 file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded-md"
        disabled={state.isUploading || deadlinePassed}
      />
      <p className="text-slate-400 text-sm mt-1">
        {isPdf ? "Format PDF, maks. 10MB" : "Format JPG, PNG maks. 10MB"}
      </p>
    </div>
  </>
)}<div><div className="flex items-center justify-between mb-2"><Label htmlFor={`desc-${registration.competition_id}`} className="text-white">Judul Karya</Label><span className={`text-xs ${(state.description?.length || 0) > MAX_DESCRIPTION_LENGTH ? "text-red-400 font-semibold" : "text-slate-500"}`}>{state.description?.length || 0}/{MAX_DESCRIPTION_LENGTH}</span></div><Textarea id={`desc-${registration.competition_id}`} value={state.description || ""} onChange={(e) => handleInputChange(registration.competition_id, "description", e.target.value)} placeholder="Contoh: 'Karya Babak Semifinal Scientific Writing'" className={`bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 ${(state.description?.length || 0) > MAX_DESCRIPTION_LENGTH ? "border-red-500 focus:border-red-500" : ""}`} disabled={state.isUploading || deadlinePassed} maxLength={MAX_DESCRIPTION_LENGTH + 50} />{(state.description?.length || 0) > MAX_DESCRIPTION_LENGTH && (<p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Judul terlalu panjang, maks {MAX_DESCRIPTION_LENGTH} kata</p>)}</div><div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4"><div className="flex items-start space-x-3"><Checkbox id={`declaration-${registration.competition_id}`} checked={state.declarationChecked || false} onCheckedChange={(checked) => handleInputChange(registration.competition_id, "declarationChecked", checked as boolean)} disabled={state.isUploading || deadlinePassed} className="mt-1" /><div className="space-y-1"><Label htmlFor={`declaration-${registration.competition_id}`} className="text-amber-200 font-medium cursor-pointer">Setujui Pernyataan <span className="text-red-500">*</span></Label><p className="text-amber-100 text-sm leading-relaxed">{DECLARATION_TEXT}</p></div></div></div><Button onClick={() => handleSubmit(registration.competition_id, 'main')} disabled={
    (competition_id === SCIENCE_PROJECT_ID || competition_id === "331aeb0c-8851-4638-aa34-6502952f098b")
      ? !state.videoLink || !state.declarationChecked || state.isUploading || deadlinePassed
      : !state.file || !state.declarationChecked || state.isUploading || deadlinePassed
  } className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">{deadlinePassed ? (<><AlertTriangle className="w-4 h-4 mr-2" />Submission Closed</>) : state.isUploading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading Karya...</>) : (<><Upload className="w-4 h-4 mr-2" />Submit Karya</>)}</Button></div>
                                    <Separator className="bg-slate-600" />
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-4"><FileCheck className="w-5 h-5 text-green-400" /><h3 className="text-white font-semibold text-lg">Upload Surat Pernyataan Orisinalitas</h3>{deadlinePassed && (<Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">Closed</Badge>)}</div>
                                        <div><Label htmlFor={`declaration-file-${registration.competition_id}`} className="text-white">File Surat Pernyataan <span className="text-red-500">*</span></Label><Input id={`declaration-file-${registration.competition_id}`} type="file" accept=".pdf" onChange={(e) => handleFileChange(registration.competition_id, e.target.files?.[0] || null, 'declaration')} className="bg-slate-800 border-slate-700 text-white file:bg-slate-700 file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded-md" disabled={state.isUploadingDeclaration || deadlinePassed} /><p className="text-slate-400 text-sm mt-1">Format PDF, maks. 10MB - Surat pernyataan orisinalitas yang sudah ditandatangani</p></div>
                                        <Button onClick={() => handleSubmit(registration.competition_id, 'declaration')} disabled={!state.declarationFile || state.isUploadingDeclaration || deadlinePassed} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">{deadlinePassed ? (<><AlertTriangle className="w-4 h-4 mr-2" />Submission Closed</>) : state.isUploadingDeclaration ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading Surat Pernyataan...</>) : (<><FileCheck className="w-4 h-4 mr-2" />Submit Surat Pernyataan</>)}</Button>
                                    </div>
                                    <Separator className="bg-slate-600" />
                                    <div className="space-y-6"><h3 className="text-white font-semibold text-lg">My Submissions</h3><div><h4 className="text-white font-medium mb-3 flex items-center gap-2">{isPdf ? (<FileText className="w-4 h-4 text-blue-400" />) : (<ImageIcon className="w-4 h-4 text-green-400" />)}Karya Utama</h4>{karyaSubmissions.length > 0 ? (<div className="bg-slate-800/50 rounded-lg border border-slate-600"><Table><TableHeader><TableRow className="border-slate-600"><TableHead className="text-slate-300">Title</TableHead><TableHead className="text-slate-300">Submitted</TableHead><TableHead className="text-slate-300">Actions</TableHead><TableHead className="text-slate-300">Delete</TableHead></TableRow></TableHeader><TableBody>{karyaSubmissions.map((submission) => (<TableRow key={submission.id} className="border-slate-600"><TableCell className="text-white">{submission.title || "-"}</TableCell><TableCell className="text-slate-300">{new Date(submission.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</TableCell><TableCell><div className="flex items-center gap-2"><Button size="sm" variant="outline" onClick={() => window.open(submission.file_url, "_blank")} className="border-slate-600 text-slate-300 hover:bg-slate-700"><Eye className="w-3 h-3 mr-1" />View</Button><Button size="sm" variant="outline" onClick={() => { const link = document.createElement("a"); link.href = submission.file_url; link.download = submission.original_filename || `${competition.title}_karya_${submission.id}`; link.click(); }} className="border-slate-600 text-slate-300 hover:bg-slate-700"><Download className="w-3 h-3 mr-1" />Download</Button></div></TableCell><TableCell><Button size="sm" variant="outline" onClick={() => handleDelete(submission)} className="border-slate-600 text-red-400 hover:bg-red-600/20">✕</Button></TableCell></TableRow>))}</TableBody></Table></div>) : (<div className="bg-slate-800/30 rounded-lg border border-slate-600 p-6 text-center"><FileText className="w-10 h-10 mx-auto mb-2 text-slate-600" /><p className="text-slate-400 text-sm">No karya submissions yet</p></div>)}</div><div><h4 className="text-white font-medium mb-3 flex items-center gap-2"><FileCheck className="w-4 h-4 text-green-400" />Surat Pernyataan Orisinalitas</h4>{declarationSubmissions.length > 0 ? (<div className="bg-slate-800/50 rounded-lg border border-slate-600"><Table><TableHeader><TableRow className="border-slate-600"><TableHead className="text-slate-300">Title</TableHead><TableHead className="text-slate-300">Submitted</TableHead><TableHead className="text-slate-300">Actions</TableHead><TableHead className="text-slate-300">Delete</TableHead></TableRow></TableHeader><TableBody>{declarationSubmissions.map((submission) => (<TableRow key={submission.id} className="border-slate-600"><TableCell className="text-white">{submission.title || "Surat Pernyataan Orisinalitas"}</TableCell><TableCell className="text-slate-300">{new Date(submission.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</TableCell><TableCell><div className="flex items-center gap-2"><Button size="sm" variant="outline" onClick={() => window.open(submission.file_url, "_blank")} className="border-slate-600 text-slate-300 hover:bg-slate-700"><Eye className="w-3 h-3 mr-1" />View</Button><Button size="sm" variant="outline" onClick={() => { const link = document.createElement("a"); link.href = submission.file_url; link.download = submission.original_filename || `${competition.title}_surat_${submission.id}`; link.click(); }} className="border-slate-600 text-slate-300 hover:bg-slate-700"><Download className="w-3 h-3 mr-1" />Download</Button></div></TableCell><TableCell><Button size="sm" variant="outline" onClick={() => handleDelete(submission)} className="border-slate-600 text-red-400 hover:bg-red-600/20">✕</Button></TableCell></TableRow>))}</TableBody></Table></div>) : (<div className="bg-slate-800/30 rounded-lg border border-slate-600 p-6 text-center"><FileCheck className="w-10 h-10 mx-auto mb-2 text-slate-600" /><p className="text-slate-400 text-sm">No surat pernyataan submissions yet</p></div>)}</div></div>
                                </CardContent>
                            </Card>
                        );
                    } else {
                        // Tampilkan pesan "tidak lolos" karena pengumuman SUDAH ADA
                        const competitionDetails = NEXT_STAGE_CONFIG[competition_id]!;
                        const isPdf = competitionDetails.allowedTypes.includes("application/pdf");
                        return (
                            <Card key={competition_id} className="bg-slate-900/50 border-slate-700">
                                <CardHeader><CardTitle className="text-white flex items-center gap-2">{isPdf ? <FileText className="w-5 h-5 text-blue-400" /> : <ImageIcon className="w-5 h-5 text-green-400" />}{competitionDetails.title}</CardTitle></CardHeader>
                                <CardContent className="text-center py-10"><Trophy className="w-12 h-12 mx-auto mb-4 text-slate-500" /><h3 className="text-white font-semibold mb-2">Babak Penyisihan Telah Selesai</h3><p className="text-slate-400 text-sm max-w-md mx-auto">Terima kasih telah berpartisipasi dan menuangkan karya terbaik Anda di babak penyisihan. Meskipun perjalanan Anda di kompetisi ini belum berlanjut, kami harap semangat berkarya Anda tidak pernah padam. Sampai jumpa di kesempatan berikutnya!</p></CardContent>
                            </Card>
                        );
                    }
                } else {
                    // --- LOGIKA UNTUK LOMBA YANG PENGUMUMANNYA BELUM DIRILIS (misal: SP & DP) ---
                    const competitionDetails = PRELIMINARY_COMPETITION_CONFIG[competition_id];
                    if (competitionDetails) {
                        return (
                            <Card key={competition_id} className="bg-slate-900/50 border-slate-700">
                                <CardHeader><CardTitle className="text-white flex items-center gap-2">{competitionDetails.allowedTypes.includes("application/pdf") ? <FileText className="w-5 h-5 text-blue-400" /> : <ImageIcon className="w-5 h-5 text-green-400" />}{competitionDetails.title}</CardTitle></CardHeader>
                                <CardContent className="text-center py-10"><Clock className="w-12 h-12 mx-auto mb-4 text-slate-500" /><h3 className="text-white font-semibold mb-2">Babak Penyisihan Telah Selesai</h3><p className="text-slate-400 text-sm max-w-md mx-auto">Terima kasih atas partisipasi Anda. Nantikan pengumuman untuk babak selanjutnya.</p></CardContent>
                            </Card>
                        );
                    }
                }

                return null;
            })}
        </div>
    )
}

