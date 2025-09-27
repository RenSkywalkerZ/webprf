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
  submission_type?: 'karya' | 'surat_pernyataan'  // Tambahan untuk membedakan jenis submission
}

interface SubmissionsProps {
  userData: any
}

const COMPETITION_CONFIG: Record<string, Competition> = {
  "3d4e5cca-cf3d-45d7-8849-2a614b82f4d4": {
    id: "3d4e5cca-cf3d-45d7-8849-2a614b82f4d4",
    title: "Scientific Writing",
    allowedTypes: ["application/pdf"],
    accept: ".pdf",
    deadline: "2025-09-29T23:59:59",
    description: "Babak Penyisihan"
  },
  "43ec1f50-2102-4a4b-995b-e33e61505b22": {
    id: "43ec1f50-2102-4a4b-995b-e33e61505b22",
    title: "Science Project",
    allowedTypes: ["application/pdf"],
    accept: ".pdf",
    deadline: "2025-09-30T23:59:59",
    description: "Babak Penyisihan"
  },
  "331aeb0c-8851-4638-aa34-6502952f098b": {
    id: "331aeb0c-8851-4638-aa34-6502952f098b",
    title: "Depict Physics",
    allowedTypes: ["image/jpeg", "image/jpg", "image/png"],
    accept: ".jpg,.jpeg,.png",
    deadline: "2025-09-30T23:59:59",
    description: "Babak Penyisihan"
  },
}

const DECLARATION_TEXT =
  "Saya yang mengumpulkan dokumen ini dengan sebenarnya menyatakan bahwa karya ini Saya susun tanpa tindakan plagiarisme. Jika di kemudian hari ternyata Saya melakukan tindakan plagiarisme, Saya akan bertanggung jawab sepenuhnya dan menerima sanksi yang dijatuhkan."

// Fungsi helper untuk menghitung sisa waktu
const calculateTimeLeft = (deadline: string) => {
  const now = new Date().getTime()
  const deadlineTime = new Date(deadline).getTime()
  const difference = deadlineTime - now

  if (difference <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0 }
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

  return { expired: false, days, hours, minutes }
}

// Fungsi untuk mendapatkan style berdasarkan urgency
const getUrgencyStyle = (days: number) => {
  if (days <= 1) {
    return {
      gradient: "from-red-500 to-orange-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      textColor: "text-red-300",
      icon: Zap
    }
  } else if (days <= 3) {
    return {
      gradient: "from-orange-500 to-yellow-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
      textColor: "text-orange-300",
      icon: Timer
    }
  } else {
    return {
      gradient: "from-blue-500 to-purple-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-300",
      icon: CalendarDays
    }
  }
}

