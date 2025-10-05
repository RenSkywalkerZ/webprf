"use client"
import { useState } from "react"
import { User, Trophy, FileText, LogOut, Menu, X, Shield, BarChart3, Users, Home, Settings, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import { signOut } from "next-auth/react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip" // Impor komponen Tooltip

interface DashboardSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  userData: any
  profileCompletion: number
  hasSubmissionAccess: boolean
}

export function DashboardSidebar({
  activeSection,
  onSectionChange,
  userData,
  profileCompletion,
  hasSubmissionAccess
}: DashboardSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Admin menu items
  const adminMenuItems = [
    {
      id: "admin-overview",
      label: "Dashboard Overview",
      icon: BarChart3,
      description: "Statistik dan ringkasan sistem",
    },
    {
      id: "user-management",
      label: "Manajemen Pendaftaran",
      icon: Users,
      description: "Kelola pendaftaran",
    },
    {
      id: "batch-pricing-management",
      label: "Manajemen Batch & Harga",
      icon: Settings,
      description: "Kelola batch dan harga kompetisi",
    },
    {
      id: "personal",
      label: "Profil Admin",
      icon: User,
      description: "Kelola informasi pribadi",
    },
  ]

  // User menu items
  const userMenuItems = [
    {
      id: "user-overview",
      label: "Dashboard",
      icon: Home,
      description: "Ringkasan aktivitas Anda",
    },
    {
      id: "personal",
      label: "Informasi Diri",
      icon: User,
      description: "Kelola informasi diri Anda",
    },
    {
      id: "registration",
      label: "Pendaftaran Lomba",
      icon: Trophy,
      description: "Daftar Lomba yang tersedia",
    },
    {
      id: "details",
      label: "Detail Lomba",
      icon: FileText,
      description: "Detail lomba yang diikuti",
    },
  ];

  if (hasSubmissionAccess) {
  userMenuItems.push({
    id: "submissions",
    label: "Submisi",
    icon: Upload,
    description: "Tempat Submisi",
  });
}

  const menuItems = userData?.role === "admin" ? adminMenuItems : userMenuItems

  const SidebarContent = () => (
    <>
      {/* User Profile Section */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              userData?.role === "admin"
                ? "bg-gradient-to-r from-purple-500 to-pink-600"
                : "bg-gradient-to-r from-cyan-500 to-purple-600"
            }`}
          >
            {userData?.role === "admin" ? (
              <Shield className="w-6 h-6 text-white" />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold">{userData?.full_name || userData?.fullName || "Pengguna"}</h3>
            <p className="text-slate-400 text-sm">{userData?.email}</p>
            <div
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                userData?.role === "admin"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              }`}
            >
              {userData?.role === "admin" ? "Administrator" : "Peserta"}
            </div>
          </div>
        </div>
      </div>

      <TooltipProvider delayDuration={100}>
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const isLocked =
                userData?.role !== "admin" &&
                profileCompletion < 100 &&
                (item.id === "registration" || item.id === "details" || item.id === "submissions")

              const buttonItem = (
                <button
                  onClick={() => {
                    if (!isLocked) {
                      onSectionChange(item.id)
                      setIsMobileMenuOpen(false)
                    }
                  }}
                  disabled={isLocked}
                  className={`
                    w-full flex items-start space-x-3 p-4 rounded-lg transition-all duration-200
                    ${
                      activeSection === item.id
                        ? userData?.role === "admin"
                          ? "bg-gradient-to-r from-purple-500/20 to-pink-600/20 border border-purple-500/30 text-white"
                          : "bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 text-white"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    }
                    ${isLocked ? "cursor-not-allowed opacity-50 filter grayscale" : ""}
                  `}
                >
                  <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="text-left flex-grow">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-slate-400 mt-1">{item.description}</div>
                  </div>
                  {isLocked && <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                </button>
              )

              if (isLocked) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      {/* Wrap dengan div karena button dalam keadaan disabled */}
                      <div className="w-full cursor-not-allowed">{buttonItem}</div>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center">
                      <p>Lengkapi profil Anda hingga 100% untuk membuka menu ini</p>
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return <div key={item.id}>{buttonItem}</div>
            })}
          </div>
        </nav>
      </TooltipProvider>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-700">
        <Button
          onClick={() => signOut({ callbackUrl: "/" })}
          variant="outline"
          className="w-full border-slate-600 text-slate-300 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-colors bg-transparent"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Keluar
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-white hover:bg-slate-800"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0 bg-slate-900/95 backdrop-blur-sm border-r border-slate-700">
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <img src="/images/logo.png" alt="PRF XIII Logo" className="w-8 h-8 rounded-full" />
              <span className="text-xl font-bold text-white">
                {userData?.role === "admin" ? "Admin Panel PRF XIII" : "Dashboard PRF XIII"}
              </span>
            </div>
          </div>
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-80 bg-slate-900/95 backdrop-blur-sm border-r border-slate-700">
            <div className="flex flex-col h-full pt-16">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
