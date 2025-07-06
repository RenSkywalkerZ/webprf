"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, AlertTriangle, X } from "lucide-react"

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  type: "success" | "error" | "warning"
  title: string
  description: string
  autoClose?: boolean
  autoCloseDelay?: number
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  type,
  title,
  description,
  autoClose = true,
  autoCloseDelay = 5000,
}: ConfirmationDialogProps) {
  const [countdown, setCountdown] = useState(autoCloseDelay / 1000)

  useEffect(() => {
    if (isOpen && autoClose && type === "success") {
      setCountdown(autoCloseDelay / 1000)

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            onClose()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose, type])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-400" />
      case "error":
        return <AlertCircle className="w-6 h-6 text-red-400" />
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />
      default:
        return <CheckCircle className="w-6 h-6 text-green-400" />
    }
  }

  const getColorClasses = () => {
    switch (type) {
      case "success":
        return "border-green-500/30 bg-green-500/10"
      case "error":
        return "border-red-500/30 bg-red-500/10"
      case "warning":
        return "border-yellow-500/30 bg-yellow-500/10"
      default:
        return "border-green-500/30 bg-green-500/10"
    }
  }

  const getButtonClasses = () => {
    switch (type) {
      case "success":
        return "bg-green-600 hover:bg-green-700 text-white"
      case "error":
        return "bg-red-600 hover:bg-red-700 text-white"
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700 text-white"
      default:
        return "bg-green-600 hover:bg-green-700 text-white"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`bg-slate-900 border-slate-700 ${getColorClasses()}`}>
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            {getIcon()}
            {title}
          </DialogTitle>
          <DialogDescription className="text-slate-300 mt-2">{description}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            {type === "success" && autoClose && (
              <span className="text-sm text-slate-400">Menutup otomatis dalam {countdown} detik</span>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={onClose} className={getButtonClasses()}>
              <X className="w-4 h-4 mr-2" />
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
