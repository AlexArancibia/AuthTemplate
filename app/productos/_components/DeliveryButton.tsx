"use client"

import { Package } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function DeliveryButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        className="relative w-full rounded-2xl p-[2px] overflow-hidden"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className="absolute inset-0 rounded-2xl bg-blue-400 opacity-10"
          animate={{ scale: [1, 1.15, 1], opacity: [0, 0.4, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        />

        <Button
          variant="ghost"
          onClick={() => setOpen(true)}
          className="relative flex justify-start items-start border border-blue-200 rounded-2xl p-4 bg-blue-50 hover:bg-blue-100 w-full h-auto transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-left">ENTREGA RÁPIDA</p>
              <p className="text-blue-600 font-medium text-left">SEGURO Y CONFIABLE</p>
            </div>
          </div>
        </Button>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTitle></DialogTitle>
        <DialogContent className="max-w-[90%] sm:max-w-[800px] z-[456] rounded-xl p-6 overflow-hidden">
          <Image 
            src="/delivery-image.png" 
            alt="Delivery" 
            width={800} 
            height={600} 
            className="rounded-lg shadow-lg" 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
