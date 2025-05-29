"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { Menu, ShoppingCart, User, X, Search, Store, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { useMainStore } from "@/stores/mainStore"
import { useCartStore } from "@/stores/cartStore"

interface NavbarProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
  } | null
}

const navItems = [
  { name: "Inicio", href: "/" },
  { name: "Nosotros", href: "/nosotros" },
  { name: "Productos", href: "/productos" },
  { name: "Promociones", href: "/promociones" },
  { name: "Catálogo", href: "/catalogo" },
  { name: "Blog", href: "/blog" },
  { name: "Contáctenos", href: "/contactenos" },
]

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const {
    fetchShopSettings,
    fetchProducts,
    fetchShippingMethods,
    fetchCategories,
    fetchContents,
    fetchCollections,
    fetchPaymentProviders,
    fetchCardSections,
    shopSettings,
    loading,
    error,
  } = useMainStore()
  const { items, removeItem, getTotal, getItemsCount } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showInitialLoading, setShowInitialLoading] = useState(true)

  // Simple fetch control
  const hasFetched = useRef(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Show loading screen immediately and hide after 700ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialLoading(false)
    }, 700)

    return () => clearTimeout(timer)
  }, [])

  // Fetch shop settings on mount
  useEffect(() => {
    console.log("[NAVBAR] useEffect for fetching data triggered")

    const loadData = async () => {
      // Skip if already fetched or already loading
      if (hasFetched.current || loading) {
        console.log("[NAVBAR] Data already fetched or loading, skipping")
        return
      }

      console.log("[NAVBAR] Fetching all required data")
      hasFetched.current = true

      try {
        // Realizar todos los fetch en paralelo
        await Promise.all([
          fetchShopSettings(),
          fetchProducts(),
          fetchShippingMethods(),
          fetchCategories(),
          fetchContents(),
          fetchCollections(),
          fetchCardSections(),
          fetchPaymentProviders(),
        ])

        console.log("[NAVBAR] All data loaded successfully")
      } catch (err) {
        console.error("[NAVBAR] Error fetching data:", err)
        toast.error("Error de conexión", {
          description: "No se pudieron cargar los datos de la tienda",
        })
      }
    }

    loadData()
  }, [
    fetchShopSettings,
    fetchProducts,
    fetchShippingMethods,
    fetchCategories,
    fetchCollections,
    fetchContents,
    fetchCardSections,
    fetchPaymentProviders,
    loading,
  ])

  const handleSignOut = async () => {
    try {
      console.log("[NAVBAR] Signing out user")
      toast.success("Sesión cerrada", {
        description: "Has cerrado sesión correctamente",
      })
      await signOut({
        callbackUrl: "/login",
      })
    } catch (error) {
      console.error("[NAVBAR] Error signing out:", error)
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

  // Get shop name from settings
  const shopName = shopSettings && shopSettings.length > 0 ? shopSettings[0].name : "Mi Tienda"
  console.log("[NAVBAR] Using shop name:", shopName)

  // Get shop logo from settings
  const shopLogo = shopSettings && shopSettings.length > 0 && shopSettings[0].logo ? shopSettings[0].logo : null
  console.log("[NAVBAR] Using shop logo:", shopLogo ? "Yes" : "No")

  // Get default currency
  const defaultCurrency = shopSettings && shopSettings.length > 0 ? shopSettings[0].defaultCurrency : null

  // Cart calculations
  const totalItems = getItemsCount()
  const totalPrice = getTotal()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // Implementar la búsqueda aquí
      console.log("Buscando:", searchTerm)
      setIsSearchOpen(false)
      setSearchTerm("")

      // Redirigir a la página de resultados de búsqueda
      window.location.href = `/productos?search=${encodeURIComponent(searchTerm.trim())}`
    }
  }

  // Show loading screen immediately on initial page load - BEFORE any other renders
  if (showInitialLoading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center" style={{ zIndex: 99999 }}>
        <div className="flex flex-col items-center">
          <img 
            src="/fondo1.png" 
            alt="Cargando" 
            className="w-32 h-32 object-contain animate-pulse"
            style={{ maxWidth: '128px', maxHeight: '128px' }}
          />
        </div>
      </div>
    )
  }

  // Si no está montado, no renderizamos nada o un placeholder simple
  if (!mounted) {
    return (
      <nav className="bg-background/95 backdrop-blur-md border-b sticky top-0 z-[180]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="w-1/4 lg:w-1/4">
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="hidden lg:flex lg:w-1/2 xl:w-1/2 justify-center gap-4">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-16" />
              ))}
            </div>
            <div className="flex items-center justify-end w-3/4 lg:w-1/3 xl:w-1/4 gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-full lg:hidden" />
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-background/95 backdrop-blur-md border-b sticky top-0 z-[180]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <div className="w-1/2 lg:w-1/4">
            <Link href="/" aria-label="Ir a la página de inicio" className="flex items-center">
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : shopLogo ? (
                <img src={shopLogo || "/placeholder.svg"} alt={shopName} className="h-10 lg:h-12 w-auto mr-2" />
              ) : (
                <Store className="h-5 w-5 mr-2" />
              )}
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex lg:w-1/2 xl:w-1/2 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-2 xl:px-4 py-1 text-sm font-normal transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary font-medium" : "text-secondary",
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Search and Icons */}
          <div className="flex items-center justify-end w-3/4 lg:w-1/3 xl:w-1/4 gap-2 md:gap-3">
            {/* Search Icon and Dialog */}
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-secondary hover:text-primary hover:bg-secondary/10"
                  aria-label="Buscar productos"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90%] max-w-md z-[555] bg-background/95 backdrop-blur-md border-none shadow-lg">
                <DialogTitle className="text-lg font-semibold text-center">Buscar productos</DialogTitle>
                <form onSubmit={handleSearch} className="flex flex-col gap-4 mt-2">
                  <div className="flex w-full items-center space-x-2">
                    <Input
                      type="text"
                      placeholder="¿Qué estás buscando?"
                      className="flex-1"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                    />
                    <Button type="submit" size="sm">
                      Buscar
                    </Button>
                  </div>
                  {searchTerm.length > 0 && (
                    <p className="text-xs text-muted-foreground">Presiona Enter para buscar &quot;{searchTerm}&quot;</p>
                  )}
                </form>
              </DialogContent>
            </Dialog>

            {/* Cart Icon and Drawer */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 relative text-secondary hover:text-primary hover:bg-secondary/10"
                  aria-label="Carrito de compras"
                >
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] sm:w-[380px] bg-background p-4">
                <SheetHeader className="pb-2">
                  <SheetTitle className="text-lg">Tu Carrito</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-[calc(100%-3rem)]">
                  <div className="flex-grow overflow-y-auto py-2">
                    {items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-40 mt-6">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-center text-muted-foreground text-sm">Tu carrito está vacío</p>
                      </div>
                    ) : (
                      items.map((item) => (
                        <div key={item.variant.id} className="flex items-center gap-3 py-3 border-b">
                          <div className="relative h-14 w-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {item.variant.imageUrl ? (
                              <img
                                src={item.variant.imageUrl || "/placeholder.svg"}
                                alt={item.product.title}
                                className="object-cover h-full w-full"
                              />
                            ) : item.product.imageUrls && item.product.imageUrls.length > 0 ? (
                              <img
                                src={item.product.imageUrls[0] || "/placeholder.svg"}
                                alt={item.product.title}
                                className="object-cover h-full w-full"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full w-full bg-gray-200">
                                <ShoppingCart className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{item.product.title}</h4>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.variant.title} - Cantidad: {item.quantity}
                            </p>
                            <p className="text-xs font-medium">
                              {item.variant.prices && item.variant.prices.length > 0
                                ? formatCurrency(
                                    item.variant.prices[0].price * item.quantity,
                                    item.variant.prices[0].currency?.code || "USD",
                                  )
                                : "N/A"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => removeItem(item.variant.id)}
                            aria-label="Eliminar producto"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                  {items.length > 0 && (
                    <div className="mt-auto pt-3 border-t">
                      <p className="font-medium text-base mb-3 flex justify-between">
                        <span>Total:</span>
                        <span>{formatCurrency(totalPrice, defaultCurrency?.code || "USD")}</span>
                      </p>
                      <div className="flex gap-2">
                        <SheetClose asChild>
                          <Button asChild className="flex-1" variant="outline" size="sm">
                            <Link href="/cart">Ver Carrito</Link>
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button asChild className="flex-1" size="sm">
                            <Link href="/checkout">Proceder a Pagar</Link>
                          </Button>
                        </SheetClose>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.image || ""} alt={user.name || "Usuario"} />
                      <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    {user.role && (
                      <p className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full w-fit">
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600 flex items-center"
                    onClick={handleSignOut}
                  >
                    <X className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                className="hidden sm:flex bg-primary text-white hover:text-primary font-normal text-xs hover:bg-secondary/10 px-2 h-8"
                asChild
              >
                <Link href="/login">
                  <User className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  Iniciar Sesión
                </Link>
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 lg:hidden text-secondary hover:text-primary hover:bg-secondary/10"
                  aria-label="Abrir menú"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-background p-4">
                <SheetHeader className="pb-2">
                  <SheetTitle className="text-lg">Menú</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-3 mt-4">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "text-sm font-medium transition-colors hover:text-primary py-1.5",
                          pathname === item.href ? "text-primary font-semibold" : "text-secondary",
                        )}
                      >
                        {item.name}
                      </Link>
                    </SheetClose>
                  ))}
                  {!user && (
                    <SheetClose asChild>
                      <Link
                        href="/login"
                        className="text-sm font-medium transition-colors hover:text-primary py-1.5 flex items-center lg:hidden"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Iniciar Sesión
                      </Link>
                    </SheetClose>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}