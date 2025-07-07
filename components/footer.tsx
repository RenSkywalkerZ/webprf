"use client"

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-8 md:py-12 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center">
          {/* Left Column - Brand Info */}
          <div className="space-y-3 md:space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <img src="/images/logo.png" alt="PRF XIII Logo" className="w-6 h-6 md:w-8 md:h-8 rounded-full" />
              <span className="text-lg md:text-xl font-bold text-white">PRF XIII</span>
            </div>
            <p className="text-slate-400 text-xs md:text-sm">
              Pesta Rakyat Fisika XIII - Kompetisi Fisika Nasional untuk semua tingkat pendidikan.
            </p>
          </div>

          {/* Center Column - Mascot */}
          <div className="flex justify-center order-first md:order-none">
            <div className="relative">
              <img
                src="/images/mascot.png"
                alt="Footer Mascot"
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
              />
              <div className="absolute -bottom-1 md:-bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium opacity-0 hover:opacity-100 transition-opacity duration-300">
                See you there!
              </div>
            </div>
          </div>

          {/* Right Column - Contact */}
          <div className="text-center md:text-right">
            <h3 className="text-white font-semibold mb-3 md:mb-4 text-sm md:text-base">Kontak</h3>
            <div className="space-y-1 md:space-y-2 text-slate-400 text-xs md:text-sm">
              <div>Email: pestarakyatfisikaxiii@gmail.com</div>
              <div>Telepon: +62 851 1738 5115</div>
              <div>Instagram: @prf.ui</div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-slate-400 text-xs md:text-sm">
          <p>&copy; 2025 Pesta Rakyat Fisika XIII. All rights reserved.</p>
        </div>
      </div>

      {/* Background Mascot - Very Subtle */}
      <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none hidden md:block">
        <img src="/images/mascot.png" alt="Background Mascot" className="w-32 h-32 md:w-48 md:h-48 object-contain" />
      </div>
    </footer>
  )
}
