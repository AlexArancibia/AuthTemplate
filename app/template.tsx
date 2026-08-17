"use client"

import { motion, useReducedMotion } from "framer-motion"
import type { ReactNode } from "react"

/**
 * Global page-enter animation. Next.js re-mounts template.tsx on every
 * navigation, giving a subtle fade/translate transition across the whole site.
 */
export default function Template({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  if (reduce) return <>{children}</>
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
