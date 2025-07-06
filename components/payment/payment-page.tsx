"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Upload, CheckCircle, AlertCircle, Copy, Building2, User, Trophy, ArrowLeft } from "lucide-react"
// REMOVED: import { getBatchPrice } from "@/lib/batch-config"

interface PaymentPageProps {
  competitionId: string
  batchId: number
  registrationId?: string
}

export function PaymentPage({ competitionId, batchId, registrationId }: PaymentPageProps) {
  const [competition, setCompetition] = useState<any>(null)
  const [batch, setBatch] = useState<any>(null)
  const [price, setPrice] = useState<number | null>(null) // ADDED: State for the price
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState("")

  useEffect(() => {
    fetchData()
  }, [competitionId, batchId])

  const fetchData = async () => {
    try {
      // Fetch competition details
      const competitionResponse = await fetch(`/api/competitions/${competitionId}`)
      if (competitionResponse.ok) {
        const { competition } = await competitionResponse.json()
        setCompetition(competition)
      }

      // Fetch batch details
      const batchResponse = await fetch(`/api/batches/${batchId}`)
      if (batchResponse.ok) {
        const { batch } = await batchResponse.json()
        setBatch(batch)
      }

      // ADDED: Fetch the dynamic price
      const pricingResponse = await fetch(`/api/pricing`);
      if (pricingResponse.ok) {
        const { pricing } = await pricingResponse.json();
        const specificPrice = pricing[batchId]?.[competitionId] || 0;
        setPrice(specificPrice);
      }

    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        setValidationError("Ukuran file maksimal 5MB")
        return
      }
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setValidationError("Format file harus JPG atau PNG")
        return
      }
      setPaymentProof(file)
      setValidationError("")
    }
  }

  const handleSubmitPayment = async () => {
    if (!paymentProof) {
      setValidationError("Mohon upload bukti pembayaran")
      return
    }

    setIsSubmitting(true)
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append("paymentProof", paymentProof)
      formData.append("registrationId", registrationId || "")
      formData.append("competitionId", competitionId)
      formData.append("batchId", batchId.toString())

      // Upload payment proof
      const response = await fetch("/api/payments/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        alert("Bukti pembayaran berhasil dikirim! Admin akan memverifikasi dalam 1x24 jam.")
        window.location.href = "/auth" // Redirect back to dashboard
      } else {
        const errorData = await response.json()
        alert("Gagal mengirim bukti pembayaran: " + (errorData.error || "Unknown error"))
      }
    } catch (error) {
      console.error("Payment submission error:", error)
      alert("Terjadi kesalahan saat mengirim bukti pembayaran")
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Nomor rekening berhasil disalin!")
  }

  // MODIFIED: This function now uses the fetched price from the state
  const formatPrice = () => {
    if (price === null) return "Memuat harga..."
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse space-y-6 w-full max-w-2xl mx-auto p-6">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="h-6 bg-slate-700 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-700 rounded w-full"></div>
              <div className="h-4 bg-slate-700 rounded w-3/4"></div>
              <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="mb-4 border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-cyan-400" />
            Pembayaran Kompetisi
          </h1>
          <p className="text-slate-400">Selesaikan pembayaran untuk menyelesaikan pendaftaran</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Competition Details */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-400" />
                Detail Kompetisi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {competition && (
                <>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{competition.title}</h3>
                    <Badge className="mt-1 bg-purple-500/20 text-purple-300 border-purple-500/30">
                      {competition.category}
                    </Badge>
                  </div>
                  <p className="text-slate-300 text-sm">{competition.description}</p>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Batch Pendaftaran</p>
                        <p className="text-white font-semibold">{batch?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 text-sm">Total Pembayaran</p>
                        <p className="text-2xl font-bold text-cyan-400">{formatPrice()}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Instructions */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-green-400" />
                Informasi Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bank Account Info */}
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">Transfer ke Rekening Berikut:</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                    <div>
                      <p className="text-slate-400 text-sm">Bank</p>
                      <p className="text-white font-semibold">BCA</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-sm">No. Rekening</p>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-mono">1234567890</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard("1234567890")}
                          className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent p-1"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-3">
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-slate-400 text-sm">Atas Nama</p>
                      <p className="text-white font-semibold">Panitia PRF XIII</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-400" />
                  Petunjuk Pembayaran
                </h3>
                <ol className="text-slate-300 text-sm space-y-2 list-decimal list-inside">
                  <li>Transfer sesuai nominal yang tertera</li>
                  <li>Simpan bukti transfer</li>
                  <li>Upload bukti transfer di form di bawah</li>
                  <li>Klik "Konfirmasi Pembayaran"</li>
                  <li>Tunggu verifikasi admin (maks 1x24 jam)</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Proof Upload */}
        <Card className="bg-slate-900/50 border-slate-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-cyan-400" />
              Upload Bukti Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="paymentProof" className="text-white font-medium">
                Bukti Transfer <span className="text-red-400">(wajib)</span>
              </Label>
              <p className="text-xs text-slate-400 mb-2">Upload foto/screenshot bukti transfer (JPG/PNG, max 5MB)</p>
              <div className="relative">
                <Input
                  id="paymentProof"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                  className={`bg-slate-800/50 border-slate-600 text-white file:bg-slate-700 file:text-white file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 ${
                    validationError ? "border-red-500" : paymentProof ? "border-green-500" : ""
                  }`}
                />
                <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              </div>
              {validationError && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-red-400">{validationError}</span>
                </div>
              )}
              {paymentProof && !validationError && (
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">File berhasil dipilih: {paymentProof.name}</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmitPayment}
              disabled={!paymentProof || isSubmitting || !!validationError}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white py-3"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mengirim Bukti Pembayaran...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Konfirmasi Pembayaran
                </div>
              )}
            </Button>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-yellow-300 font-medium text-sm">Penting!</p>
                  <p className="text-slate-300 text-xs mt-1">
                    Pastikan nominal transfer sesuai dengan yang tertera. Transfer dengan nominal berbeda akan
                    memperlambat proses verifikasi.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}