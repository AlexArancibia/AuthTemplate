"use client"

// ...existing code...
import type React from "react"

import Link from "next/link"
import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Menu, ShoppingCart, User, X, Search, Store, Loader2, ChevronDown } from "lucide-react"
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
import { useCurrencyStore } from "@/stores/currency"
import { useCartStore } from "@/stores/cartStore"
import { useCookieConsent } from "@/hooks/useCookieConsent"
import CookieConsentDialog from "./CookieConsentDialog"
import { useUserStore } from "@/stores/userStore"

interface NavbarProps {
  // user?: {
  //   name?: string | null
  //   email?: string | null
  //   image?: string | null
  //   role?: string | null
  // } | null
}

const navItems = [
  { name: "Inicio", href: "/" },
  { name: "Tienda", href: "/productos" },
  { name: "Contacto", href: "/contactenos" },
  { name: "Ofertas", href: "/ofertas" },
]

export default function Navbar() {
  const pathname = usePathname()
  const { currentUser } = useUserStore()
  const {
    fetchShopSettings,
    fetchProducts,
    fetchShippingMethods,
    fetchCategories,
    fetchContents,
    fetchCollections,
    fetchPaymentProviders,
    fetchCoupons,
    fetchCardSections,
    shopSettings,
    loading,
    error,
    categories,
  } = useMainStore()
const { 
    showDialog, 
    acceptAllCookies, 
    declineAllCookies, 
    acceptSelectedCookies, 
    openCookieSettings 
  } = useCookieConsent();
  const router = useRouter()
    const isCookieConsentEnabled: boolean = shopSettings?.[0]?.cookieConsentEnabled ?? false;
  const { items, removeItem, updateQuantity, getTotal, getItemsCount } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showInitialLoading, setShowInitialLoading] = useState(true)
  const [shopOpen, setShopOpen] = useState(false)

  const sortedCategories = useMemo(() => {
    if (!categories) return []
    return [...categories].sort((a, b) => {
      const priorityA = a.priority ?? Number.MAX_SAFE_INTEGER
      const priorityB = b.priority ?? Number.MAX_SAFE_INTEGER
      return priorityA - priorityB
    })
  }, [categories])

  
  const {
    selectedCurrencyId,
    setSelectedCurrencyId,
    acceptedCurrencies,
    setAcceptedCurrencies
  } = useCurrencyStore()

  useEffect(() => {
    const settings = shopSettings?.[0]
    if (!settings?.multiCurrencyEnabled || !settings?.acceptedCurrencies?.length) return

    const currencyList = settings.acceptedCurrencies.map((currency) => ({
      id: currency.id,
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol || "",
      label: `${currency.code} - ${currency.symbol || ""} (${currency.name})`,
    }))

    setAcceptedCurrencies(currencyList)

    const saved = localStorage.getItem("currency") // ahora será un ID como "curr_123"
    const savedCurrency = currencyList.find((c) => c.id === saved)

    if (savedCurrency) {
      setSelectedCurrencyId(savedCurrency.id)
    } else {
      const defaultCurrencyId = settings.defaultCurrency?.id || currencyList[0]?.id
      setSelectedCurrencyId(defaultCurrencyId)
    }
  }, [shopSettings])

  const activeCurrency = acceptedCurrencies.find(c => c.id === selectedCurrencyId)

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
    }, 1000)

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
        // Realizar todos los fetch en paralelo con límites altos para carga inicial
        await Promise.all([
          fetchShopSettings(),
          fetchProducts({ limit: 100 }),
          fetchShippingMethods({ limit: 100 }),
          fetchCategories({ limit: 100 }),
          fetchContents({ limit: 100 }),
          fetchCollections({ limit: 100 }),
          fetchCardSections(),
          fetchCoupons({ limit: 100 }),
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
    fetchCoupons,
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
  const totalPrice = getTotal(selectedCurrencyId)

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
            style={{ maxWidth: "128px", maxHeight: "128px" }}
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
    <>

    <nav className="bg-background/95 backdrop-blur-md border-b sticky top-0 z-[180] font-adi-regular font-light uppercase">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <div className="w-1/2 lg:w-1/4">
            <Link href="/" aria-label="Ir a la página de inicio" className="flex items-center">
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : shopLogo ? (
                <img src={shopLogo || "/placeholder.svg"} alt={shopName} className="h-10 lg:h-7 w-auto mr-2" />
              ) : (
                <Store className="h-5 w-5 mr-2" />
              )}
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex lg:w-1/2 xl:w-1/2 justify-center relative">
            {navItems.map((item) => {
              const isShop = item.name.toLowerCase() === "tienda"
              if (!isShop) {
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-6 xl:px-12 py-1 text-sm transition-colors hover:text-primary",
                      pathname === item.href ? "text-primary" : "text-secondary",
                    )}
                  >
                    {item.name}
                  </Link>
                )
              }

              // --- Tienda con dropdown ---
              return (
                <div
                  key="tienda"
                  className="px-6 xl:px-12 py-1 text-sm relative"
                  onMouseEnter={() => setShopOpen(true)}
                  onMouseLeave={() => setShopOpen(false)}
                >
                  <Link
                    href="/productos"
                    className={cn(
                      "flex items-center gap-1 transition-colors hover:text-primary",
                      pathname.startsWith("/productos") ? "text-primary" : "text-secondary",
                    )}
                  >
                    Tienda
                    <ChevronDown className={cn("h-4 w-4 transition-transform", shopOpen ? "rotate-180" : "rotate-0")} />
                  </Link>

                  {shopOpen && (
                    <div
                      role="menu"
                      className="absolute left-0 top-full -mt-px w-48 bg-white border border-gray-200 shadow-md rounded-none flex flex-col z-[500]"
                    >
                      {sortedCategories.length === 0 ? (
                        <div className="text-sm text-muted-foreground p-2">Cargando...</div>
                      ) : (
                        sortedCategories.map((category: any) => (
                          <Link
                            key={category.id}
                            href={`/productos?category=${category.id}`}
                            className="text-sm px-4 py-2 hover:bg-gray-100"
                            role="menuitem"
                          >
                            {category.name}
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            })}
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
                <DialogTitle className="text-lg text-center">Buscar productos</DialogTitle>
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
                            {item.variant.imageUrls && item.variant.imageUrls.length > 0 ? (
                              <img
                                src={item.variant.imageUrls[0] || "/placeholder.svg"}
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
                            <h4 className="text-sm truncate">{item.product.title}</h4>
                            <p className="text-xs text-muted-foreground truncate mb-1">{item.variant.title}</p>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 mb-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.variant.id, Math.max(1, item.quantity - 1))}
                                disabled={item.quantity <= 1}
                              >
                                <span className="text-xs">-</span>
                              </Button>
                              <span className="text-xs min-w-[20px] text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                              >
                                <span className="text-xs">+</span>
                              </Button>
                            </div>

                            <p className="text-xs">
                              {item.variant.prices && item.variant.prices.length > 0
                                ? formatCurrency(
                                    item.variant.prices.find(p => p.currency?.id === activeCurrency?.id)!.price * item.quantity,
                                    activeCurrency,
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
                      <p className="text-base mb-3 flex justify-between">
                        <span>Total:</span>
                        <span>{formatCurrency(totalPrice, activeCurrency)}</span>
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

            
            {/* Currency Selector */}
            {shopSettings?.[0]?.multiCurrencyEnabled &&
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="h-8 px-3 text-sm border border-border bg-background rounded-md text-secondary hover:text-primary hover:bg-secondary/10 transition"
                    aria-label="Seleccionar moneda"
                  >
                    {
                      acceptedCurrencies.find((c) => c.id === selectedCurrencyId)?.code
                      || "Moneda"
                    }
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="z-[999] bg-popover text-popover-foreground border rounded-md shadow-md p-1 w-40"
                >
                  {acceptedCurrencies.map((currency) => (
                    <DropdownMenuItem
                      key={currency.id}
                      onClick={() => setSelectedCurrencyId(currency.id)}
                      className={`cursor-pointer px-3 py-1.5 text-sm rounded-md hover:bg-secondary/10 ${
                        selectedCurrencyId === currency.id ? "text-primary" : ""
                      }`}
                    >
                      {currency.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            }

            {/* User Menu */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={currentUser.image || ""} alt={currentUser.name || "Usuario"} />
                      <AvatarFallback className="text-xs">{getInitials(currentUser.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 z-[999]" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                    {currentUser.role && (
                      <p className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full w-fit">
                        {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                      </p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Mi Cuenta</span>
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
                className="hidden sm:flex bg-primary text-white hover:text-primary text-xs hover:bg-secondary/10 px-2 h-8"
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
              <SheetContent side="right" className="w-[300px] sm:w-[320px] bg-background p-4">
                <SheetHeader className="pb-2">
                  <SheetTitle className="text-lg">Menú</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-3 mt-4 font-adi-regular font-light uppercase">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "text-sm font-adi-regular font-light uppercase transition-colors hover:text-primary py-1.5",
                          pathname === item.href ? "text-primary" : "text-secondary",
                        )}
                      >
                        {item.name}
                      </Link>
                    </SheetClose>
                  ))}
                  {!currentUser && (
                    <SheetClose asChild>
                      <Link
                        href="/login"
                        className="text-sm transition-colors hover:text-primary py-1.5 flex items-center lg:hidden"
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

    {isCookieConsentEnabled && showDialog && (
        <CookieConsentDialog
          onAccept={acceptAllCookies}
          onDecline={declineAllCookies}
          onAcceptSelected={acceptSelectedCookies}
        />
      )}
    </>
  )
}
