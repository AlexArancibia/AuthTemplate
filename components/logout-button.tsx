"use client"

import type React from "react"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { toast } from "sonner"
import { useMainStore } from "@/stores/mainStore"
import { useCartStore } from "@/stores/cartStore"

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  className?: string
  children?: React.ReactNode
}

const LogoutButton = ({ variant = "outline", className = "flex items-center", children }: LogoutButtonProps) => {
  const clearCart = useCartStore(state => state.clearCart)
  const clearUserData = useMainStore(state => state.clearUserData)
  
  const handleClick = async () => {
    try {
      // Limpiar datos del usuario y carrito antes de cerrar sesión
      clearCart()
      clearUserData()
      
      toast.success("Sesión cerrada", {
        description: "Has cerrado sesión correctamente",
      })
      
      // Hacer signOut sin redirect automático y luego redirigir manualmente
      await signOut({ redirect: false })
      
      // Redirigir manualmente al login del mismo origen
      window.location.href = `${window.location.origin}/login`
    } catch (error) {
      toast.error("Error al cerrar sesión", {
        description: "Ha ocurrido un error al cerrar la sesión",
      })
    }
  }

  return (
    <Button onClick={handleClick} variant={variant} className={className}>
      {children || (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </>
      )}
    </Button>
  )
}

export default LogoutButton
