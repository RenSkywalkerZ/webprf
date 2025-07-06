"use client"
import { useState, useEffect } from "react"
import { Clock, AlertTriangle } from "lucide-react"

interface CountdownTimerProps {
  expiresAt: string
  onExpire?: () => void
}

// Updated state to include hours
interface TimeLeft {
  hours: number
  minutes: number
  seconds: number
  total: number
}

export function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const expiration = new Date(expiresAt).getTime()
      const difference = expiration - now

      if (difference > 0) {
        // Calculate total hours, and remaining minutes and seconds
        const totalHours = Math.floor(difference / (1000 * 60 * 60));
        const remainingMinutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const remainingSeconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          hours: totalHours,
          minutes: remainingMinutes,
          seconds: remainingSeconds,
          total: difference,
        })
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, total: 0 })
        if (onExpire) {
          onExpire()
        }
      }
    }

    // Calculate immediately
    calculateTimeLeft()

    // Set up interval to update every second
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [expiresAt, onExpire])

  // Updated formatTime to handle hours, minutes, and seconds
  const formatTime = (hours: number, minutes: number, seconds: number) => {
    const paddedHours = hours.toString().padStart(2, "0")
    const paddedMinutes = minutes.toString().padStart(2, "0")
    const paddedSeconds = seconds.toString().padStart(2, "0")
    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`
  }

  const isUrgent = timeLeft.total <= 60000 // Last minute
  const isExpired = timeLeft.total <= 0

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 text-red-400">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">Waktu pendaftaran telah habis</span>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center gap-2 ${
        isUrgent ? "text-red-400" : "text-orange-400"
      }`}
    >
      {isUrgent && <AlertTriangle className="h-4 w-4 animate-pulse" />}
      <Clock className="h-4 w-4" />
      <span className="text-sm font-medium">
        {/* Updated display text */}
        Harap selesaikan/transfer sebelum: {formatTime(timeLeft.hours, timeLeft.minutes, timeLeft.seconds)}
      </span>
    </div>
  )
}