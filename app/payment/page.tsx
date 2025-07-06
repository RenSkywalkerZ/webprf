import { PaymentPage } from "@/components/payment/payment-page"

interface PaymentPageProps {
  searchParams: {
    competition?: string
    batch?: string
    registration?: string
  }
}

export default function Payment({ searchParams }: PaymentPageProps) {
  const competitionId = searchParams.competition
  const batchId = searchParams.batch
  const registrationId = searchParams.registration

  if (!competitionId || !batchId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Payment Link</h1>
          <p className="text-slate-400 mb-6">Missing required parameters for payment processing.</p>
          <a href="/auth" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
            Back to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <PaymentPage
      competitionId={competitionId}
      batchId={Number.parseInt(batchId)}
      registrationId={registrationId || undefined}
    />
  )
}
