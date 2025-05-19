"use client"

import type React from "react"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { toast } from "sonner"

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  className?: string
  children?: React.ReactNode
}

const LogoutButton = ({ variant = "outline", className = "flex items-center", children }: LogoutButtonProps) => {
  const handleClick = async () => {
    try {
      toast.success("Sesión cerrada", {
        description: "Has cerrado sesión correctamente",
      })
      await signOut({
        callbackUrl: "/login",
      })
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
