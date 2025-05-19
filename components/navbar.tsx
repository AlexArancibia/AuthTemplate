"use client"

import Link from "next/link"
import { useState } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, X, User, Settings, LogOut } from "lucide-react"
import { toast } from "sonner"

interface NavbarProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
  } | null
}

export default function Navbar({ user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
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

  const getInitials = (name?: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          Mi Aplicación
        </Link>

        {/* Navegación para escritorio */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-sm font-medium hover:text-primary">
            Inicio
          </Link>
          <Link href="/features" className="text-sm font-medium hover:text-primary">
            Características
          </Link>
          <Link href="/pricing" className="text-sm font-medium hover:text-primary">
            Precios
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary">
            Acerca de
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || ""} alt={user.name || "Usuario"} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  {user.role && (
                    <p className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full w-fit">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Panel de control</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600 flex items-center"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Iniciar sesión</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Registrarse</Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Botón de menú móvil */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200/50">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link href="/" className="text-sm font-medium py-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>
              Inicio
            </Link>
            <Link
              href="/features"
              className="text-sm font-medium py-2 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Características
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium py-2 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Precios
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium py-2 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Acerca de
            </Link>

            {user ? (
              <>
                <div className="flex items-center space-x-3 py-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image || ""} alt={user.name || "Usuario"} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium py-2 hover:text-primary flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="mr-2 h-4 w-4" />
                  Panel de control
                </Link>
                <Link
                  href="/settings"
                  className="text-sm font-medium py-2 hover:text-primary flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Link>
                <button
                  className="text-sm font-medium py-2 text-red-600 flex items-center w-full text-left"
                  onClick={() => {
                    handleSignOut()
                    setIsMenuOpen(false)
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2">
                <Button variant="outline" asChild className="w-full justify-center">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    Iniciar sesión
                  </Link>
                </Button>
                <Button asChild className="w-full justify-center">
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    Registrarse
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
