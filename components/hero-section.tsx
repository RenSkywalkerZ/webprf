'use client';

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Your Custom Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/hero-bg.png')`,
        }}
      />

      {/* Simplified overlay to let your background shine */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Gradient shadow di ujung bawah Hero */}
      <div
        className="
          pointer-events-none
          absolute bottom-0 left-0
          w-full h-24 md:h-36
          bg-gradient-to-b
          from-transparent
          to-[#000000]
        "
      />

      {/* Main Title */}
      <div className="relative z-10 text-center px-4 -mt-[400px]">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-4 drop-shadow-[0_0_15px_rgba(79,199,254,0.7)]">
          PRF XIII
        </h1>
      </div>
    </section>
  );
}
