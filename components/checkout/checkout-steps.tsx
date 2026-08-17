"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

interface CheckoutStepsProps {
  steps: { step: number; label: string }[]
  currentStep: number
}

export function CheckoutSteps({ steps, currentStep }: CheckoutStepsProps) {
  return (
    <div className="hidden md:flex justify-between items-center max-w-3xl mx-auto relative">
      {/* Track */}
      <div className="absolute top-5 left-0 right-0 h-px bg-border z-0" />
      {steps.map((item, index) => {
        const isActive = currentStep === item.step
        const isComplete = currentStep > item.step
        const isReached = currentStep >= item.step

        return (
          <div key={index} className="flex flex-col items-center z-10">
            <motion.div
              initial={false}
              animate={{ scale: isActive ? 1.05 : 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`w-10 h-10 flex items-center justify-center border transition-colors ${
                isComplete
                  ? "bg-foreground text-background border-foreground"
                  : isActive
                  ? "bg-brand text-brand-foreground border-brand"
                  : "bg-background text-muted-foreground border-border"
              }`}
            >
              {isComplete ? <Check className="w-4 h-4" /> : <span className="text-sm tabular-nums">{index + 1}</span>}
            </motion.div>
            <span
              className={`mt-3 eyebrow ${
                isReached ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
