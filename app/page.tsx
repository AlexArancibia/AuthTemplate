"use client"

import { Loader2, Store, Mail, Phone, MapPin, Globe, Facebook, Instagram, Twitter, Youtube } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useMainStore } from "@/stores/mainStore"
import { HeroSection } from "@/components/HeroSection"
import { ProductCarousel } from "@/components/ProductCarousel"
import { useEffect, Suspense } from "react"
import { usePathname } from "next/navigation"
import CardSectionsContainer from "@/components/card-sections-container"
import { BlogSection } from "@/components/BlogSection"
import FeaturesSection from "@/components/FeaturesSection"
import { AboutSection } from "@/components/AboutSection"
import { DeliveryHeroSection } from "@/components/DeliverySection"
import { useCurrencyStore, CurrencyOption } from "@/stores/currency"
import { PublishBanner } from "@/components/PublishBanner"
import { CollectionCarousel } from "@/components/CollectionCarousel"
import { Testimonials } from "@/components/Testimonials"
import { Sponsors } from "@/components/Sponsors"
import { FeaturedProductsWithSidebar } from "@/components/FeaturedProductsWithSidebar"
import PromotionalGrid from "@/components/PromotionalGrid"
import { FeaturedProductsSection } from "@/components/FeaturedProductsSection"
import { VideoPromotionSection } from "@/components/VideoPromotionSection"

export default function HomePage() {
  const pathname = usePathname()
  const selectedCurrencyId = useCurrencyStore((state) => state.selectedCurrencyId);
  const acceptedCurrencies = useCurrencyStore((state) => state.acceptedCurrencies);

  useEffect(() => {
    const tryScrollToHash = (hash: string, retries = 10) => {
      if (!hash || hash === "#") return
      const id = hash.replace("#", "")
      const el = document.getElementById(id)
      if (el) {
        // espera un frame para asegurar layout listo
        requestAnimationFrame(() => {
          const headerHeight = 90 // h-18 from navbar (4.5rem = 72px) + extra spacing
          const elementPosition = el.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.scrollY - headerHeight

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          })
        })
      } else if (retries > 0) {
        // reintenta (por si el componente monta tarde)
        setTimeout(() => tryScrollToHash(hash, retries - 1), 120)
      }
    }

    // 1) al montar / o navegar a /#algo
    if (typeof window !== "undefined") {
      tryScrollToHash(window.location.hash)
    }

    // 2) si cambia el hash estando en la misma página
    const onHashChange = () => tryScrollToHash(window.location.hash)
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [pathname])
  
  return (
    <>
    
    <HeroSection />
    <FeaturedProductsWithSidebar
      selectedCurrencyId={selectedCurrencyId}
      acceptedCurrencies={acceptedCurrencies}
    />
    <CollectionCarousel
      collectionId="col_17efa15c-9082"
      selectedCurrencyId={selectedCurrencyId}
      acceptedCurrencies={acceptedCurrencies}
      showExploreButton={true}
      emptyMessage="No hay productos disponibles"
    />
    <CollectionCarousel
      collectionId="col_13049889-0e20"
      selectedCurrencyId={selectedCurrencyId}
      acceptedCurrencies={acceptedCurrencies}
      showExploreButton={true}
      emptyMessage="No hay productos disponibles"
    />
    <VideoPromotionSection />
    <PromotionalGrid />
    <FeaturedProductsSection
      selectedCurrencyId={selectedCurrencyId}
      acceptedCurrencies={acceptedCurrencies}
    />
    {/* <Suspense fallback={<div className="h-96 bg-muted animate-pulse" />}>
        <FeaturesSection id="cs_5c596d6f-a27c" />
      </Suspense> */}
      {/* <ProductCarousel
        selectedCurrencyId={selectedCurrencyId}
        acceptedCurrencies={acceptedCurrencies}
      />
      <CollectionCarousel
        collectionId="col_6e93d324-65cd"
        selectedCurrencyId={selectedCurrencyId}
        acceptedCurrencies={acceptedCurrencies}
        showExploreButton={false}
        fallbackTitle="PRODUCTOS DESTACADOS"
        emptyMessage="No hay productos destacados para mostrar."
      />
      <PublishBanner />
      <CollectionCarousel
        collectionId="col_cb240586-77ae"
        selectedCurrencyId={selectedCurrencyId}
        acceptedCurrencies={acceptedCurrencies}
        showExploreButton={true}
        fallbackTitle="ÚLTIMOS PRODUCTOS"
        emptyMessage="Aún no hay productos recientes para mostrar."
      />
      <Testimonials />
      <Sponsors /> */}
    </>
  )
}
