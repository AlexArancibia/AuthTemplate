"use client"

import { Loader2, Store, Mail, Phone, MapPin, Globe, Facebook, Instagram, Twitter, Youtube } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useMainStore } from "@/stores/mainStore"
import { HeroSection } from "@/components/HeroSection"
import { ProductCarousel } from "@/components/ProductCarousel"
import { Suspense } from "react"
import CardSectionsContainer from "@/components/card-sections-container"

export default function HomePage() {
 

  return (
    <>
    
    <HeroSection />
    <ProductCarousel />
    <Suspense fallback={<div className="h-96 bg-muted animate-pulse" />}>
        <CardSectionsContainer id="cs_5c596d6f-a27c" />
      </Suspense>
    </>
  )
}
