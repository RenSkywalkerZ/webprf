export function TimelineSection() {
  const timelineEvents = [
    {
      title: "Roadshow",
      date: "1 Juli - 27 Agustus 2025",
      location: null,
    },
    {
      title: "Pendaftaran Lomba",
      date: "7 Juli - 21 September 2025",
      location: null,
    },
    {
      title: "Grand Opening PRF XIII",
      date: "25 September 2025",
      location: "Online",
    },
    {
      title: "Technical Meeting PRF XIII",
      date: "26 September 2025",
      location: "Online",
    },
    {
      title: "Kegiatan Perlombaan",
      date: "27 September - 1 November 2025",
      location: null,
    },
    {
      title: "Star Party",
      date: "31 Oktober 2025",
      location: "Offline (Balairung UI)",
    },
    {
      title: "Closing Ceremony",
      date: "1 November 2025",
      location: "Offline (Balairung UI)",
    },
  ]

  return (
    <section id="timeline" className="py-12 md:py-20 bg-black relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Title */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6 drop-shadow-[0_0_20px_rgba(79,199,254,0.8)]">
            Timeline
          </h2>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto px-4">
            Jadwal kegiatan Pesta Rakyat Fisika XIII
          </p>
        </div>

        {/* Mobile Timeline - Clean Centered Design */}
        <div className="block md:hidden max-w-sm mx-auto">
          <div className="relative">
            {/* Simple connecting line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-cyan-400 transform -translate-x-1/2"></div>

            <div className="space-y-6">
              {timelineEvents.map((event, index) => (
                <div key={index} className="relative flex justify-center">
                  <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 w-full max-w-xs text-center hover:bg-slate-700 transition-colors duration-300">
                    <h3 className="text-white text-lg font-bold mb-2">{event.title}</h3>
                    <p className="text-cyan-400 text-sm font-medium">{event.date}</p>
                    {event.location && <p className="text-slate-400 text-xs mt-1 italic">{event.location}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Timeline - Original Alternating Design */}
        <div className="hidden md:block max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 to-purple-500 transform -translate-x-1/2"></div>

            {/* Timeline Events */}
            <div className="space-y-8">
              {timelineEvents.map((event, index) => (
                <div
                  key={index}
                  className={`relative flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 w-4 h-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transform -translate-x-1/2 z-10"></div>

                  {/* Event Card */}
                  <div className={`w-1/2 ${index % 2 === 0 ? "pr-8" : "pl-8"}`}>
                    <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-6 hover:bg-slate-800/90 transition-all duration-300">
                      <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                      <p className="text-cyan-400 font-medium mb-1 text-base">{event.date}</p>
                      {event.location && <p className="text-slate-400 text-sm italic">{event.location}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
