"use client"

export function SponsorsSection() {
  const sponsors = [
    { name: "Physics Institute", logo: "🏛️" },
    { name: "Quantum Labs", logo: "⚛️" },
    { name: "Science Foundation", logo: "🔬" },
    { name: "Tech University", logo: "🎓" },
    { name: "Research Center", logo: "🧪" },
    { name: "Innovation Hub", logo: "💡" },
  ]

  return (
    <section className="py-12 md:py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">Powered By Excellence</h2>
          <p className="text-slate-400 text-sm md:text-base">
            Supported by leading institutions in physics and education
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-8">
          {sponsors.map((sponsor, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-4 md:p-6 bg-slate-900/60 rounded-lg hover:bg-slate-800/80 transition-colors"
            >
              <div className="text-2xl md:text-4xl mb-2 md:mb-3">{sponsor.logo}</div>
              <div className="text-slate-300 text-xs md:text-sm text-center">{sponsor.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
