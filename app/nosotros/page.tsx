"use client"

import { QuienesSomosHero } from "./_components/AboutHeroSection"
import ValuesSection from "./_components/ValuesSection"
import MissionVisionSection from "./_components/MisionVision"
import SectorsSection from "./_components/SectorsSection"

export default function AboutPage() {
  return (
    <main>
      {/* Hero Section with Video Background */}
      <QuienesSomosHero />
      {/* Mission and Vision */}
      <MissionVisionSection id="cs_30a28f27-58ee" />
 

 
 
      {/* Values Section */}
      <ValuesSection id="cs_4ce0ea48-52d5" />

      {/* Sectors Section - Side-by-Side Accordion */}
      <SectorsSection id="cs_b6e904f5-519f" />
    </main>
  )
}

