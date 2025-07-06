"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Shield } from "lucide-react"

interface ProfileCompletionProps {
  completion: number
  isAdmin?: boolean
}

export function ProfileCompletion({ completion, isAdmin }: ProfileCompletionProps) {
  return (
    <Card
      className={`bg-gradient-to-r ${
        isAdmin
          ? "from-purple-500/10 to-pink-500/10 border-purple-500/30"
          : "from-cyan-500/10 to-purple-500/10 border-cyan-500/30"
      }`}
    >
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          {isAdmin ? <Shield className="w-5 h-5 text-purple-400" /> : <CheckCircle className="w-5 h-5 text-cyan-400" />}
          Kelengkapan Profil {isAdmin ? "Admin" : ""}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-300">Progress Kelengkapan</span>
          <span className={`font-medium ${isAdmin ? "text-purple-400" : "text-cyan-400"}`}>{completion}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isAdmin ? "bg-gradient-to-r from-purple-500 to-pink-600" : "bg-gradient-to-r from-cyan-500 to-purple-600"
            }`}
            style={{ width: `${completion}%` }}
          ></div>
        </div>
        {!isAdmin && completion < 100 && (
          <p className="text-slate-300 text-sm mt-2">
            Lengkapi profil Anda untuk meningkatkan peluang persetujuan pendaftaran kompetisi.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
