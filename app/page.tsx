import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { IntroSection } from "@/components/intro-section"
import { TimelineSection } from "@/components/timeline-section"
import { EventsSection } from "@/components/events-section"
import { SponsorsSection } from "@/components/sponsors-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <IntroSection />
      <TimelineSection />
      <EventsSection />
      <SponsorsSection />
      <Footer />
    </main>
  )
}
