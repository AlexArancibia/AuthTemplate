"use client"

import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckoutStepsProps {
  steps: { step: number; label: string }[]
  currentStep: number
}

export function CheckoutSteps({ steps, currentStep }: CheckoutStepsProps) {
  // Si el step es 4 (confirmación), llenar la barra al 100%
  const progressPercentage = currentStep >= 4 ? 100 : (currentStep / steps.length) * 100

  return (
    <div className="w-full py-6 md:py-8 bg-card border-b">
      <div className="max-w-4xl mx-auto px-4 space-y-4">

        {/* Progress bar */}
        <div className="relative h-3 bg-muted rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full shadow-md"
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>

        {/* Step labels with enhanced design */}
        <div className="flex items-center justify-between">
          {steps.map((item, index) => {
            // Si el step es 4 (confirmación), marcar todos como completados
            const isCompleted = currentStep >= 4 ? true : item.step < currentStep
            const isCurrent = item.step === currentStep

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center gap-2 flex-1"
              >
                {/* Step indicator */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{
                    scale: (isCompleted || isCurrent) ? 1 : 0.8,
                  }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                    isCompleted && "bg-primary text-white ring-4 ring-primary/20",
                    isCurrent && "bg-primary text-white ring-4 ring-primary/20 shadow-lg",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="font-semibold text-sm">{index + 1}</span>
                  )}
                </motion.div>

                {/* Step title */}
                <motion.span
                  initial={{ opacity: 0.6 }}
                  animate={{
                    opacity: (isCompleted || isCurrent) ? 1 : 0.6,
                  }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "text-xs md:text-sm font-medium text-center transition-all duration-300",
                    (isCompleted || isCurrent) && "text-foreground font-semibold",
                    !isCompleted && !isCurrent && "text-muted-foreground"
                  )}
                >
                  {item.label}
                </motion.span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
