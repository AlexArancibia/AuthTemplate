"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"

interface ProductGalleryProps {
  images: string[]
  alt: string
  /** changing this key resets the active image (e.g. on variant change) */
  resetKey?: string
}

export default function ProductGallery({ images, alt, resetKey }: ProductGalleryProps) {
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)

  // Reset to first image when the variant (resetKey) changes.
  useEffect(() => {
    setActive(0)
  }, [resetKey])

  const safeImages = images.length > 0 ? images : ["/placeholder.svg"]
  const current = safeImages[Math.min(active, safeImages.length - 1)]

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row sm:gap-5">
      {/* Thumbnail strip — column on desktop, row on mobile */}
      {safeImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 sm:w-20 sm:flex-col sm:overflow-y-auto sm:overflow-x-visible sm:pb-0 scrollbar-thin">
          {safeImages.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1}`}
              aria-current={i === active}
              className={`relative aspect-square w-16 flex-shrink-0 overflow-hidden border bg-secondary transition-colors sm:w-full ${
                i === active
                  ? "border-foreground"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <Image
                src={url}
                alt={`${alt} miniatura ${i + 1}`}
                fill
                sizes="80px"
                className="object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative aspect-[4/5] flex-1 overflow-hidden bg-secondary">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={current}
              alt={alt}
              fill
              priority
              sizes="(max-width:768px) 100vw, 50vw"
              className="object-contain p-6 sm:p-10"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