// Component Deadline Reminder Card
const DeadlineReminderCard = ({ registrations }: { registrations: Registration[] }) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update setiap menit

    return () => clearInterval(timer)
  }, [])

  const upcomingDeadlines = registrations
    .map(reg => {
      const competition = COMPETITION_CONFIG[reg.competition_id]
      if (!competition) return null
      
      const timeLeft = calculateTimeLeft(competition.deadline)
      return {
        ...reg,
        competition,
        timeLeft,
        urgencyStyle: getUrgencyStyle(timeLeft.days)
      }
    })
    .filter(item => item && !item.timeLeft.expired)
    .sort((a, b) => a!.timeLeft.days - b!.timeLeft.days)

  if (upcomingDeadlines.length === 0) return null

  const mostUrgent = upcomingDeadlines[0]!
  const UrgentIcon = mostUrgent.urgencyStyle.icon

  return (
    <Card className={`${mostUrgent.urgencyStyle.bgColor} ${mostUrgent.urgencyStyle.borderColor} border-2`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-white">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${mostUrgent.urgencyStyle.gradient}`}>
            <UrgentIcon className="w-5 h-5 text-white" />
          </div>
          Deadline Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingDeadlines.map((item) => {
          const ItemIcon = item!.urgencyStyle.icon
          const timeLeft = item!.timeLeft
          
          return (
            <div 
              key={item!.id} 
              className={`p-4 rounded-lg ${item!.urgencyStyle.bgColor} ${item!.urgencyStyle.borderColor} border`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${item!.urgencyStyle.gradient}`}>
                    <ItemIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{item!.competition.title}</h4>
                    <p className="text-slate-300 text-sm">{item!.competition.description}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Deadline: {new Date(item!.competition.deadline).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric", 
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${item!.urgencyStyle.textColor}`}>
                    {timeLeft.days > 0 && `${timeLeft.days}d `}
                    {timeLeft.hours}h {timeLeft.minutes}m
                  </div>
                  <div className="text-slate-400 text-xs">remaining</div>
                </div>
              </div>
              
              {timeLeft.days <= 1 && (
                <div className="mt-3 flex items-center gap-2 p-2 bg-red-500/20 rounded border border-red-500/30">
                  <Zap className="w-4 h-4 text-red-300" />
                  <span className="text-red-300 text-sm font-medium">
                    {timeLeft.days === 0 ? "Due today!" : "Due tomorrow!"}
                  </span>
                </div>
              )}
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
  const [uploadStates, setUploadStates] = useState<
    Record<
      string,
      {
        // Upload karya utama
        file: File | null
        description: string
        // Upload surat pernyataan
        declarationFile: File | null
        declarationDescription: string
        declarationChecked: boolean
        isUploading: boolean
        isUploadingDeclaration: boolean
      }
    >
  >({})
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch user's approved registrations
      const registrationsResponse = await fetch("/api/users/registrations")
      if (registrationsResponse.ok) {
        const { registrations: allRegistrations } = await registrationsResponse.json()

        // Filter for approved registrations that match our target competitions
        const targetCompetitions = Object.keys(COMPETITION_CONFIG)
        const approvedRegistrations = allRegistrations.filter(
          (reg: Registration) => reg.status === "approved" && targetCompetitions.includes(reg.competition_id),
        )

        setRegistrations(approvedRegistrations)

        // Initialize upload states for each registration
        const initialStates: Record<string, any> = {}
        approvedRegistrations.forEach((reg: Registration) => {
          initialStates[reg.competition_id] = {
            file: null,
            description: "",
            declarationFile: null,
            declarationDescription: "Surat Pernyataan Orisinalitas",
            declarationChecked: false,
            isUploading: false,
            isUploadingDeclaration: false,
          }
        })
        setUploadStates(initialStates)

        // Fetch existing submissions for these competitions
        const submissionsResponse = await fetch("/api/submissions")
        if (submissionsResponse.ok) {
          const { submissions: userSubmissions } = await submissionsResponse.json()

          // Group submissions by competition_id
          const groupedSubmissions: Record<string, Submission[]> = {}
          userSubmissions.forEach((submission: Submission) => {
            if (!groupedSubmissions[submission.competition_id]) {
              groupedSubmissions[submission.competition_id] = []
            }
            groupedSubmissions[submission.competition_id].push(submission)
          })

          setSubmissions(groupedSubmissions)
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load submissions data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (competitionId: string, file: File | null, type: 'main' | 'declaration' = 'main') => {
    if (file) {
      const competition = COMPETITION_CONFIG[competitionId]
      // Untuk surat pernyataan, selalu PDF
      const allowedTypes = type === 'declaration' ? ['application/pdf'] : competition.allowedTypes
      const accept = type === 'declaration' ? '.pdf' : competition.accept
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: `Only ${accept} files are allowed for ${type === 'declaration' ? 'surat pernyataan' : competition.title}`,
          variant: "destructive",
        })
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 10MB",
          variant: "destructive",
        })
        return
      }
    }

    const fieldName = type === 'declaration' ? 'declarationFile' : 'file'
    setUploadStates((prev) => ({
      ...prev,
      [competitionId]: {
        ...prev[competitionId],
        [fieldName]: file,
      },
    }))
  }

  const handleInputChange = (competitionId: string, field: string, value: string | boolean) => {
    setUploadStates((prev) => ({
      ...prev,
      [competitionId]: {
        ...prev[competitionId],
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (competitionId: string, type: 'main' | 'declaration' = 'main') => {
    const state = uploadStates[competitionId]
    const file = type === 'declaration' ? state.declarationFile : state.file
    const description = type === 'declaration' ? state.declarationDescription : state.description
    
    if (!file) return
    if (type === 'main' && !state.declarationChecked) return

    const uploadingField = type === 'declaration' ? 'isUploadingDeclaration' : 'isUploading'
    
    setUploadStates((prev) => ({
      ...prev,
      [competitionId]: {
        ...prev[competitionId],
        [uploadingField]: true,
      },
    }))

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("competition_id", competitionId)
      formData.append("description", description)
      formData.append("submission_type", type === 'declaration' ? 'surat_pernyataan' : 'karya')
      formData.append("declaration_checked", "true")

      const response = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Submission Successful!",
          description: `Your ${type === 'declaration' ? 'surat pernyataan' : 'karya'} has been uploaded successfully.`,
        })

        // Reset form
        const resetFields = type === 'declaration' 
          ? { declarationFile: null, declarationDescription: "Surat Pernyataan Orisinalitas", isUploadingDeclaration: false }
          : { file: null, description: "", declarationChecked: false, isUploading: false }
          
        setUploadStates((prev) => ({
          ...prev,
          [competitionId]: {
            ...prev[competitionId],
            ...resetFields,
          },
        }))

        // Refresh submissions data
        fetchData()
      } else {
        throw new Error(data.error || "Failed to submit")
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setUploadStates((prev) => ({
        ...prev,
        [competitionId]: {
          ...prev[competitionId],
          [uploadingField]: false,
        },
      }))
    }
  }

  const handleDelete = async (submission: Submission) => {
    if (!confirm("Are you sure you want to delete this submission?")) return
    
    try {
      const res = await fetch(`/api/submissions/${submission.id}`, {
        method: "DELETE",
      })
      
      if (res.ok) {
        toast({
          title: "Deleted",
          description: "Your submission has been removed.",
        })
        fetchData()
      } else {
        const errorData = await res.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete submission",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Delete error", err)
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Submissions</h1>
              <p className="text-slate-400">Loading...</p>
            </div>
          </div>
        </div>

        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-slate-900/50 border-slate-700 animate-pulse">
            <CardHeader>
              <div className="h-6 bg-slate-700 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                <div className="h-32 bg-slate-700/50 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (registrations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Babak Penyisihan</h1>
              <p className="text-slate-400">Submit karya dan surat pernyataan orisinalitas</p>
            </div>
          </div>
        </div>

        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-white font-semibold mb-2">No Eligible Competitions</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              You don't have any approved registrations for competitions that require submissions. Please check your
              registration status or register for eligible competitions.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Babak Penyisihan</h1>
            <p className="text-slate-400">Submit karya dan surat pernyataan orisinalitas</p>
          </div>
        </div>
      </div>

      {/* Deadline Reminder Card */}
      <DeadlineReminderCard registrations={registrations} />

      {/* Competition Cards */}
      {registrations.map((registration) => {
        const competition = COMPETITION_CONFIG[registration.competition_id]
        const state = uploadStates[registration.competition_id] || {}
        const competitionSubmissions = submissions[registration.competition_id] || []
        const isPdf = competition.allowedTypes.includes("application/pdf")

        // Separate submissions by type
        const karyaSubmissions = competitionSubmissions.filter(s => 
          !s.submission_type || s.submission_type === 'karya' || 
          (s.title && !s.title.toLowerCase().includes('surat pernyataan'))
        )
        const declarationSubmissions = competitionSubmissions.filter(s => 
          s.submission_type === 'surat_pernyataan' || 
          (s.title && s.title.toLowerCase().includes('surat pernyataan'))
        )

        return (
          <Card key={registration.competition_id} className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {isPdf ? (
                  <FileText className="w-5 h-5 text-blue-400" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-green-400" />
                )}
                {competition.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  {competition.title}
                </Badge>
                <span className="text-slate-400">Upload karya dan surat pernyataan orisinalitas</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Section 1: Upload Karya Utama */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  {isPdf ? (
                    <FileText className="w-5 h-5 text-blue-400" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-green-400" />
                  )}
                  <h3 className="text-white font-semibold text-lg">Upload Karya Utama</h3>
                </div>

                <div>
                  <Label htmlFor={`file-${registration.competition_id}`} className="text-white">
                    File Karya <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`file-${registration.competition_id}`}
                    type="file"
                    accept={competition.accept}
                    onChange={(e) => handleFileChange(registration.competition_id, e.target.files?.[0] || null, 'main')}
                    className="bg-slate-800 border-slate-700 text-white file:bg-slate-700 file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded-md"
                    disabled={state.isUploading}
                  />
                  <p className="text-slate-400 text-sm mt-1">
                    {isPdf ? "PDF files only, max 10MB" : "JPG, PNG files only, max 10MB"}
                  </p>
                </div>

                <div>
                  <Label htmlFor={`desc-${registration.competition_id}`} className="text-white">
                    Deskripsi Karya
                  </Label>
                  <Textarea
                    id={`desc-${registration.competition_id}`}
                    value={state.description || ""}
                    onChange={(e) => handleInputChange(registration.competition_id, "description", e.target.value)}
                    placeholder="Contoh: 'Karya Babak Penyisihan Scientific Writing'"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    disabled={state.isUploading}
                  />
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={`declaration-${registration.competition_id}`}
                      checked={state.declarationChecked || false}
                      onCheckedChange={(checked) =>
                        handleInputChange(registration.competition_id, "declarationChecked", checked as boolean)
                      }
                      disabled={state.isUploading}
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor={`declaration-${registration.competition_id}`}
                        className="text-amber-200 font-medium cursor-pointer"
                      >
                        Declaration <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-amber-100 text-sm leading-relaxed">{DECLARATION_TEXT}</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleSubmit(registration.competition_id, 'main')}
                  disabled={!state.file || !state.declarationChecked || state.isUploading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {state.isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading Karya...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Submit Karya
                    </>
                  )}
                </Button>
              </div>

              <Separator className="bg-slate-600" />

              {/* Section 2: Upload Surat Pernyataan */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileCheck className="w-5 h-5 text-green-400" />
                  <h3 className="text-white font-semibold text-lg">Upload Surat Pernyataan Orisinalitas</h3>
                </div>

                <div>
                  <Label htmlFor={`declaration-file-${registration.competition_id}`} className="text-white">
                    File Surat Pernyataan <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`declaration-file-${registration.competition_id}`}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(registration.competition_id, e.target.files?.[0] || null, 'declaration')}
                    className="bg-slate-800 border-slate-700 text-white file:bg-slate-700 file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded-md"
                    disabled={state.isUploadingDeclaration}
                  />
                  <p className="text-slate-400 text-sm mt-1">
                    PDF files only, max 10MB - Surat pernyataan orisinalitas yang sudah ditandatangani
                  </p>
                </div>

                <div>
                  <Label htmlFor={`declaration-desc-${registration.competition_id}`} className="text-white">
                    Deskripsi Surat Pernyataan
                  </Label>
                  <Input
                    id={`declaration-desc-${registration.competition_id}`}
                    value={state.declarationDescription || ""}
                    onChange={(e) => handleInputChange(registration.competition_id, "declarationDescription", e.target.value)}
                    placeholder="Surat Pernyataan Orisinalitas"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    disabled={state.isUploadingDeclaration}
                  />
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FileCheck className="w-5 h-5 text-green-400 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-green-200 font-medium text-sm">Informasi Surat Pernyataan</p>
                      <p className="text-green-100 text-sm leading-relaxed">
                        Surat pernyataan orisinalitas harus berisi pernyataan bahwa karya yang disubmit adalah hasil karya sendiri 
                        dan bebas dari plagiarisme. Surat harus ditandatangani dan di-scan dalam format PDF.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleSubmit(registration.competition_id, 'declaration')}
                  disabled={!state.declarationFile || state.isUploadingDeclaration}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  {state.isUploadingDeclaration ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading Surat Pernyataan...
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4 mr-2" />
                      Submit Surat Pernyataan
                    </>
                  )}
                </Button>
              </div>

              <Separator className="bg-slate-600" />

              {/* My Submissions Tables */}
              <div className="space-y-6">
                <h3 className="text-white font-semibold text-lg">My Submissions</h3>
                
                {/* Karya Submissions */}
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    {isPdf ? (
                      <FileText className="w-4 h-4 text-blue-400" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-green-400" />
                    )}
                    Karya Utama
                  </h4>
                  {karyaSubmissions.length > 0 ? (
                    <div className="bg-slate-800/50 rounded-lg border border-slate-600">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-600">
                            <TableHead className="text-slate-300">Title</TableHead>
                            <TableHead className="text-slate-300">Submitted</TableHead>
                            <TableHead className="text-slate-300">Actions</TableHead>
                            <TableHead className="text-slate-300">Delete</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {karyaSubmissions.map((submission) => (
                            <TableRow key={submission.id} className="border-slate-600">
                              <TableCell className="text-white">{submission.title || "No description"}</TableCell>
                              <TableCell className="text-slate-300">
                                {new Date(submission.created_at).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(submission.file_url, "_blank")}
                                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const link = document.createElement("a")
                                      link.href = submission.file_url
                                      link.download = submission.original_filename || `${competition.title}_karya_${submission.id}`
                                      link.click()
                                    }}
                                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                  >
                                    <Download className="w-3 h-3 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(submission)}
                                  className="border-slate-600 text-red-400 hover:bg-red-600/20"
                                >
                                  ✕
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="bg-slate-800/30 rounded-lg border border-slate-600 p-6 text-center">
                      <FileText className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                      <p className="text-slate-400 text-sm">No karya submissions yet</p>
                    </div>
                  )}
                </div>

                {/* Declaration Submissions */}
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-green-400" />
                    Surat Pernyataan Orisinalitas
                  </h4>
                  {declarationSubmissions.length > 0 ? (
                    <div className="bg-slate-800/50 rounded-lg border border-slate-600">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-600">
                            <TableHead className="text-slate-300">Title</TableHead>
                            <TableHead className="text-slate-300">Submitted</TableHead>
                            <TableHead className="text-slate-300">Actions</TableHead>
                            <TableHead className="text-slate-300">Delete</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {declarationSubmissions.map((submission) => (
                            <TableRow key={submission.id} className="border-slate-600">
                              <TableCell className="text-white">{submission.title || "Surat Pernyataan Orisinalitas"}</TableCell>
                              <TableCell className="text-slate-300">
                                {new Date(submission.created_at).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(submission.file_url, "_blank")}
                                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const link = document.createElement("a")
                                      link.href = submission.file_url
                                      link.download = submission.original_filename || `${competition.title}_surat_pernyataan_${submission.id}`
                                      link.click()
                                    }}
                                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                  >
                                    <Download className="w-3 h-3 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(submission)}
                                  className="border-slate-600 text-red-400 hover:bg-red-600/20"
                                >
                                  ✕
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="bg-slate-800/30 rounded-lg border border-slate-600 p-6 text-center">
                      <FileCheck className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                      <p className="text-slate-400 text-sm">No surat pernyataan submissions yet</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}