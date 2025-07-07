"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bot,
  Trophy,
  Microscope,
  Rocket,
  Calculator,
  NotebookPen,
  CircuitBoard,
  ImageIcon,
  Sparkles,
  Zap,
} from "lucide-react"

export function EventsSection() {
  const events = [
    {
      icon: Trophy,
      title: "Physics Competition",
      description:
        "Kompetisi tingkat SMP/MT/Sederajat hingga Perguruan Tinggi untuk menguji kemampuan pengetahuan dan keterampilan analitis dalam bidang fisika.",
      category: "SMP/MT - Perguruan Tinggi",
      color: "from-blue-500 via-purple-500 to-pink-500",
      bgPattern: "🏆",
    },
    {
      icon: NotebookPen,
      title: "Scientific Writing",
      description: "Kompetisi penulisan karya ilmiah dalam bidang fisika tingkat SMP/MT/Sederajat hingga Perguruan Tinggi.",
      category: "SMP/MT - Perguruan Tinggi",
      color: "from-teal-400 via-cyan-500 to-blue-500",
      bgPattern: "📝",
    },
    {
      icon: CircuitBoard,
      title: "Science Project",
      description:
        "Kompetisi proyek sains tingkat SMP/Sederajat dan SMA/Sederajat yang mengatasi masalah berkelanjutan melalui pendekatan fisika.",
      category: "SMP/MT dan SMA/MA",
      color: "from-green-400 via-emerald-500 to-teal-500",
      bgPattern: "🔬",
    },
    {
      icon: Microscope,
      title: "Lomba Praktikum",
      description: "Ajang perlombaan dalam melakukan berbagai eksperimen fisika tingkat SMP/MT/Sederajat dan SMA/MA/Sederajat.",
      category: "SMP/MT dan SMA/MA",
      color: "from-indigo-400 via-purple-500 to-pink-500",
      bgPattern: "🧪",
    },
    {
      icon: Rocket,
      title: "Lomba Roket Air",
      description:
        "Kompetisi merancang dan meluncurkan roket air dengan prinsip-prinsip aerodinamika bagi siswa SMP/MT/sederajat.",
      category: "SMP/MT",
      color: "from-orange-400 via-red-500 to-pink-500",
      bgPattern: "🚀",
    },
    {
      icon: ImageIcon,
      title: "Depict Physics",
      description: "Ajang perlombaan dalam membuat konten infografis dan video kreatif untuk masyarakat umum",
      category: "Umum (15-25 Tahun)",
      color: "from-yellow-400 via-orange-500 to-red-500",
      bgPattern: "🎨",
    },
    {
      icon: Calculator,
      title: "Cerdas Cermat",
      description:
        "Kompetisi cerdas cermat fisika yang menguji kecepatan dan ketepatan dalam menjawab soal-soal fisika dan sains untuk tingkat SD/Sederajat dan SMP/MT/Sederajat.",
      category: "SD/Sederajat dan SMP/MT",
      color: "from-pink-400 via-rose-500 to-red-500",
      bgPattern: "🧠",
    },
    {
      icon: Bot,
      title: "Lomba Robotik",
      description:
        "Kompetisi robotik untuk pelajar TK/Sederajat hingga SMA/MA/Sederajat yang menggabungkan prinsip fisika dan teknologi modern dalam perancangan, perakitan, dan pemrograman robot.",
      category: "TK/Sederajat - SMA/MA/Sederajat",
      color: "from-purple-400 via-pink-500 to-rose-500",
      bgPattern: "🤖",
    },
  ]

  return (
    <section id="events" className="py-12 md:py-20 bg-black relative overflow-hidden">

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 md:mb-16 relative">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text drop-shadow-[0_0_20px_rgba(79,199,254,0.8)]">
              Event Kami
            </h2>
            <Zap className="w-8 h-8 text-purple-400 animate-pulse delay-300" />
          </div>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto italic mb-6 md:mb-8 px-4 font-medium">
            "Eight physics battles waiting to spark your brilliance"
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {events.map((event, index) => (
            <Card
              key={index}
              className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-2 border-slate-700 hover:border-transparent hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 group relative overflow-hidden transform hover:scale-105 hover:-rotate-1"
            >

              {/* Gradient Border Effect */}
              <div
                className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg p-[2px]"
                style={{
                  background: `linear-gradient(45deg, ${event.color.replace("from-", "").replace("via-", ", ").replace("to-", ", ")})`,
                }}
              >
                <div className="bg-slate-900 rounded-lg h-full w-full"></div>
              </div>

              <CardHeader className="pb-3 md:pb-4 text-left relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r ${event.color} rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg`}
                  >
                    <event.icon className="w-6 h-6 md:w-7 md:h-7 text-white drop-shadow-lg" />
                  </div>
                  <div className="text-2xl group-hover:animate-pulse">{event.emoji}</div>
                </div>

                <CardTitle className="text-white text-base md:text-lg leading-tight text-left font-bold group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-500 group-hover:bg-clip-text transition-all duration-300">
                  {event.title}
                </CardTitle>

                <CardDescription className="text-slate-400 text-xs md:text-sm leading-relaxed text-left group-hover:text-slate-300 transition-colors duration-300">
                  {event.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 text-left relative z-10">
                <div
                  className={`text-xs text-white bg-gradient-to-r ${event.color} px-3 py-1.5 rounded-full inline-block font-medium shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}
                >
                  {event.category}
                </div>
              </CardContent>

              {/* Hover Glow Effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${event.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-lg blur-xl`}
              ></div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
