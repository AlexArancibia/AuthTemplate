"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Menu, ShoppingCart, User, X, Search, Store, Loader2, ChevronDown, LogOut } from "lucide-react"
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
  DropdownMenuLabel,
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

const navItems = [
  { name: "Inicio", href: "/" },
  { name: "Tienda", href: "/productos" },
  { name: "Contacto", href: "/contactenos" },
]

export default function Navbar() {
  const pathname = usePathname()
  const { currentUser } = useUserStore()
  const {
    fetchShopSettings,
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
  } = useCookieConsent()
  const router = useRouter()
  const isCookieConsentEnabled: boolean = shopSettings?.[0]?.cookieConsentEnabled ?? false
  const { items, removeItem, updateQuantity, getTotal, getItemsCount } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showInitialLoading, setShowInitialLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileTiendaOpen, setMobileTiendaOpen] = useState(false)

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

    const saved = localStorage.getItem("currency")
    const savedCurrency = currencyList.find((c) => c.id === saved)

    if (savedCurrency) {
      setSelectedCurrencyId(savedCurrency.id)
    } else {
      const defaultCurrencyId = settings.defaultCurrency?.id || currencyList[0]?.id
      setSelectedCurrencyId(defaultCurrencyId)
    }
  }, [shopSettings])

  const activeCurrency = acceptedCurrencies.find(c => c.id === selectedCurrencyId)

  const hasFetched = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    console.log("[NAVBAR] useEffect for fetching data triggered")

    const loadData = async () => {
      if (hasFetched.current || loading) {
        console.log("[NAVBAR] Data already fetched or loading, skipping")
        return
      }

      console.log("[NAVBAR] Fetching all required data")
      hasFetched.current = true

      try {
        await Promise.all([
          fetchShopSettings(),
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

  const shopName = shopSettings && shopSettings.length > 0 ? shopSettings[0].name : "Mi Tienda"
  const shopLogo = shopSettings && shopSettings.length > 0 && shopSettings[0].logo ? shopSettings[0].logo : null
  const totalItems = getItemsCount()
  const totalPrice = getTotal(selectedCurrencyId)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedSearch = searchTerm.trim()
    
    if (trimmedSearch && trimmedSearch.length >= 2) {
      console.log("Buscando:", trimmedSearch)
      setSearchTerm("")
      setMobileMenuOpen(false)
      window.location.href = `/productos?search=${encodeURIComponent(trimmedSearch)}`
    } else if (trimmedSearch.length > 0 && trimmedSearch.length < 2) {
      console.log("Búsqueda muy corta - mínimo 2 caracteres")
    }
  }

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

  if (!mounted) {
    return (
      <header className="w-full bg-black text-white  ">
        <div className="container-section">
          <div className="content-section flex h-16 items-center justify-between">
            <Skeleton className="h-12 w-48 bg-gray-700" />
            <Skeleton className="h-10 w-96 bg-gray-700 hidden md:block" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-24 bg-gray-700" />
              <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
              <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="w-full bg-black text-white  ">
        <div className="container-section">
          {/* Header superior: Logo, buscador (desktop) e íconos */}
          <div className="content-section flex h-16 items-center justify-between">
             <Link href="/" className="logo-container">
              {loading ? (
                 <Loader2 className="h-8 w-8 animate-spin" />
               ) : (
                 <img 
                   src="/logo-sportt.jpg" 
                   alt="SPORTT PERU" 
                   className="h-8 w-auto object-contain"
                 />
              )}
            </Link>

            {/* Buscador desktop (oculto en móvil) */}
            <div className="flex-1 max-w-2xl mx-4 hidden md:block">
              <form onSubmit={handleSearch} className="flex w-full">
                    <Input
                   name="q"
                   placeholder="Buscar en nuestra tienda"
                   className="flex-1 rounded-r-none bg-white text-black"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                <Button type="submit" className="rounded-l-none bg-pink-500 hover:bg-pink-600">
                      Buscar
                    </Button>
              </form>
                  </div>

            {/* Íconos y menú */}
            <div className="flex items-center gap-4">
              {/* Currency Selector */}
              {shopSettings?.[0]?.multiCurrencyEnabled && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="h-10 px-3 text-sm border border-gray-700 bg-transparent rounded-md text-white hover:text-pink-500 hover:border-pink-500 transition hidden md:block"
                      aria-label="Seleccionar moneda"
                    >
                      {acceptedCurrencies.find((c) => c.id === selectedCurrencyId)?.code || "Moneda"}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-[999] w-40">
                    {acceptedCurrencies.map((currency) => (
                      <DropdownMenuItem
                        key={currency.id}
                        onClick={() => setSelectedCurrencyId(currency.id)}
                        className={`cursor-pointer ${
                          selectedCurrencyId === currency.id ? "text-pink-500" : ""
                        }`}
                      >
                        {currency.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {/* Cart Icon */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                    className="text-white hover:text-pink-500 relative"
                >
                    <ShoppingCart className="h-6 w-6" />
                    <span className="sr-only">Carrito</span>
                  {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-pink-500 text-[10px] font-medium flex items-center justify-center">
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
                                  src={item.variant.imageUrls[0]}
                                alt={item.product.title}
                                className="object-cover h-full w-full"
                              />
                            ) : item.product.imageUrls && item.product.imageUrls.length > 0 ? (
                              <img
                                  src={item.product.imageUrls[0]}
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
                            {/* <p className="text-xs">
                              {item.variant.prices && item.variant.prices.length > 0
                                ? formatCurrency(
                                    item.variant.prices.find(p => p.currency?.id === activeCurrency?.id)!.price * item.quantity,
                                    activeCurrency,
                                  )
                                : "N/A"}
                            </p> */}
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
                            <Button asChild className="flex-1 bg-pink-500 hover:bg-pink-600" size="sm">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:text-pink-500">
                    <User className="h-6 w-6" />
                    <span className="sr-only">Cuenta</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-[999]">
                  <DropdownMenuLabel>Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {currentUser ? (
                    <>
                      <DropdownMenuItem className="text-muted-foreground" disabled>
                        {currentUser.email}
                      </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                        <Link href="/dashboard">Mi cuenta</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/historial">Mis pedidos</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar sesión
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/login" className="text-pink-500 font-medium">
                          Ingresar
                    </Link>
                  </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/register">Crear Cuenta</Link>
                  </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Botón hamburger para móviles */}
                <Button
                  variant="ghost"
                  size="icon"
                className="text-white hover:text-pink-500 md:hidden"
                onClick={() => setMobileMenuOpen(true)}
                >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menú</span>
                </Button>
            </div>
          </div>
        </div>

        {/* Navegación Desktop */}
        <div className="border-t border-gray-800 hidden md:block">
          <nav className="container-section">
            <div className="content-section flex items-center h-12">
              <div className="flex items-center gap-5">
                {navItems.map((item) => {
                  const isShop = item.name.toLowerCase() === "tienda"
                  if (!isShop) {
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-800 hover:text-white",
                          pathname === item.href ? "text-pink-500" : "text-white"
                        )}
                      >
                        {item.name}
                      </Link>
                    )
                  }

                  return (
                    <DropdownMenu key="tienda">
                      <DropdownMenuTrigger asChild>
                        <button
                          className={cn(
                            "inline-flex h-9 w-max items-center justify-center gap-1 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-800 hover:text-white",
                            pathname.startsWith("/productos") ? "text-pink-500" : "text-white"
                          )}
                        >
                          <Link href="/productos">Tienda</Link>
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[400px] p-4 grid grid-cols-2 gap-3 z-[999]">
                        {sortedCategories.length === 0 ? (
                          <div className="text-sm text-muted-foreground col-span-2">Cargando...</div>
                        ) : (
                          sortedCategories.map((category: any) => (
                            <DropdownMenuItem key={category.id} asChild>
                      <Link
                                href={`/productos?category=${category.slug}`}
                                className="block select-none space-y-1 rounded-md p-3 leading-none transition-colors hover:bg-gray-100 hover:text-gray-900"
                      >
                                {category.name}
                      </Link>
                            </DropdownMenuItem>
                          ))
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )
                })}
        </div>
      </div>
    </nav>
        </div>

        {/* Menú móvil con fondo blur */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 backdrop-blur-md bg-black bg-opacity-75">
            <div className="absolute top-4 right-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-2xl">&times;</span>
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center h-full px-4">
              {/* Buscador en el menú móvil */}
              <div className="w-full max-w-md mb-6 flex justify-center">
                <form onSubmit={handleSearch} className="flex w-full">
                  <Input
                    name="q"
                    placeholder="Buscar en nuestra tienda"
                    className="flex-1 rounded-r-none bg-white text-black"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" className="rounded-l-none bg-pink-500 hover:bg-pink-600">
                    Buscar
                  </Button>
                </form>
              </div>
              {/* Enlaces de navegación */}
              <nav className="flex flex-col items-center space-y-6">
                <Link 
                  href="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white text-2xl font-semibold hover:text-pink-500 transition-colors"
                >
                  Inicio
                </Link>
                {/* Sección Tienda con sub ítems */}
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => setMobileTiendaOpen(!mobileTiendaOpen)}
                    className="flex items-center gap-2 text-white text-2xl font-semibold hover:text-pink-500 transition-colors"
                  >
                    <span className="pl-6">Tienda</span>
                    <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${mobileTiendaOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileTiendaOpen && (
                    <div className="mt-4 flex flex-col items-center space-y-4">
                      {sortedCategories.map((category: any) => (
                        <Link 
                          key={category.slug}
                          href={`/productos?category=${category.slug}`} 
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-white/70 text-lg font-light hover:text-pink-500 transition-colors"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <Link 
                  href="/contactenos" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white text-2xl font-semibold hover:text-pink-500 transition-colors"
                >
                  Contacto
                </Link>
              </nav>
            </div>
          </div>
        )}
      </header>

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

