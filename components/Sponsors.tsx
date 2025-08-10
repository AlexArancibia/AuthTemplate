"use client"

import { useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { useMainStore } from "@/stores/mainStore"
import Image from "next/image"

export function Sponsors() {
    const { cardSections } = useMainStore()

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
        align: "start",
        loop: true,
        },
        [
        Autoplay({
            delay: 3000, // tiempo entre slides
            stopOnInteraction: false,
        }),
        ]
    )

    // Buscar sección de auspicios
    const sponsorSection = cardSections.find(
        (section) => section.id === "cs_249659cf-2b11" && section.isActive
    )

    const cards = sponsorSection?.cards
        ?.filter((card) => card.isActive)
        .sort((a, b) => a.position - b.position) || []

    return (
        <section className="bg-white w-full px-5 sm:px-10 md:px-20 lg:px-32">
            {/* Carrusel */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-5">
                {cards.map((card) => (
                    <div
                    key={card.id}
                    className="shrink-0 w-full sm:w-1/2 md:w-1/3 flex items-center justify-center"
                    >
                    <div className="aspect-[3/4] w-full bg-white flex items-center justify-center">
                        <div className="relative w-full h-full">
                        <Image
                            src={card.imageUrl || "/placeholder.svg"}
                            alt={card.title || "Auspiciador"}
                            fill
                            className="object-contain"
                        />
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>

            {/* Footer alineado y responsive */}
            <div className="bg-black h-32 sm:h-40 md:h-48 flex items-center justify-center gap-4 sm:gap-6 md:gap-10 px-4 mb-20">
                <span className="text-white text-xl sm:text-3xl md:text-5xl font-semibold">
                    POWERED BY
                </span>

                <div className="relative w-[120px] sm:w-[200px] md:w-[300px] h-auto aspect-[5/2]">
                    <Image
                    src="/xiom.png"
                    alt="Xiom"
                    fill
                    className="object-contain"
                    />
                </div>

                <span className="text-white text-xl sm:text-3xl md:text-5xl font-semibold">
                    &
                </span>

                <div className="relative w-[120px] sm:w-[200px] md:w-[300px] h-auto aspect-[5/2]">
                    <Image
                    src="/sanwei.png"
                    alt="Sanwei"
                    fill
                    className="object-contain"
                    />
                </div>
            </div>
        </section>
    )
}
