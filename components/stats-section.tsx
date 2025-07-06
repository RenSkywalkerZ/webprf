"use client"

import { Users, Award, Globe, Calendar } from "lucide-react"

export function StatsSection() {
  const stats = [
    { icon: Users, value: "2,500+", label: "Participants" },
    { icon: Award, value: "150+", label: "Awards Given" },
    { icon: Globe, value: "25+", label: "Countries" },
    { icon: Calendar, value: "8", label: "Years Running" },
  ]

  return (
    <section className="py-20 bg-slate-800/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
