"use client"

import { useState, useMemo } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { hotelsData } from "@/lib/hotels-data"
import { MapPin, DollarSign, ChevronDown } from "lucide-react"

export default function HotelsPage() {
  const [expandedHotel, setExpandedHotel] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"distance" | "price">("distance")

  const sortedHotels = useMemo(() => {
    const sorted = [...hotelsData]
    if (sortBy === "distance") {
      sorted.sort((a, b) => {
        const distA = Number.parseFloat(a.distance)
        const distB = Number.parseFloat(b.distance)
        return distA - distB
      })
    } else {
      sorted.sort((a, b) => {
        const priceA = Math.min(...a.rooms.map((r) => Number.parseInt(r.priceRange.split(" - ")[0].replace(/\D/g, ""))))
        const priceB = Math.min(...b.rooms.map((r) => Number.parseInt(r.priceRange.split(" - ")[0].replace(/\D/g, ""))))
        return priceA - priceB
      })
    }
    return sorted
  }, [sortBy])

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">Rekomendasi Hotel</h1>
          <p className="text-lg text-slate-300 text-center max-w-2xl mx-auto">
            Temukan akomodasi terbaik Travellers! Kami menyediakan berbagai pilihan hotel dengan harga kompetitif
            dan lokasi strategis.
          </p>
        </div>
      </section>

      {/* Sort Controls */}
      <section className="px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => setSortBy("distance")}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                sortBy === "distance"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              Urutkan Jarak
            </button>
            <button
              onClick={() => setSortBy("price")}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                sortBy === "price"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              Urutkan Harga
            </button>
          </div>
        </div>
      </section>

      {/* Hotels Grid */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedHotels.map((hotel) => (
            <div
              key={hotel.name}
              className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
            >
              {/* Hotel Header */}
              <div className="p-6 border-b border-slate-700">
                <h3 className="text-xl font-bold text-white mb-3">{hotel.name}</h3>
                <div className="flex items-center gap-2 text-slate-300 mb-4">
                  <MapPin size={18} className="text-blue-400" />
                  <span className="text-sm">{hotel.distance} dari venue</span>
                </div>
                <a
                  href={hotel.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Lihat di Maps →
                </a>
              </div>

              {/* Rooms Section */}
              <div className="p-6">
                <button
                  onClick={() => setExpandedHotel(expandedHotel === hotel.name ? null : hotel.name)}
                  className="w-full flex items-center justify-between text-left mb-4 hover:text-blue-400 transition-colors"
                >
                  <span className="font-semibold text-white flex items-center gap-2">
                    <DollarSign size={18} className="text-blue-400" />
                    Tipe Kamar ({hotel.rooms.length})
                  </span>
                  <ChevronDown
                    size={20}
                    className={`text-slate-400 transition-transform ${
                      expandedHotel === hotel.name ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedHotel === hotel.name && (
                  <div className="space-y-3 mt-4 pt-4 border-t border-slate-700">
                    {hotel.rooms.map((room, idx) => (
                      <div key={idx} className="bg-slate-700/30 rounded-lg p-3">
                        <p className="text-slate-200 font-medium text-sm">{room.type}</p>
                        <p className="text-blue-400 text-sm mt-1">{room.priceRange}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
