"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { MapPin, Menu, X, Clock, Trophy } from "lucide-react"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      const offsetTop = targetElement.offsetTop - 100 // Account for fixed navbar
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      })
    }
    setIsMenuOpen(false) // Close mobile menu after clicking
  }

  const handleAuthRedirect = () => {
    window.location.href = "/auth"
  }

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm md:max-w-lg lg:max-w-3xl xl:max-w-5xl px-4">
      <div className="bg-white/20 backdrop-blur-lg border border-white/30 px-4 md:px-6 py-3 shadow-lg rounded-xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <a href="#hero" onClick={(e) => handleSmoothScroll(e, "hero")} className="flex items-center space-x-3">
              <img src="/images/logo.png" alt="PRF XIII Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-full" />
            </a>
          </div>

          {/* Desktop Navigation Items */}
          <div className="hidden md:flex items-center space-x-6">
            <a
              href="#intro"
              onClick={(e) => handleSmoothScroll(e, "intro")}
              className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors text-sm font-medium"
            >
              <span>About</span>
            </a>
            <a
              href="#timeline"
              onClick={(e) => handleSmoothScroll(e, "timeline")}
              className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors text-sm font-medium"
            >
              <Clock size={16} />
              <span>Timeline</span>
            </a>
            <a
              href="#events"
              onClick={(e) => handleSmoothScroll(e, "events")}
              className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors text-sm font-medium"
            >
              <Trophy size={16} />
              <span>Events</span>
            </a>
            <a
              href="/hotels"
              className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors text-sm font-medium"
            >
              <MapPin size={16} />
              <span>Hotels</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white/90 hover:text-white transition-colors p-2"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Desktop Login/Register Button */}
          <div className="hidden md:block flex-shrink-0">
            <Button
              onClick={handleAuthRedirect}
              className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-full px-4 md:px-6 py-2 text-sm font-medium backdrop-blur-sm"
            >
              Masuk / Daftar
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/20">
            <div className="flex flex-col space-y-3">
              <a
                href="#intro"
                onClick={(e) => handleSmoothScroll(e, "intro")}
                className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors text-sm font-medium py-2"
              >
                <span>About</span>
              </a>
              <a
                href="#timeline"
                onClick={(e) => handleSmoothScroll(e, "timeline")}
                className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors text-sm font-medium py-2"
              >
                <Clock size={16} />
                <span>Timeline</span>
              </a>
              <a
                href="#events"
                onClick={(e) => handleSmoothScroll(e, "events")}
                className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors text-sm font-medium py-2"
              >
                <Trophy size={16} />
                <span>Events</span>
              </a>
              <a
                href="/hotels"
                className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors text-sm font-medium py-2"
              >
                <MapPin size={16} />
                <span>Hotels</span>
              </a>
              <Button
                onClick={handleAuthRedirect}
                className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-full px-4 py-2 text-sm font-medium backdrop-blur-sm w-full mt-2"
              >
                Masuk / Daftar
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
