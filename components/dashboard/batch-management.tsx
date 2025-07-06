"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RotateCcw, Edit, Save, Lock, Unlock, Calendar, Clock, Info } from "lucide-react"

interface BatchManagementProps {
  userData: any
}

export function BatchManagement({ userData }: BatchManagementProps) {
  const [batches, setBatches] = useState([])
  const [currentBatchId, setCurrentBatchId] = useState<number | null>(null)
  const [registrationClosed, setRegistrationClosed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSwitchingBatch, setIsSwitchingBatch] = useState(false)
  const [isTogglingRegistration, setIsTogglingRegistration] = useState(false)
  const [isEditingBatch, setIsEditingBatch] = useState<number | null>(null)
  const [editBatchData, setEditBatchData] = useState({
    name: "",
    start_date: "",
    end_date: "",
  })

  useEffect(() => {
    fetchBatchData()
  }, [])

  const fetchBatchData = async () => {
    try {
      console.log("🔄 Fetching batch data...")

      const batchesRes = await fetch("/api/batches/all")
      if (batchesRes.ok) {
        const { batches, currentBatchId, registrationClosed } = await batchesRes.json()
        setBatches(batches)
        setCurrentBatchId(currentBatchId)
        setRegistrationClosed(registrationClosed)
        console.log("📅 Batches data:", { batches, currentBatchId, registrationClosed })
      } else {
        console.error("❌ Failed to fetch batches:", batchesRes.status)
      }

      console.log("✅ Batch data loaded successfully")
    } catch (error) {
      console.error("💥 Error fetching batch data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBatchSwitch = async (batchId: string) => {
    if (!batchId) {
      console.log("⚠️ No batch ID provided")
      return
    }

    console.log("🔄 Switching to batch:", batchId)
    setIsSwitchingBatch(true)

    try {
      const response = await fetch("/api/admin/batches/switch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ batchId: Number.parseInt(batchId) }),
      })

      const data = await response.json()
      console.log("📡 Switch batch response:", { status: response.status, data })

      if (response.ok) {
        setCurrentBatchId(data.currentBatchId || Number.parseInt(batchId))
        alert(`Berhasil beralih ke ${data.batch?.name || `Batch ${batchId}`}`)
        console.log("✅ Batch switched successfully")
        await fetchBatchData()
      } else {
        console.error("❌ Failed to switch batch:", data.error)
        alert("Gagal beralih batch: " + data.error)
      }
    } catch (error) {
      console.error("💥 Error switching batch:", error)
      alert("Terjadi kesalahan saat beralih batch")
    } finally {
      setIsSwitchingBatch(false)
    }
  }

  const handleToggleRegistration = async () => {
    console.log("🔄 Toggling registration status...")
    setIsTogglingRegistration(true)

    try {
      const response = await fetch("/api/admin/batches/toggle-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      console.log("📡 Toggle registration response:", { status: response.status, data })

      if (response.ok) {
        setRegistrationClosed(data.registrationClosed)
        alert(data.message)
        console.log("✅ Registration status toggled successfully")
      } else {
        console.error("❌ Failed to toggle registration:", data.error)
        alert("Gagal mengubah status pendaftaran: " + data.error)
      }
    } catch (error) {
      console.error("💥 Error toggling registration:", error)
      alert("Terjadi kesalahan saat mengubah status pendaftaran")
    } finally {
      setIsTogglingRegistration(false)
    }
  }

  const handleEditBatch = (batch: any) => {
    setIsEditingBatch(batch.id)
    setEditBatchData({
      name: batch.name,
      start_date: new Date(batch.start_date).toISOString().slice(0, 16),
      end_date: new Date(batch.end_date).toISOString().slice(0, 16),
    })
  }

  const handleSaveBatch = async (batchId: number) => {
    try {
      const response = await fetch(`/api/admin/batches/${batchId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editBatchData.name,
          start_date: new Date(editBatchData.start_date).toISOString(),
          end_date: new Date(editBatchData.end_date).toISOString(),
        }),
      })

      if (response.ok) {
        const { batch } = await response.json()
        setBatches((prev) => prev.map((b: any) => (b.id === batchId ? batch : b)))
        setIsEditingBatch(null)
        alert("Batch berhasil diperbarui!")
      } else {
        const data = await response.json()
        alert("Gagal memperbarui batch: " + data.error)
      }
    } catch (error) {
      console.error("Error updating batch:", error)
      alert("Terjadi kesalahan saat memperbarui batch")
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    })
  }

  const getCurrentBatch = () => {
    return batches.find((batch: any) => batch.id === currentBatchId)
  }

  const getStatusBadge = (batch: any, isCurrentBatch: boolean) => {
    if (isCurrentBatch) {
      return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Aktif</Badge>
    }
    return <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">Tidak Aktif</Badge>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="h-4 bg-slate-600 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-slate-600 rounded w-3/4"></div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="h-4 bg-slate-600 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-slate-600 rounded w-3/4"></div>
            </div>
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
          <RotateCcw className="w-8 h-8 text-orange-400" />
          Manajemen Batch Pendaftaran
        </h1>
        <p className="text-slate-400">Kelola batch pendaftaran dan status registrasi kompetisi</p>
      </div>

      {/* Current Batch Status */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Status Batch Saat Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-semibold mb-3">Batch Aktif</h3>
              {getCurrentBatch() ? (
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{getCurrentBatch()?.name}</span>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Aktif</Badge>
                  </div>
                  <p className="text-slate-400 text-sm">
                    {formatDateTime(getCurrentBatch()?.start_date)} - {formatDateTime(getCurrentBatch()?.end_date)}
                  </p>
                </div>
              ) : (
                <div className="bg-slate-800/50 rounded-lg p-4 text-center text-slate-400">Tidak ada batch aktif</div>
              )}
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Status Pendaftaran</h3>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">Registrasi Kompetisi</span>
                  {registrationClosed ? (
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                      <Lock className="w-3 h-3 mr-1" />
                      Ditutup
                    </Badge>
                  ) : (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      <Unlock className="w-3 h-3 mr-1" />
                      Dibuka
                    </Badge>
                  )}
                </div>
                <Button
                  onClick={handleToggleRegistration}
                  disabled={isTogglingRegistration}
                  className={`w-full ${
                    registrationClosed
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      : "bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
                  } text-white`}
                >
                  {isTogglingRegistration ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses...
                    </div>
                  ) : registrationClosed ? (
                    <div className="flex items-center gap-2">
                      <Unlock className="w-4 h-4" />
                      Buka Pendaftaran
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Tutup Pendaftaran
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Switching */}
      <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-orange-400" />
            Beralih Batch
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 font-medium">Informasi Penting</span>
              </div>
              <p className="text-slate-300 text-sm">
                Anda dapat beralih ke batch manapun tanpa terikat tanggal yang tertera. Batch yang dipilih akan menjadi
                batch aktif untuk pendaftaran baru.
              </p>
            </div>

            <div>
              <Label className="text-white font-medium mb-2 block">Pilih Batch untuk Diaktifkan</Label>
              <Select onValueChange={handleBatchSwitch} disabled={isSwitchingBatch} value="">
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                  <SelectValue placeholder="Pilih batch untuk diaktifkan" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {batches.map((batch: any) => (
                    <SelectItem
                      key={batch.id}
                      value={batch.id.toString()}
                      className="text-white hover:bg-slate-700"
                      disabled={batch.id === currentBatchId}
                    >
                      {batch.name} {batch.id === currentBatchId && "(Aktif)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isSwitchingBatch && (
                <div className="flex items-center gap-2 text-orange-400 text-sm mt-2">
                  <div className="w-4 h-4 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />
                  Mengalihkan batch...
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Batches Management */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Kelola Semua Batch
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {batches.map((batch: any) => (
              <div key={batch.id} className="bg-slate-800/50 rounded-lg p-4">
                {isEditingBatch === batch.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-white text-sm">Nama Batch</Label>
                        <Input
                          value={editBatchData.name}
                          onChange={(e) => setEditBatchData((prev) => ({ ...prev, name: e.target.value }))}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-sm">Tanggal Mulai</Label>
                        <Input
                          type="datetime-local"
                          value={editBatchData.start_date}
                          onChange={(e) => setEditBatchData((prev) => ({ ...prev, start_date: e.target.value }))}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-sm">Tanggal Berakhir</Label>
                        <Input
                          type="datetime-local"
                          value={editBatchData.end_date}
                          onChange={(e) => setEditBatchData((prev) => ({ ...prev, end_date: e.target.value }))}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveBatch(batch.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Simpan
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingBatch(null)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">{batch.name}</span>
                        {getStatusBadge(batch, batch.id === currentBatchId)}
                      </div>
                      <p className="text-slate-400 text-sm">
                        {formatDateTime(batch.start_date)} - {formatDateTime(batch.end_date)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditBatch(batch)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
