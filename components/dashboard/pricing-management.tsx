"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Trophy, Save, CheckCircle, AlertCircle } from "lucide-react"

interface PricingManagementProps {
  userData: any
}

export function PricingManagement({ userData }: PricingManagementProps) {
  const [batches, setBatches] = useState([])
  const [competitions, setCompetitions] = useState([])
  const [pricing, setPricing] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<string>("1")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch batches
      const batchesResponse = await fetch("/api/batches")
      if (batchesResponse.ok) {
        const { batches } = await batchesResponse.json()
        setBatches(batches)
      }

      // Fetch competitions
      const competitionsResponse = await fetch("/api/competitions")
      if (competitionsResponse.ok) {
        const { competitions } = await competitionsResponse.json()
        setCompetitions(competitions)
      }

      // Fetch current pricing
      const pricingResponse = await fetch("/api/admin/pricing")
      if (pricingResponse.ok) {
        const { pricing } = await pricingResponse.json()
        setPricing(pricing)
      } else {
        // Initialize with default pricing if not exists
        const defaultPricing = {
          1: {
            "physics-competition": 75000,
            "chemistry-competition": 75000,
            "biology-competition": 75000,
            "mathematics-competition": 75000,
            "computer-science": 85000,
            "astronomy-competition": 80000,
            "earth-science": 70000,
            "engineering-competition": 90000,
          },
          2: {
            "physics-competition": 85000,
            "chemistry-competition": 85000,
            "biology-competition": 85000,
            "mathematics-competition": 85000,
            "computer-science": 95000,
            "astronomy-competition": 90000,
            "earth-science": 80000,
            "engineering-competition": 100000,
          },
          3: {
            "physics-competition": 95000,
            "chemistry-competition": 95000,
            "biology-competition": 95000,
            "mathematics-competition": 95000,
            "computer-science": 105000,
            "astronomy-competition": 100000,
            "earth-science": 90000,
            "engineering-competition": 110000,
          },
        }
        setPricing(defaultPricing)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePriceChange = (batchId: string, competitionId: string, price: string) => {
    const numericPrice = Number.parseInt(price) || 0
    setPricing((prev: any) => ({
      ...prev,
      [batchId]: {
        ...prev[batchId],
        [competitionId]: numericPrice,
      },
    }))
  }

  const handleSavePricing = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pricing }),
      })

      if (response.ok) {
        alert("Harga berhasil disimpan!")
      } else {
        const data = await response.json()
        alert("Gagal menyimpan harga: " + data.error)
      }
    } catch (error) {
      console.error("Error saving pricing:", error)
      alert("Terjadi kesalahan saat menyimpan harga")
    } finally {
      setIsSaving(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getBatchName = (batchId: string) => {
    const batch = batches.find((b: any) => b.id.toString() === batchId)
    return batch ? batch.name : `Batch ${batchId}`
  }

  const getCompetitionTitle = (competitionId: string) => {
    const competition = competitions.find((c: any) => c.id === competitionId)
    return competition ? competition.title : competitionId
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="animate-pulse bg-slate-800 rounded-lg p-6">
          <div className="h-6 bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-700 rounded-lg p-4">
                <div className="h-4 bg-slate-600 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-600 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <DollarSign className="w-8 h-8 text-green-400" />
          Manajemen Harga Kompetisi
        </h1>
        <p className="text-slate-400">Atur harga pendaftaran untuk setiap kompetisi berdasarkan batch</p>
      </div>

      {/* Save Button */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Simpan Perubahan Harga</h3>
              <p className="text-slate-300 text-sm">Pastikan semua harga sudah sesuai sebelum menyimpan</p>
            </div>
            <Button
              onClick={handleSavePricing}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Simpan Semua Harga
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Tables by Batch */}
      <Tabs value={selectedBatch} onValueChange={setSelectedBatch} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 mb-6">
          {batches.map((batch: any) => (
            <TabsTrigger
              key={batch.id}
              value={batch.id.toString()}
              className="data-[state=active]:bg-slate-700 text-white"
            >
              {batch.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {batches.map((batch: any) => (
          <TabsContent key={batch.id} value={batch.id.toString()} className="space-y-6">
            {/* Batch Info */}
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-blue-400" />
                  {batch.name} - Pengaturan Harga
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Periode Batch</p>
                    <p className="text-white">
                      {new Date(batch.start_date).toLocaleDateString("id-ID")} -{" "}
                      {new Date(batch.end_date).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Total Kompetisi</p>
                    <p className="text-white">{competitions.length} kompetisi</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Competition Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {competitions.map((competition: any) => {
                const currentPrice = pricing[batch.id]?.[competition.id] || 0
                return (
                  <Card key={competition.id} className="bg-slate-900/50 border-slate-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white text-lg">{competition.title}</CardTitle>
                          <Badge variant="outline" className="text-xs mt-1 border-slate-600 text-slate-300">
                            {competition.category}
                          </Badge>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-white font-medium">Harga Pendaftaran</Label>
                        <div className="mt-2 space-y-2">
                          <Input
                            type="number"
                            value={currentPrice}
                            onChange={(e) => handlePriceChange(batch.id.toString(), competition.id, e.target.value)}
                            className="bg-slate-800/50 border-slate-600 text-white"
                            placeholder="Masukkan harga..."
                          />
                          <div className="text-sm text-slate-400">Format: {formatPrice(currentPrice)}</div>
                        </div>
                      </div>

                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-300">Status Harga</span>
                          {currentPrice > 0 ? (
                            <div className="flex items-center gap-1 text-green-400">
                              <CheckCircle className="w-3 h-3" />
                              <span>Tersedia</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-400">
                              <AlertCircle className="w-3 h-3" />
                              <span>Belum diatur</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Batch Summary */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Ringkasan Harga {batch.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {competitions.filter((c: any) => pricing[batch.id]?.[c.id] > 0).length}
                    </div>
                    <div className="text-slate-400 text-sm">Harga Diatur</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {
                        competitions.filter((c: any) => !pricing[batch.id]?.[c.id] || pricing[batch.id]?.[c.id] === 0)
                          .length
                      }
                    </div>
                    <div className="text-slate-400 text-sm">Belum Diatur</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {formatPrice(
                        Object.values(pricing[batch.id] || {}).reduce(
                          (sum: number, price: any) => sum + (price || 0),
                          0,
                        ) / competitions.length,
                      )}
                    </div>
                    <div className="text-slate-400 text-sm">Rata-rata</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {formatPrice(Math.max(...Object.values(pricing[batch.id] || {}).map((p: any) => p || 0)))}
                    </div>
                    <div className="text-slate-400 text-sm">Tertinggi</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
