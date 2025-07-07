"use client"

export function IntroSection() {
  return (
    <section id="intro" className="py-12 md:py-20 bg-black relative overflow-hidden">
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Large Prominent Mascot - Hero Style */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 md:gap-8 lg:gap-16 mb-8 md:mb-12">
            {/* Mascot */}
            <div className="relative order-2 lg:order-1">
              <img
                src="/images/mascot.png"
                alt="Schrödinger's Cat Mascot"
                className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 object-contain drop-shadow-2xl"
              />
              {/* Glowing effect around mascot */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-full blur-2xl md:blur-3xl -z-10"></div>
            </div>

            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 md:mb-6 drop-shadow-[0_0_30px_rgba(79,199,254,0.8)]">
                PRF XIII
              </h2>
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text mb-4 md:mb-6">
                Pesta Rakyat Fisika XIII
              </h3>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Kompetisi Fisika Nasional Tingkat TK hingga Perguruan Tinggi yang terdiri dari Olimpiade Fisika, Lomba
                Robotik, dan berbagai macam kompetisi lainnya.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-10 md:top-20 left-5 md:left-10 w-20 h-20 md:w-32 md:h-32 bg-cyan-500/10 rounded-full blur-xl md:blur-2xl"></div>
      <div className="absolute bottom-10 md:bottom-20 right-5 md:right-10 w-24 h-24 md:w-40 md:h-40 bg-purple-500/10 rounded-full blur-xl md:blur-2xl"></div>
    </section>
  )
}
