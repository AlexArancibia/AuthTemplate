"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { ShoppingBag, User, X, Search, Minus, Plus, Heart, Sparkles, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
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
import { getCategoriesTree } from "@/lib/categoryUtils"
import { useMainStore } from "@/stores/mainStore"
import { useCurrencyStore } from "@/stores/currency"
import { useCartStore } from "@/stores/cartStore"
import { useCookieConsent } from "@/hooks/useCookieConsent"
import CookieConsentDialog from "./CookieConsentDialog"
import { useUserStore } from "@/stores/userStore"
import MobileMenu from "./MobileMenu"
import type { Category } from "@/types/category"

export default function Navbar() {
  const pathname = usePathname()
  const { currentUser, fetchUserByEmail } = useUserStore()
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
    categories,
    collections,
  } = useMainStore()
  const { showDialog, acceptAllCookies, declineAllCookies, acceptSelectedCookies } = useCookieConsent()
  const isCookieConsentEnabled = shopSettings?.[0]?.cookieConsentEnabled ?? false
  const { items, removeItem, updateQuantity, getTotal, getItemsCount } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const sessionFetchAttempted = useRef(false)
  const [isSessionLoading, setIsSessionLoading] = useState(!currentUser)

  const { selectedCurrencyId, setSelectedCurrencyId, acceptedCurrencies, setAcceptedCurrencies } = useCurrencyStore()

  useEffect(() => {
    const settings = shopSettings?.[0]
    const accepted = settings?.acceptedCurrencies
    if (!accepted || accepted.length === 0) return
    const currencyList = accepted.map((c) => ({
      id: c.id, code: c.code, name: c.name, symbol: c.symbol || "",
      label: `${c.code} - ${c.symbol || ""} (${c.name})`,
    }))
    setAcceptedCurrencies(currencyList)
    const savedId = localStorage.getItem("currency")
    const hasSaved = savedId && currencyList.some((c) => c.id === savedId)
    const currencyId = hasSaved ? savedId : settings?.defaultCurrency?.id || currencyList[0]?.id
    if (currencyId) setSelectedCurrencyId(currencyId)
  }, [shopSettings, setAcceptedCurrencies, setSelectedCurrencyId])

  const activeCurrency = acceptedCurrencies.find((c) => c.id === selectedCurrencyId)
  const hasFetched = useRef(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (currentUser) { setIsSessionLoading(false); return }
    if (sessionFetchAttempted.current) return
    sessionFetchAttempted.current = true
    let active = true
    const loadSession = async () => {
      try {
        const r = await fetch("/api/auth/session", { cache: "no-store" })
        if (!r.ok) throw new Error(`${r.status}`)
        const s = await r.json()
        if (s?.user?.email) await fetchUserByEmail(s.user.email)
      } catch (e) { console.error("[NAVBAR] session", e) }
      finally { if (active) setIsSessionLoading(false) }
    }
    loadSession()
    return () => { active = false }
  }, [currentUser, fetchUserByEmail])

  useEffect(() => {
    const loadData = async () => {
      if (hasFetched.current || loading) return
      hasFetched.current = true
      try {
        await Promise.all([
          fetchShopSettings(),
          fetchShippingMethods({ limit: 100 }),
          fetchCategories({ mode: "tree", sortBy: "priority", sortOrder: "desc", limit: 100 }),
          fetchContents({ limit: 100 }),
          fetchCollections({ limit: 100 }),
          fetchCardSections(),
          fetchCoupons({ limit: 100 }),
          fetchPaymentProviders(),
        ])
      } catch (err) {
        console.error("[NAVBAR] fetch", err)
        toast.error("Error de conexión", { description: "No se pudieron cargar los datos de la tienda" })
      }
    }
    loadData()
  }, [fetchShopSettings, fetchShippingMethods, fetchCategories, fetchCollections, fetchContents, fetchCardSections, fetchCoupons, fetchPaymentProviders, loading])

  const handleSignOut = async () => {
    try {
      toast.success("Sesión cerrada", { description: "Has cerrado sesión correctamente" })
      await signOut({ callbackUrl: "/login" })
    } catch (e) { console.error(e); toast.error("Error al cerrar sesión") }
  }

  const getInitials = (name?: string | null) =>
    !name ? "U" : name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)

  const shopName = shopSettings?.[0]?.name ?? "Scentra"
  const totalItems = getItemsCount()
  const totalPrice = getTotal(selectedCurrencyId)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const t = searchTerm.trim()
    if (t.length >= 2) { setSearchTerm(""); window.location.href = `/productos?search=${encodeURIComponent(t)}` }
  }

  const rootCategories = (getCategoriesTree(categories ?? []) as (Category & { children: Category[] })[])
  const featured = (collections || []).filter((c) => c.isFeatured)

  const announcement = "Envío gratis desde S/199 · Fragancias 100% originales · Asesoría olfativa personalizada"

  // ---- Account control (shared desktop) ----
  const AccountControl = () => (
    isSessionLoading ? (
      <Skeleton className="h-9 w-9 rounded-full" />
    ) : currentUser ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser.image || ""} alt={currentUser.name || "Usuario"} />
              <AvatarFallback className="text-xs">{getInitials(currentUser.name)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 z-[999]" align="end" forceMount>
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm font-medium">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground">{currentUser.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link href="/dashboard" className="cursor-pointer"><User className="mr-2 h-4 w-4" />Mi cuenta</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href="/historial" className="cursor-pointer"><ShoppingBag className="mr-2 h-4 w-4" />Mis pedidos</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleSignOut}><X className="mr-2 h-4 w-4" />Cerrar sesión</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
      <Link href="/login" className="flex items-center gap-1.5 text-foreground hover:text-brand transition-colors" aria-label="Ingresar">
        <User className="h-5 w-5" />
        <span className="hidden xl:inline text-[13px]">Ingresar</span>
      </Link>
    )
  )

  if (!mounted) {
    return (
      <header>
        <div className="bg-muted text-center text-[11px] tracking-[0.12em] py-2 text-muted-foreground">{announcement}</div>
        <div className="border-b border-border h-16 flex items-center">
          <div className="container-section w-full"><div className="content-section flex items-center justify-between">
            <Skeleton className="h-5 w-28" /><Skeleton className="h-9 w-1/2 max-w-md rounded-full" /><Skeleton className="h-8 w-24" />
          </div></div>
        </div>
        <div className="h-11 bg-foreground" />
      </header>
    )
  }

  return (
    <>
      <header>
        {/* Tier 1 — announcement (scrolls away) */}
        <div className="bg-muted">
          <p className="container-section py-2 text-center text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.12em] sm:tracking-[0.16em] text-muted-foreground">
            {announcement}
          </p>
        </div>

        {/* Tiers 2 + 3 — sticky */}
        <div className="sticky top-0 z-[180] bg-background shadow-[0_1px_0_0_var(--border)]">
          {/* Tier 2 — main row */}
          <div className="border-b border-border bg-background/95 backdrop-blur-md">
            <div className="container-section">
              <div className="content-section flex h-16 items-center gap-3 sm:gap-5">
                {/* mobile menu */}
                <div className="lg:hidden">
                  <MobileMenu
                    categories={categories ?? []}
                    collections={collections || []}
                    currentUser={currentUser}
                    pathname={pathname}
                    onSignOut={handleSignOut}
                    shopLogo={"/logos/logo2.png"}
                    shopName={shopName}
                  />
                </div>

                {/* logo */}
                <Link href="/" aria-label="Scentra inicio" className="flex flex-shrink-0 items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logos/logo.png" alt={shopName} className="h-4 sm:h-5 w-auto" />
                </Link>

                {/* search (inline, prominent) */}
                <form onSubmit={handleSearch} className="relative hidden flex-1 sm:block">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="¿Qué fragancia buscas?"
                    className="h-11 w-full rounded-full border border-border bg-secondary/60 pl-5 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:bg-background focus:outline-none transition-colors"
                  />
                  <button type="submit" aria-label="Buscar" className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background transition-colors hover:bg-brand hover:text-brand-foreground">
                    <Search className="h-4 w-4" />
                  </button>
                </form>

                {/* utility */}
                <div className="ml-auto flex items-center gap-3 sm:gap-4">
                  <Link href="/nosotros" className="hidden items-center gap-1.5 text-[13px] text-foreground hover:text-brand transition-colors xl:flex">
                    <Sparkles className="h-4 w-4 text-brand" />
                    Asesoría olfativa
                  </Link>

                  {shopSettings?.[0]?.enableWishlist && (
                    <Link href="/dashboard" aria-label="Favoritos" className="hidden text-foreground hover:text-brand transition-colors sm:block">
                      <Heart className="h-5 w-5" />
                    </Link>
                  )}

                  <div className="hidden sm:block"><AccountControl /></div>

                  {/* search icon (mobile) */}
                  <Link href="/productos" aria-label="Buscar" className="text-foreground hover:text-brand sm:hidden">
                    <Search className="h-5 w-5" />
                  </Link>

                  {/* cart */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <button className="relative text-foreground hover:text-brand transition-colors" aria-label="Carrito">
                        <ShoppingBag className="h-5 w-5" />
                        {totalItems > 0 && (
                          <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-foreground">{totalItems}</span>
                        )}
                      </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="flex w-[340px] flex-col bg-background p-5 sm:w-[400px]">
                      <SheetHeader className="border-b border-border pb-3"><SheetTitle className="text-left font-display text-2xl">Tu carrito</SheetTitle></SheetHeader>
                      <div className="scrollbar-thin flex-grow overflow-y-auto py-3">
                        {items.length === 0 ? (
                          <div className="mt-6 flex h-48 flex-col items-center justify-center text-center">
                            <ShoppingBag className="mb-3 h-10 w-10 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">Tu carrito está vacío</p>
                            <SheetClose asChild><Link href="/productos" className="mt-4 border-b border-brand pb-0.5 text-xs uppercase tracking-[0.14em] text-brand">Explorar fragancias</Link></SheetClose>
                          </div>
                        ) : (
                          items.map((item) => {
                            const price = item.variant.prices?.find((p) => p.currency?.id === activeCurrency?.id) || item.variant.prices?.[0]
                            const img = item.variant.imageUrls?.[0] || item.product.imageUrls?.[0] || "/placeholders/product.svg"
                            return (
                              <div key={item.variant.id} className="flex gap-3 border-b border-border py-4">
                                <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden bg-secondary">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={img} alt={item.product.title} className="h-full w-full object-contain p-1.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  {item.product.vendor && <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{item.product.vendor}</p>}
                                  <h4 className="line-clamp-2 text-sm font-medium leading-tight">{item.product.title}</h4>
                                  <p className="mt-0.5 text-xs text-muted-foreground">{item.variant.title}</p>
                                  <div className="mt-2 flex items-center justify-between">
                                    <div className="flex items-center border border-border">
                                      <button className="flex h-7 w-7 items-center justify-center hover:bg-secondary disabled:opacity-40" onClick={() => updateQuantity(item.variant.id, Math.max(1, item.quantity - 1))} disabled={item.quantity <= 1} aria-label="Disminuir"><Minus className="h-3 w-3" /></button>
                                      <span className="w-7 text-center text-xs">{item.quantity}</span>
                                      <button className="flex h-7 w-7 items-center justify-center hover:bg-secondary" onClick={() => updateQuantity(item.variant.id, item.quantity + 1)} aria-label="Aumentar"><Plus className="h-3 w-3" /></button>
                                    </div>
                                    <span className="text-sm font-medium">{price ? formatCurrency(Number(price.price) * item.quantity, activeCurrency) : "—"}</span>
                                  </div>
                                </div>
                                <button className="self-start text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.variant.id)} aria-label="Eliminar"><X className="h-4 w-4" /></button>
                              </div>
                            )
                          })
                        )}
                      </div>
                      {items.length > 0 && (
                        <div className="border-t border-border pt-4">
                          <div className="mb-1 flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold">{formatCurrency(totalPrice, activeCurrency)}</span></div>
                          <p className="mb-4 text-[11px] text-muted-foreground">Envío e impuestos calculados al pagar.</p>
                          <div className="flex flex-col gap-2">
                            <SheetClose asChild><Button asChild className="w-full"><Link href="/checkout">Proceder al pago</Link></Button></SheetClose>
                            <SheetClose asChild><Button asChild variant="outline" className="w-full"><Link href="/cart">Ver carrito</Link></Button></SheetClose>
                          </div>
                        </div>
                      )}
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>
          </div>

          {/* Tier 3 — category bar (dark, desktop) */}
          <nav className="hidden bg-foreground text-background lg:block">
            <div className="container-section">
              <ul className="content-section flex items-center justify-center gap-1">
                <CatLink href="/productos?sort=createdAt" label="Novedades" pathname={pathname} />
                {rootCategories.map((cat) => (
                  <CategoryItem key={cat.id} category={cat} />
                ))}
                {featured.slice(0, 1).map((c) => (
                  <li key={c.id}>
                    <Link href={`/colecciones/${c.slug}`} className="block px-3 py-3 text-[12.5px] uppercase tracking-[0.08em] text-brand transition-colors hover:text-brand-dark">
                      {c.title}
                    </Link>
                  </li>
                ))}
                <CatLink href="/blog" label="Diario" pathname={pathname} />
              </ul>
            </div>
          </nav>
        </div>
      </header>

      {isCookieConsentEnabled && showDialog && (
        <CookieConsentDialog onAccept={acceptAllCookies} onDecline={declineAllCookies} onAcceptSelected={acceptSelectedCookies} />
      )}
    </>
  )
}

function CatLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const base = href.split("?")[0]
  const active = base === "/blog" ? pathname.startsWith("/blog") : false
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "block px-3 py-3 text-[12.5px] uppercase tracking-[0.08em] transition-colors hover:text-background",
          active ? "text-background" : "text-background/70",
        )}
      >
        {label}
      </Link>
    </li>
  )
}

function CategoryItem({ category }: { category: Category & { children: Category[] } }) {
  const hasChildren = category.children && category.children.length > 0
  return (
    <li className="group relative">
      <Link
        href={`/productos?category=${category.slug}`}
        className="flex items-center gap-1 px-3 py-3 text-[12.5px] uppercase tracking-[0.08em] text-background/70 transition-colors hover:text-background"
      >
        {category.name}
        {hasChildren && <ChevronDown className="h-3 w-3 opacity-60 transition-transform group-hover:rotate-180" />}
      </Link>
      {hasChildren && (
        <div className="invisible absolute left-1/2 top-full z-50 min-w-[200px] -translate-x-1/2 border border-border bg-background py-2 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/productos?category=${child.slug}`}
              className="block px-4 py-2 text-[13px] capitalize text-foreground transition-colors hover:bg-secondary hover:text-brand"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </li>
  )
}
