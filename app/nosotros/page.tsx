"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Beaker, Lightbulb, Leaf, Heart, Users, ChevronRight, MessageSquare, BookOpen, Goal, Eye } from "lucide-react"
import Link from "next/link"
import { QuienesSomosHero } from "./_components/AboutHeroSection"
import ValuesSection from "./_components/ValuesSection"
import MissionVisionSection from "./_components/MisionVision"
import SectorsSection from "./_components/SectorsSection"

export default function AboutPage() {


  
 
  return (
    <main className=" ">
      {/* Hero Section with Video Background */}
      <QuienesSomosHero />
      {/* Mission and Vision */}
      <MissionVisionSection id="cs_30a28f27-58ee" />
 

 
 
      {/* Values Section */}
      <ValuesSection id="cs_4ce0ea48-52d5" />
      

      {/* Sectors Section - Side-by-Side Accordion */}
      <SectorsSection id="cs_b6e904f5-519f" />

      {/* CTA Section */}
      {/* <section className="py-16 bg-[url('/fondoproduct.jpg')] bg-cover text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <h2 className="text-3xl font-bold">¿Listo para optimizar sus procesos de lavado?</h2>
            <p className="text-base md:text-xl text-blue-100">
              Descubra cómo nuestros productos pueden transformar su negocio y mejorar su eficiencia.
            </p>
            <div className="pt-6">
              <Button
                className="bg-white text-blue-700 hover:bg-blue-50 text-base px-8 py-6"
                onClick={() =>
                  window.open(
                    "https://wa.me/51960582623?text=Hola,%20me%20gustaría%20conocer%20más%20sobre%20los%20productos%20de%20Clefast",
                    "_blank",
                  )
                }
              >
                Contáctenos hoy
              </Button>
            </div>
          </motion.div>
        
        </div>
      </section> */}
      {/* <Testimonials /> */}
    </main>
  )
}

