"use client"

import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"

interface CheckoutStepsProps {
  steps: { step: number; label: string }[]
  currentStep: number
}

export function CheckoutSteps({ steps, currentStep }: CheckoutStepsProps) {
  return (
    <div className="hidden md:flex justify-between items-center max-w-3xl mx-auto relative">
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 -translate-y-1/2 z-0"></div>
      {steps.map((item, index) => (
        <div key={index} className="flex flex-col items-center z-10">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{
              scale: currentStep >= item.step ? 1 : 0.8,
              backgroundColor: currentStep >= item.step ? "var(--primary)" : "var(--muted)",
            }}
            transition={{ duration: 0.3 }}
            className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-white shadow-sm ${
              currentStep >= item.step ? "bg-primary text-white ring-4 ring-primary/10" : "bg-gray-100 text-gray-400"
            }`}
          >
            {currentStep > item.step ? <CheckCircle className="w-5 h-5" /> : <span>{index + 1}</span>}
          </motion.div>
          <motion.span
            initial={{ opacity: 0.6 }}
            animate={{
              opacity: currentStep >= item.step ? 1 : 0.6,
              fontWeight: currentStep >= item.step ? 600 : 400,
            }}
            className={`text-sm ${currentStep >= item.step ? "text-gray-800" : "text-gray-500"}`}
          >
            {item.label}
          </motion.span>
        </div>
      ))}
    </div>
  )
}
