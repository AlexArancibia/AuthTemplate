"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Image from "next/image"

export function Sponsors() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.3 })

    return (
        <motion.section 
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="container-section bg-white w-full "
        >
            <div className="content-section">
                {/* Footer alineado y responsive */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-black h-20 sm:h-24 md:h-28 flex items-center justify-center gap-4 sm:gap-6 md:gap-12 px-4 mb-10"
                >
                <span className="text-white text-lg sm:text-2xl md:text-3xl font-semibold">
                    POWERED BY
                </span>

                <div className="relative w-[100px] sm:w-[150px] md:w-[180px] h-auto aspect-[5/2]">
                    <Image
                    src="/xiom.png"
                    alt="Xiom"
                    fill
                    className="object-contain"
                    />
                </div>

                <span className="text-white text-lg sm:text-2xl md:text-3xl font-semibold">
                    &
                </span>

                <div className="relative w-[100px] sm:w-[150px] md:w-[220px] h-auto aspect-[5/2]">
                    <Image
                    src="/sanwei.png"
                    alt="Sanwei"
                    fill
                    className="object-contain"
                    />
                </div>
                </motion.div>
            </div>
        </motion.section>
    )
}
