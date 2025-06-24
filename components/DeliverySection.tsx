"use client"

import { useMainStore } from "@/stores/mainStore"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
 

export function DeliveryHeroSection() {
  const { heroSections } = useMainStore()

  const deliverySection = heroSections?.find(
    (section) => section.isActive && section.metadata?.section === "delivery"
  )

  if (!deliverySection) return null

  const {
    title,
    subtitle,
    backgroundImage,
    mobileBackgroundImage,
    buttonText,
    buttonLink,
    styles = {},
  } = deliverySection

  const bgImage =  mobileBackgroundImage ? mobileBackgroundImage : backgroundImage
 

  const textAlignClass = styles.textAlign || "text-left"
  const verticalAlignClass = styles.verticalAlign || "items-center"
  const titleColorClass = styles.titleColor || "text-gray-900"
  const subtitleColorClass = styles.subtitleColor || "text-gray-600"

  return (
    <section className="overflow-hidden">
      <div className="container-section py-4 lg:py-0 mb-8">
        <motion.div
          className={`content-section rounded-2xl overflow-hidden flex ${verticalAlignClass} py-10 relative`}
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className={`container mx-auto px-4 md:px-6 flex ${
              textAlignClass === "text-center"
                ? "justify-center"
                : textAlignClass === "text-right"
                ? "justify-end"
                : "justify-start"
            } relative z-10`}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className={`max-w-xl p-4 md:p-8 ${textAlignClass}`}
            >
              {title && (
                <h2 className={`text-2xl md:text-2xl lg:text-4xl font-bold mb-4 ${titleColorClass}`}>{title}</h2>
              )}

              {subtitle && (
                <p className={`text-base md:text-base lg:text-lg mb-6 ${subtitleColorClass}`}>{subtitle}</p>
              )}

              {buttonText && buttonLink && (
                <div
                  className={
                    textAlignClass === "text-center"
                      ? "flex justify-center"
                      : textAlignClass === "text-right"
                      ? "flex justify-end"
                      : ""
                  }
                >
                  <Button className="mb-32 md:mb-0 " asChild>
                    <Link href={buttonLink}>{buttonText}</Link>
                  </Button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Imagen de Delivery siempre presente y animada cuando entra en vista */}
          <motion.div
            className="absolute right-0 bottom-0 z-20"
            initial={{ x: 200, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          >
            <Image
              src="/delivery.png"
              alt="Delivery"
              width={ 500}
              height={ 400}
              className="object-contain"
              priority
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}