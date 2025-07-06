"use client"
import { useSearchParams } from "next/navigation"
import { PaymentPage } from "@/components/payment/payment-page"

export default function Payment() {
  const searchParams = useSearchParams()

  const competitionId = searchParams.get("competition")
  const batchId = Number.parseInt(searchParams.get("batch") || "1")
  const registrationId = searchParams.get("registration")
  const isTeamRegistration = searchParams.get("team") === "true"

  if (!competitionId || !registrationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Parameter Tidak Valid</h1>
          <p className="text-slate-400 mb-6">URL pembayaran tidak lengkap atau tidak valid</p>
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <PaymentPage
      competitionId={competitionId}
      batchId={batchId}
      registrationId={registrationId}
      isTeamRegistration={isTeamRegistration}
    />
  )
}
