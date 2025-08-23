"use client"

import Image from "next/image"
import { useEffect } from "react"

export function SponsorsSection() {
  const partners = [
    {
      name: "Era FM UNJ",
      logo: "/images/partners/era-fm-logo.png",
      website: "#",
    },
    {
      name: "Infolomba",
      logo: "/images/partners/infolomba-logo.png",
      website: "#",
    },
    {
      name: "Partner Event",
      logo: "/images/partners/partner-event-logo.png",
      website: "#",
    },
    {
      name: "GudangLomba.ind",
      logo: "/images/partners/gudang-lomba-logo.jpg",
      website: "#",
    },
    {
      name: "Zona Lomba",
      logo: "/images/partners/zona-lomba-logo.png",
      website: "#",
    },
    {
      name: "RTC UI",
      logo: "/images/partners/rtc-ui-logo.jpeg",
      website: "#",
    },
    {
      name: "AIESEC",
      logo: "/images/partners/aiesec-logo.png",
      website: "#",
    },
    {
      name: "infoeventku_",
      logo: "/images/partners/logo_infoeventku_.png",
      website: "#",
    },
    {
      name: "HME FPTI UPI",
      logo: "/images/partners/fpti-upi-logo.png",
      website: "#",
    },
    {
      name: "Ritma FMIPA UB",
      logo: "/images/partners/ritma.png",
      website: "#",
    },
  ]

  useEffect(() => {
    const scrollers = document.querySelectorAll(".scroller")

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      addAnimation()
    }

    function addAnimation() {
      scrollers.forEach((scroller) => {
        // Pastikan scroller adalah Element sebelum menggunakan setAttribute
        if (scroller instanceof Element) {
          scroller.setAttribute("data-animated", "true")
        }

        const scrollerInner = scroller.querySelector(".scroller__inner")

        // Periksa apakah scrollerInner tidak null sebelum melanjutkan
        if (scrollerInner) {
          const scrollerContent = Array.from(scrollerInner.children)

          scrollerContent.forEach((item) => {
            // Pastikan item adalah Element sebelum menggunakan cloneNode dan setAttribute
            if (item instanceof Element) {
              const duplicatedItem = item.cloneNode(true) as Element
              duplicatedItem.setAttribute("aria-hidden", "true")
              scrollerInner.appendChild(duplicatedItem)
            }
          })
        }
      })
    }
  }, [])

  return (
    <section className="py-16 md:py-24 bg-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full px-4 py-2 mb-4">
            <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-purple-300">Media Partners</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Supported By
            </span>
          </h2>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">Our Media Partners</p>

          {/* Decorative line */}
          <div className="flex items-center justify-center mt-6">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent w-32" />
            <div className="w-2 h-2 bg-purple-500 rounded-full mx-4" />
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent w-32" />
          </div>
        </div>

        {/* Partners Scroller */}
        <div className="scroller" data-speed="fast">
          <div className="scroller__inner">
            {partners.map((partner, index) => (
              <div key={index} className="group relative">
                {/* Partner Card */}
                <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-700/50 hover:border-purple-500/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10 w-64">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Logo container */}
                  <div className="relative aspect-square flex items-center justify-center">
                    <div className="relative w-full h-full max-w-[150px] max-h-[150px] mx-auto">
                      <Image
                        src={partner.logo || "/placeholder.svg"}
                        alt={`${partner.name} logo`}
                        fill
                        className="object-contain filter brightness-90 group-hover:brightness-110 transition-all duration-300"
                        sizes="(max-width: 768px) 120px, 150px"
                      />
                    </div>
                  </div>

                  {/* Partner name */}
                  <div className="mt-4 text-center">
                    <h3 className="text-slate-300 text-sm md:text-base font-medium group-hover:text-white transition-colors duration-300">
                      {partner.name}
                    </h3>
                  </div>

                  {/* Hover overlay for clickable partners */}
                  {partner.website && partner.website !== "#" && (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 rounded-2xl"
                      aria-label={`Visit ${partner.name} website`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}