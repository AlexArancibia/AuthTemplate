"use client"

import { FlaskConical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { motion } from "framer-motion"
import { WashingTestDialog } from "./WashingTestDialog"

export function WashingTestButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <motion.div
        className="relative w-full rounded-2xl p-[2px] overflow-hidden"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Glow animado alrededor */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-blue-400 opacity-10"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        {/* Contenido del botón */}
        <Button
          variant="ghost"
          onClick={() => setOpen(true)}
          className="relative flex justify-start items-start border border-blue-200 rounded-2xl p-4 bg-blue-50 hover:bg-blue-100 w-full h-auto transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <FlaskConical className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-left">
                PRUEBAS DE LAVADO
              </p>
              <p className="text-blue-600 font-medium text-left">GRATIS</p>
            </div>
          </div>
        </Button>
      </motion.div>

      <WashingTestDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
