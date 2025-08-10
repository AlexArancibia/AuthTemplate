"use client"

import { useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { useMainStore } from "@/stores/mainStore"
import Image from "next/image"
import { motion } from "framer-motion"

export function Testimonials() {
    const { cardSections } = useMainStore()
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        loop: true,
    })

    const [canScrollPrev, setCanScrollPrev] = useState(false)
    const [canScrollNext, setCanScrollNext] = useState(true)

    const scrollPrev = () => emblaApi?.scrollPrev()
    const scrollNext = () => emblaApi?.scrollNext()

    useEffect(() => {
        if (emblaApi) {
        const onSelect = () => {
            setCanScrollPrev(emblaApi.canScrollPrev())
            setCanScrollNext(emblaApi.canScrollNext())
        }

        emblaApi.on("select", onSelect)
        onSelect()
        }
    }, [emblaApi])

    // Obtener testimonios por sección
    const testimonialSection = cardSections.find(
        (section) => section.id === "cs_81d989c1-81ed" && section.isActive
    )

    const cards = testimonialSection?.cards
        ?.filter((card) => card.isActive)
        .sort((a, b) => a.position - b.position) || []

    return (
        <section id="testimonios" className="py-16 bg-white w-full">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                <h2 className="font-druk text-4xl font-bold text-black">TESTIMONIOS</h2>
                </div>

                <div className="w-full flex items-center gap-2">
                {/* Botón izquierda */}
                <button
                    onClick={scrollPrev}
                    disabled={!canScrollPrev}
                    className="p-2 disabled:opacity-30"
                    aria-label="Anterior"
                >
                    <ChevronLeft className="w-10 h-10 text-gray-600" />
                </button>

                {/* Carrusel */}
                <div className="overflow-hidden flex-1 py-2" ref={emblaRef}>
                    <div className="flex gap-5 px-6">
                    {cards.map((card) => (
                        <div
                            key={card.id}
                            className="w-full sm:w-1/2 md:w-1/3 shrink-0 px-2"
                        >
                        <motion.div
                            className="relative bg-white rounded-xl shadow-md px-6 py-8 text-center flex flex-col items-center h-full"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Comilla decorativa */}
                            <Quote className="absolute top-4 right-4 w-8 h-8 text-gray-300 scale-x-[-1]" />

                            {/* Imagen */}
                            <div className="w-20 h-20 mb-4 relative">
                            <Image
                                src={card.imageUrl || "/placeholder.svg"}
                                alt={card.title}
                                fill
                                className="rounded-full object-cover"
                            />
                            </div>

                            {/* Estrellas */}
                            <div className="text-yellow-500 text-lg mb-2">★★★★★</div>

                            {/* Descripción */}
                            <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                            {card.description}
                            </p>

                            {/* Nombre */}
                            <h3 className="font-semibold text-black">{card.title}</h3>
                        </motion.div>
                        </div>
                    ))}
                    </div>
                </div>

                {/* Botón derecha */}
                <button
                    onClick={scrollNext}
                    disabled={!canScrollNext}
                    className="p-2 disabled:opacity-30"
                    aria-label="Siguiente"
                >
                    <ChevronRight className="w-10 h-10 text-gray-600" />
                </button>
                </div>
            </div>
        </section>
    )
}
