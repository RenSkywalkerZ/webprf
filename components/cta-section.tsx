"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Mail, Users } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20" />
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Push the Boundaries of
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              {" "}
              Physics?
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Join thousands of brilliant minds from around the world. Register now and be part of the most exciting
            physics competition of the year.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-lg px-8 py-4"
            >
              <Users className="mr-2 w-5 h-5" />
              Register for Competition
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-4"
            >
              <Mail className="mr-2 w-5 h-5" />
              Get Updates
            </Button>
          </div>

          <div className="text-slate-400 text-sm">
            Early bird registration ends in 30 days • Limited spots available
          </div>
        </div>
      </div>
    </section>
  )
}
