"use client"

import { ShoppingCart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/stores/cartStore"

interface CartIconProps {
  className?: string
}

export default function CartIcon({ className }: CartIconProps) {
  const { items, getItemsCount } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const itemsCount = getItemsCount()

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Trigger animation when items change
  useEffect(() => {
    if (mounted && items.length > 0) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [items, mounted])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={cn("relative", className)}>
        <ShoppingCart className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button variant="ghost" size="icon" className={cn("relative", className)}>
      <ShoppingCart className={cn("h-5 w-5", isAnimating && "text-primary")} />
      <AnimatePresence>
        {itemsCount > 0 && (
          <motion.div
            key="cart-badge"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{
              scale: isAnimating ? [1, 1.2, 1] : 1,
              opacity: 1,
            }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{
              duration: 0.3,
              scale: {
                duration: 0.5,
                times: [0, 0.5, 1],
              },
            }}
            className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
          >
            {itemsCount}
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  )
}
