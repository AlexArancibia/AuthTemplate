"use client"

import { useEffect, useState, useRef, useMemo, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { useMainStore } from "@/stores/mainStore"
import Image from "next/image"
import { motion, useInView } from "framer-motion"

const TESTIMONIAL_SECTION_ID = "cs_81d989c1-81ed"
const FADE_ANIMATION = { opacity: 0, y: 20 }
const FADE_IN = { opacity: 1, y: 0 }

const ArrowButton = ({ 
  onClick, 
  disabled, 
  Icon, 
  ariaLabel 
}: { 
  onClick: () => void
  disabled: boolean
  Icon: typeof ChevronLeft
  ariaLabel: string
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="p-1 sm:p-1.5 md:p-2 disabled:opacity-30"
    aria-label={ariaLabel}
  >
    <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-gray-600" />
  </button>
)

export function Testimonials() {
    const { cardSections } = useMainStore()
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.3 })
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        loop: true,
    })

    const [canScrollPrev, setCanScrollPrev] = useState(false)
    const [canScrollNext, setCanScrollNext] = useState(true)

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

    useEffect(() => {
        if (!emblaApi) return
        
        const updateScrollState = () => {
            setCanScrollPrev(emblaApi.canScrollPrev())
            setCanScrollNext(emblaApi.canScrollNext())
        }

        emblaApi.on("select", updateScrollState)
        updateScrollState()

        return () => {
            emblaApi.off("select", updateScrollState)
        }
    }, [emblaApi])

    const cards = useMemo(() => {
        const section = cardSections.find(
            (s) => s.id === TESTIMONIAL_SECTION_ID && s.isActive
        )
        return section?.cards
            ?.filter((card) => card.isActive)
            .sort((a, b) => a.position - b.position) || []
    }, [cardSections])

    const animationProps = { initial: FADE_ANIMATION, animate: isInView ? FADE_IN : FADE_ANIMATION }

    return (
        <motion.section 
            ref={ref}
            {...animationProps}
            transition={{ duration: 0.6 }}
            id="testimonios" 
            className="py-16 bg-white w-full"
        >
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <motion.h2 
                        {...animationProps}
                        transition={{ duration: 0.5 }}
                        className="font-druk text-2xl sm:text-3xl md:text-4xl font-bold text-black"
                    >
                        TESTIMONIOS
                    </motion.h2>
                </div>

                <motion.div 
                    {...animationProps}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full flex items-center gap-2"
                >
                    <ArrowButton 
                        onClick={scrollPrev}
                        disabled={!canScrollPrev}
                        Icon={ChevronLeft}
                        ariaLabel="Anterior"
                    />

                    <div className="overflow-hidden flex-1 py-2" ref={emblaRef}>
                        <div className="flex gap-3 sm:gap-5 px-2 sm:px-6">
                            {cards.map((card, index) => (
                                <div
                                    key={card.id}
                                    className="w-full md:w-1/2 lg:w-1/3 shrink-0 px-1 sm:px-2"
                                >
                                    <motion.div
                                        className="relative bg-white rounded-xl shadow-md px-4 py-6 sm:px-6 sm:py-8 text-center flex flex-col items-center h-full"
                                        {...animationProps}
                                        transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                                    >
                                        <Quote className="absolute top-4 right-4 w-8 h-8 text-gray-300 scale-x-[-1]" />

                                        <div className="w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4 relative">
                                            <Image
                                                src={card.imageUrl || "/placeholder.svg"}
                                                alt={card.title}
                                                fill
                                                className="rounded-full object-cover"
                                            />
                                        </div>

                                        <div className="text-yellow-500 text-lg mb-2">★★★★★</div>

                                        <p className="text-gray-700 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                                            {card.description}
                                        </p>

                                        <h3 className="font-semibold text-black">{card.title}</h3>
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <ArrowButton 
                        onClick={scrollNext}
                        disabled={!canScrollNext}
                        Icon={ChevronRight}
                        ariaLabel="Siguiente"
                    />
                </motion.div>
            </div>
        </motion.section>
    )
}
