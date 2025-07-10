import { create } from "zustand"
import apiClient from "@/lib/axiosConfig"
import Cookies from "js-cookie"
import type { Product } from "@/types/product"
import type { Category } from "@/types/category"
import type { Collection } from "@/types/collection"
import type { Order } from "@/types/order"
import type { Coupon } from "@/types/coupon"
import type { ShippingMethod } from "@/types/shippingMethod"
import type { ShopSettings } from "@/types/store"
import type { Currency } from "@/types/currency"
import type { ExchangeRate } from "@/types/exchangeRate"
import type { ProductVariant } from "@/types/productVariant"
import type { Content } from "@/types/content"
import type { User } from "@/types/user"
import type { PaymentProvider, PaymentTransaction } from "@/types/payments"
import type { HeroSection } from "@/types/heroSection"
import type { CardSection } from "@/types/card"
import type { TeamMember, TeamSection } from "@/types/team"
import type { FrequentlyBoughtTogether } from "@/types/fbt"

// Definir duración del caché (5 minutos)
const CACHE_DURATION = 5 * 60 * 1000

// Duración del caché para shop settings (10 minutos en milisegundos)
const SHOP_SETTINGS_CACHE_DURATION = 1 * 60 * 1000

// Nombre de la cookie para shop settings
const SHOP_SETTINGS_COOKIE = "shop_settings_cache"
const SHOP_SETTINGS_TIMESTAMP_COOKIE = "shop_settings_timestamp"

// Obtener el storeId del entorno
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID

// Definir la interfaz MainStore
interface MainStore {
  endpoint: string
  categories: Category[]
  products: Product[]
  productVariants: ProductVariant[]
  collections: Collection[]
  orders: Order[]
  couponCode: string
  coupons: Coupon[]
  shippingMethods: ShippingMethod[]
  paymentProviders: PaymentProvider[]
  paymentTransactions: PaymentTransaction[]
  currencies: Currency[]
  exchangeRates: ExchangeRate[]
  contents: Content[]
  heroSections: HeroSection[]
  cardSections: CardSection[]
  teamSections: TeamSection[]
  teamMembers: TeamMember[]
  frequentlyBoughtTogether: FrequentlyBoughtTogether[]
  users: User[]
  shopSettings: ShopSettings[]
  loading: boolean
  error: string | null
  lastFetch: {
    categories: number | null
    products: number | null
    productVariants: number | null
    collections: number | null
    orders: number | null
    customers: number | null
    coupons: number | null
    couponCode:number | null
    shippingMethods: number | null
    paymentProviders: number | null
    contents: number | null
    heroSections: number | null
    cardSections: number | null
    teamMembers: number | null
    frequentlyBoughtTogether: number | null
    users: number | null
    shopSettings: number | null
    currencies: number | null
    exchangeRates: number | null
  }

  setEndpoint: (endpoint: string) => void

  fetchCategories: () => Promise<Category[]>
  fetchProducts: () => Promise<Product[]>
  fetchProductVariants: () => Promise<ProductVariant[]>
  fetchCollections: () => Promise<Collection[]>
  fetchHeroSections: () => Promise<HeroSection[]>
  fetchCardSections: () => Promise<CardSection[]>
  fetchTeamSections: () => Promise<TeamSection[]>
  fetchTeamMembers: (teamSectionId: string) => Promise<TeamMember[]>
  fetchOrders: () => Promise<Order[]>
  fetchCoupons: () => Promise<Coupon[]>
  setCouponCode: (code: string) => Promise<void>
  clearCoupon: () =>  Promise<void>
  fetchShippingMethods: () => Promise<ShippingMethod[]>
  fetchPaymentProviders: () => Promise<PaymentProvider[]>
  fetchPaymentTransactions: () => Promise<PaymentTransaction[]>
  fetchContents: () => Promise<Content[]>
  fetchUsers: () => Promise<User[]>
  fetchShopSettings: () => Promise<ShopSettings>
  fetchCurrencies: () => Promise<Currency[]>
  fetchExchangeRates: () => Promise<ExchangeRate[]>
  fetchFrequentlyBoughtTogether: () => Promise<FrequentlyBoughtTogether[]>

  // Métodos adicionales para FBT
  fetchFrequentlyBoughtTogetherById: (id: string) => Promise<FrequentlyBoughtTogether>
  createFrequentlyBoughtTogether: (data: any) => Promise<FrequentlyBoughtTogether>
  updateFrequentlyBoughtTogether: (id: string, data: any) => Promise<FrequentlyBoughtTogether>
  deleteFrequentlyBoughtTogether: (id: string) => Promise<void>

  // Mantener solo los métodos de creación y actualización para orders y refunds
  createOrder: (data: any) => Promise<Order>
  updateOrder: (id: string, data: any) => Promise<Order>
  createRefund: (data: any) => Promise<void>

  submitFormEmail: (formData: any) => Promise<void>
  sendEmail: (to: string, subject: string, html: string) => Promise<void>
  initializeStore: () => Promise<void>

  refreshData: () => Promise<void>
  getCategoryById: (id: string) => Category | undefined
  getProductById: (id: string) => Product | undefined
  getCollectionById: (id: string) => Collection | undefined
  getOrderById: (id: string) => Order | undefined
  getCouponById: (id: string) => Coupon | undefined
  getCurrencyById: (id: string) => Currency | undefined
  getExchangeRateById: (id: string) => ExchangeRate | undefined
  getFrequentlyBoughtTogetherById: (id: string) => FrequentlyBoughtTogether | undefined
}

export const useMainStore = create<MainStore>((set, get) => ({
  endpoint: "",
  categories: [],
  products: [],
  productVariants: [],
  collections: [],
  orders: [],
  customers: [],
  heroSections: [],
  cardSections: [],
  teamSections: [],
  teamMembers: [],
  coupons: [],
  couponCode: "",
  shippingMethods: [],
  contents: [],
  users: [],
  shopSettings: [],
  currencies: [],
  exchangeRates: [],
  paymentProviders: [],
  paymentTransactions: [],
  frequentlyBoughtTogether: [],
  loading: false,
  error: null,
  lastFetch: {
    categories: null,
    products: null,
    productVariants: null,
    collections: null,
    orders: null,
    customers: null,
    heroSections: null,
    cardSections: null,
    teamMembers: null,
    coupons: null,
    couponCode: null,
    shippingMethods: null,
    paymentProviders: null,
    contents: null,
    users: null,
    shopSettings: null,
    currencies: null,
    exchangeRates: null,
    frequentlyBoughtTogether: null,
  },

  setEndpoint: (endpoint) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("endpoint", endpoint)
    }
    set({ endpoint })
  },

  // Método fetchCategories mejorado con caché
  fetchCategories: async () => {
    const { categories, lastFetch } = get()
    const now = Date.now()

    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    // Verificar si hay categorías en caché y si el caché aún es válido
    if (categories.length > 0 && lastFetch.categories && now - lastFetch.categories < CACHE_DURATION) {
      return categories
    }

    set({ loading: true, error: null })
    try {
      const response = await apiClient.get<Category[]>(`/categories?storeId=${STORE_ID}`)
      set({
        categories: response.data,
        loading: false,
        lastFetch: { ...get().lastFetch, categories: now },
      })
      return response.data
    } catch (error) {
      set({ error: "Failed to fetch categories", loading: false })
      throw error
    }
  },

  // Método fetchProducts mejorado con caché
  fetchProducts: async () => {
    const { products, lastFetch } = get()
    const now = Date.now()

    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    // Verificar si hay productos en caché y si el caché aún es válido
    if (products.length > 0 && lastFetch.products && now - lastFetch.products < CACHE_DURATION) {
      return products
    }

    set({ loading: true, error: null })
    try {
      const response = await apiClient.get<Product[]>(`/products/store/${STORE_ID}`)
      set({
        products: response.data,
        loading: false,
        lastFetch: { ...get().lastFetch, products: now },
      })
      return response.data
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false })
      throw error
    }
  },

  // Método fetchProductVariants mejorado con caché
  fetchProductVariants: async () => {
    const { productVariants, lastFetch } = get()
    const now = Date.now()

    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    // Verificar si hay datos en caché y si el caché aún es válido
    if (productVariants.length > 0 && lastFetch.productVariants && now - lastFetch.productVariants < CACHE_DURATION) {
      return productVariants
    }

    set({ loading: true, error: null })
    try {
      const response = await apiClient.get<ProductVariant[]>(`/product-variants/store/${STORE_ID}`)
      set({
        productVariants: response.data,
        loading: false,
        lastFetch: { ...get().lastFetch, productVariants: now },
      })
      return response.data
    } catch (error) {
      set({ error: "Failed to fetch product variants", loading: false })
      throw error
    }
  },

  // Método fetchCollections mejorado con caché
  fetchCollections: async () => {
    const { collections, lastFetch } = get()
    const now = Date.now()

    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    // Verificar si hay colecciones en caché y si el caché aún es válido
    if (collections.length > 0 && lastFetch.collections && now - lastFetch.collections < CACHE_DURATION) {
      return collections
    }

    set({ loading: true, error: null })
    try {
      const response = await apiClient.get<Collection[]>(`/categories?storeId=${STORE_ID}`)
      set({
        collections: response.data,
        loading: false,
        lastFetch: { ...get().lastFetch, collections: now },
      })
      return response.data
    } catch (error) {
      set({ error: "Failed to fetch collections", loading: false })
      throw error
    }
  },

  // Método fetchHeroSections mejorado con caché
  fetchHeroSections: async () => {
    const { heroSections, lastFetch } = get()
    const now = Date.now()

    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    // Verificar si hay secciones de héroe en caché y si el caché aún es válido
    if (heroSections.length > 0 && lastFetch.heroSections && now - lastFetch.heroSections < CACHE_DURATION) {
      return heroSections
    }

    set({ loading: true, error: null })
    try {
      const response = await apiClient.get<HeroSection[]>(`/hero-sections?storeId=${STORE_ID}`)
      set({
        heroSections: response.data,
        loading: false,
        lastFetch: { ...get().lastFetch, heroSections: now },
      })
      return response.data
    } catch (error) {
      set({ error: "Failed to fetch hero sections", loading: false })
      throw error
    }
  },

  // Método fetchCardSections mejorado con caché
  fetchCardSections: async () => {
    const { cardSections, lastFetch } = get()
    const now = Date.now()

    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    // Verificar si hay secciones de tarjetas en caché y si el caché aún es válido
    if (cardSections.length > 0 && lastFetch.cardSections && now - lastFetch.cardSections < CACHE_DURATION) {
      return cardSections
    }

    set({ loading: true, error: null })
    try {
      const response = await apiClient.get<CardSection[]>(`/card-section/store/${STORE_ID}`)
      set({
        cardSections: response.data,
        loading: false,
        lastFetch: { ...get().lastFetch, cardSections: now },
      })
      return response.data
    } catch (error) {
      set({ error: "Failed to fetch card sections", loading: false })
      throw error
    }
  },

  // Método fetchTeamSections mejorado con caché
  fetchTeamSections: async () => {
    const { teamSections, lastFetch } = get()
    const now = Date.now()

    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    // Verificar si hay secciones de equipo en caché y si el caché aún es válido
    if (teamSections.length > 0 && lastFetch.teamMembers && now - lastFetch.teamMembers < CACHE_DURATION) {
      return teamSections
    }

    set({ loading: true, error: null })
    try {
      const response = await apiClient.get<TeamSection[]>(`/team-sections/store/${STORE_ID}`)
      set({
        teamSections: response.data,
        loading: false,
        lastFetch: { ...get().lastFetch, teamMembers: now },
      })
      return response.data
    } catch (error) {
      set({ error: "Failed to fetch team sections", loading: false })
      throw error
    }
  },

  // Método fetchTeamMembers mejorado con caché
  fetchTeamMembers: async (teamSectionId: string) => {
    const { teamMembers, lastFetch } = get()
    const now = Date.now()

    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    // Verificar si hay datos en caché para esta sección de equipo y si el caché aún es válido
    if (
      teamMembers.length > 0 &&
      teamMembers[0]?.teamSectionId === teamSectionId &&
      lastFetch.teamMembers &&
      now - lastFetch.teamMembers < CACHE_DURATION
    ) {
      return teamMembers
    }

    set({ loading: true, error: null })
    try {
      const response = await apiClient.get<TeamMember[]>(
        `/team-members?teamSectionId=${teamSectionId}&storeId=${STORE_ID}`,
      )
      set({
        teamMembers: response.data,
        loading: false,
        lastFetch: { ...get().lastFetch, teamMembers: now },
      })
      return response.data
    } catch (error) {
      set({ error: "Failed to fetch team members", loading: false })
      throw error
    }
  },

  // Método fetchOrders mejorado con caché
  fetchOrders: async () => {
    const { orders, lastFetch } = get()
    const now = Date.now()

    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    // Verificar si hay órdenes en caché y si el caché aún es válido
    if (orders.length > 0 && lastFetch.orders && now - lastFetch.orders < CACHE_DURATION) {
      return orders
    }

    set({ loading: true, error: null })
    try {
      const response = await apiClient.get<Order[]>(`/orders/store/${STORE_ID}`)
      set({
        orders: response.data,
        loading: false,
        lastFetch: { ...get().lastFetch, orders: now },
      })
      return response.data
    } catch (error) {
      set({ error: "Failed to fetch orders", loading: false })
      throw error
    }
  },

  // Método fetchCoupons mejorado con caché
  fetchCoupons: async () => {
    const { coupons, lastFetch } = get()
    const now = Date.now()

    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    // Verificar si hay cupones en caché y si el caché aún es válido
    if (coupons.length > 0 && lastFetch.coupons && now - lastFetch.coupons < CACHE_DURATION) {
      return coupons
    }

    set({ loading: true, error: null })
    try {
      const response = await apiClient.get<Coupon[]>(`/coupons?storeId=${STORE_ID}`)
      set({
        coupons: response.data,
        loading: false,
        lastFetch: { ...get().lastFetch, coupons: now },
      })
      return response.data
    } catch (error) {
      set({ error: "Failed to fetch coupons", loading: false })
      throw error
    }
  },

  setCouponCode: async (code: string) => set({ couponCode: code }),
  clearCoupon: async () => set({ couponCode: "" }),

  // Método fetchShippingMethods mejorado con caché
  fetchShippingMethods: async () => {
    const { shippingMethods, lastFetch } = get()
    const now = Date.now()

    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    // Verificar si hay métodos de envío en caché y si el caché aún es válido
    if (shippingMethods.length > 0 && lastFetch.shippingMethods && now - lastFetch.shippingMethods < CACHE_DURATION) {
      return shippingMethods
    }

    set({ loading: true, error: null })
    try {
      const response = await apiClient.get<ShippingMethod[]>(`/shipping-methods/store/${STORE_ID}`)
      set({
        shippingMethods: response.data,
        loading: false,
        lastFetch: { ...get().lastFetch, shippingMethods: now },
      })
      return response.data
    } catch (error) {
      set({ error: "Failed to fetch shipping methods", loading: false })
      throw error
    }
  },

  // Método fetchPaymentProviders mejorado con caché
  fetchPaymentProviders: async () => {
    const { paymentProviders, lastFetch } = get()
    const now = Date.now()

    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    // Verificar si hay datos en caché y si el caché aún es válido
    if (
      paymentProviders.length > 0 &&
      lastFetch.paymentProviders &&
      now - lastFetch.paymentProviders < CACHE_DURATION
    ) {
      return paymentProviders
    }

    set({ loading: true, error: null })
    try {
      const response = await apiClient.get<PaymentProvider[]>(`/payment-providers/store/${STORE_ID}`)
      set({
        paymentProviders: response.data,
        loading: false,
        lastFetch: { ...get().lastFetch, paymentProviders: now },
      })
      return response.data
    } catch (error) {
      set({ error: "Failed to fetch payment providers", loading: false })
      throw error
    }
  },

  // Método fetchPaymentTransactions mejorado con caché
  fetchPaymentTransactions: async () => {
    const { paymentTransactions, lastFetch } = get()
    const now = Date.now()

    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    // No hay un campo específico para lastFetch.paymentTransactions, así que usamos paymentProviders como referencia
    if (
      paymentTransactions.length > 0 &&
      lastFetch.paymentProviders &&
      now - lastFetch.paymentProviders < CACHE_DURATION
    ) {
      return paymentTransactions
    }

    set({ loading: true, error: null })
    try {
      const response = await apiClient.get<PaymentTransaction[]>(`/payment-transactions/store/${STORE_ID}`)
      set({
        paymentTransactions: response.data,
        loading: false,
        lastFetch: { ...get().lastFetch, paymentProviders: now }, // Actualizamos usando el mismo campo
      })
      return response.data
    } catch (error) {
      set({ error: "Failed to fetch payment transactions", loading: false })
      throw error
    }
  },

  // Método fetchContents mejorado con caché
  fetchContents: async () => {
    const { contents, lastFetch } = get()
    const now = Date.now()

    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    // Verificar si hay contenidos en caché y si el caché aún es válido
    if (contents.length > 0 && lastFetch.contents && now - lastFetch.contents < CACHE_DURATION) {
      return contents
    }

    set({ loading: true, error: null })
    try {
      const response = await apiClient.get<Content[]>(`/contents?store=${STORE_ID}`)
      set({
        contents: response.data,
        loading: false,
        lastFetch: { ...get().lastFetch, contents: now },
      })
      return response.data
    } catch (error) {
      set({ error: "Failed to fetch contents", loading: false })
      throw error
    }
  },

  // Método fetchUsers
  fetchUsers: async () => {
    set({ loading: true, error: null })
    try {
      if (!STORE_ID) {
        throw new Error("No store ID provided in environment variables")
      }

      const response = await apiClient.get<User[]>(`/auth/store/${STORE_ID}`)
      set({
        users: response.data,
        loading: false,
        lastFetch: { ...get().lastFetch, users: Date.now() },
      })
      return response.data
    } catch (error) {
      set({ error: "Failed to fetch users", loading: false })
      throw error
    }
  },

  // Método fetchShopSettings mejorado con caché en cookies
  fetchShopSettings: async () => {
    console.log("[STORE] Iniciando fetchShopSettings")

    // Verificar si estamos en el cliente
    if (typeof window === "undefined") {
      console.log("[STORE] Ejecutando en el servidor, no se pueden usar cookies")
      set({ loading: true, error: null })
      try {
        if (!STORE_ID) {
          throw new Error("No store ID provided in environment variables")
        }

        const response = await apiClient.get<ShopSettings>(`/shop-settings/store/${STORE_ID}`)
        set({
          shopSettings: [response.data],
          loading: false,
          lastFetch: { ...get().lastFetch, shopSettings: Date.now() },
        })
        return response.data
      } catch (error) {
        set({ error: "Failed to fetch shop settings", loading: false })
        throw error
      }
    }

    // Estamos en el cliente, podemos usar cookies
    const now = Date.now()

    // Verificar si hay datos en la cookie y si aún son válidos
    const cachedTimestampStr = Cookies.get(SHOP_SETTINGS_TIMESTAMP_COOKIE)
    const cachedDataStr = Cookies.get(SHOP_SETTINGS_COOKIE)

    if (cachedTimestampStr && cachedDataStr) {
      const cachedTimestamp = Number.parseInt(cachedTimestampStr, 10)

      // Verificar si la caché aún es válida (menos de 10 minutos)
      if (now - cachedTimestamp < SHOP_SETTINGS_CACHE_DURATION) {
        console.log("[STORE] Usando datos de shop settings desde cookies (caché válida)")
        try {
          const cachedData = JSON.parse(cachedDataStr)
          set({
            shopSettings: [cachedData],
            loading: false,
            lastFetch: { ...get().lastFetch, shopSettings: cachedTimestamp },
          })
          return cachedData
        } catch (e) {
          console.error("[STORE] Error al parsear datos de la cookie:", e)
          // Si hay un error al parsear, continuamos con la solicitud normal
        }
      } else {
        console.log("[STORE] Caché de shop settings expirada, solicitando nuevos datos")
      }
    } else {
      console.log("[STORE] No se encontraron datos en caché para shop settings")
    }

    // Si no hay caché válida, hacemos la solicitud
    set({ loading: true, error: null })
    try {
      if (!STORE_ID) {
        throw new Error("No store ID provided in environment variables")
      }

      console.log("[STORE] Realizando fetch de shop settings")
      const response = await apiClient.get<ShopSettings>(`/shop-settings/store/${STORE_ID}`)

      // Guardar en el store
      set({
        shopSettings: [response.data],
        loading: false,
        lastFetch: { ...get().lastFetch, shopSettings: now },
      })

      // Guardar en cookies con expiración de 10 minutos
      try {
        Cookies.set(SHOP_SETTINGS_COOKIE, JSON.stringify(response.data), { expires: 1 / 144 }) // 1/144 de un día = 10 minutos
        Cookies.set(SHOP_SETTINGS_TIMESTAMP_COOKIE, now.toString(), { expires: 1 / 144 })
        console.log("[STORE] Shop settings guardados en cookies")
      } catch (e) {
        console.error("[STORE] Error al guardar en cookies:", e)
        // Continuamos aunque haya error al guardar en cookies
      }

      return response.data
    } catch (error) {
      console.error("[STORE] Error al obtener shop settings:", error)
      set({ error: "Failed to fetch shop settings", loading: false })
      throw error
    }
  },

  // Método fetchCurrencies
  fetchCurrencies: async () => {
    const { currencies, lastFetch } = get()
    const now = Date.now()

    // Verificar si hay datos en caché y si el caché aún es válido
    if (currencies.length > 0 && lastFetch.currencies && now - lastFetch.currencies < CACHE_DURATION) {
      return currencies
    }

    set({ loading: true, error: null })
    try {
      // Nota: Las monedas generalmente son globales, pero podemos filtrar por las aceptadas por la tienda
      const response = await apiClient.get<Currency[]>(`/currencies`)
      set({
        currencies: response.data,
        loading: false,
        lastFetch: { ...get().lastFetch, currencies: now },
      })
      return response.data
    } catch (error) {
      set({ error: "Failed to fetch currencies", loading: false })
      throw error
    }
  },

  // Método fetchExchangeRates
  fetchExchangeRates: async () => {
    const { exchangeRates, lastFetch } = get()
    const now = Date.now()

    // Verificar si hay datos en caché y si el caché aún es válido
    if (exchangeRates.length > 0 && lastFetch.exchangeRates && now - lastFetch.exchangeRates < CACHE_DURATION) {
      return exchangeRates
    }

    set({ loading: true, error: null })
    try {
      // Nota: Las tasas de cambio generalmente son globales
      const response = await apiClient.get<ExchangeRate[]>(`/exchange-rates`)
      set({
        exchangeRates: response.data,
        loading: false,
        lastFetch: { ...get().lastFetch, exchangeRates: now },
      })
      return response.data
    } catch (error) {
      set({ error: "Failed to fetch exchange rates", loading: false })
      throw error
    }
  },

  // Método fetchFrequentlyBoughtTogether implementado correctamente para incluir el filtro por tienda
  fetchFrequentlyBoughtTogether: async () => {
    const { frequentlyBoughtTogether, lastFetch } = get()
    const now = Date.now()

    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    // Verificar si hay datos en caché y si el caché aún es válido
    if (
      frequentlyBoughtTogether.length > 0 &&
      lastFetch.frequentlyBoughtTogether &&
      now - lastFetch.frequentlyBoughtTogether < CACHE_DURATION
    ) {
      return frequentlyBoughtTogether
    }

    set({ loading: true, error: null })
    try {
      const response = await apiClient.get<FrequentlyBoughtTogether[]>(`/frequently-bought-together/store/${STORE_ID}`)
      set({
        frequentlyBoughtTogether: response.data,
        loading: false,
        lastFetch: { ...get().lastFetch, frequentlyBoughtTogether: now },
      })
      return response.data
    } catch (error) {
      set({ error: "Failed to fetch frequently bought together items", loading: false })
      throw error
    }
  },

  // Método para obtener un FBT específico por ID
  fetchFrequentlyBoughtTogetherById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const response = await apiClient.get<FrequentlyBoughtTogether>(`/frequently-bought-together/${id}`)
      set({ loading: false })
      return response.data
    } catch (error) {
      set({ error: "Failed to fetch frequently bought together item", loading: false })
      throw error
    }
  },

  // Método para crear un nuevo FBT
  createFrequentlyBoughtTogether: async (data: any) => {
    set({ loading: true, error: null })
    try {
      if (!STORE_ID) {
        throw new Error("No store ID provided in environment variables")
      }

      // Asegurarse de que el storeId esté incluido en los datos
      const fbtData = {
        ...data,
        storeId: data.storeId || STORE_ID,
      }

      const response = await apiClient.post<FrequentlyBoughtTogether>("/frequently-bought-together", fbtData)
      set((state) => ({
        frequentlyBoughtTogether: [...state.frequentlyBoughtTogether, response.data],
        loading: false,
      }))
      return response.data
    } catch (error) {
      set({ error: "Failed to create frequently bought together item", loading: false })
      throw error
    }
  },

  // Método para actualizar un FBT existente
  updateFrequentlyBoughtTogether: async (id: string, data: any) => {
    set({ loading: true, error: null })
    try {
      const response = await apiClient.patch<FrequentlyBoughtTogether>(`/frequently-bought-together/${id}`, data)
      set((state) => ({
        frequentlyBoughtTogether: state.frequentlyBoughtTogether.map((item) =>
          item.id === id ? { ...item, ...response.data } : item,
        ),
        loading: false,
      }))
      return response.data
    } catch (error) {
      set({ error: "Failed to update frequently bought together item", loading: false })
      throw error
    }
  },

  // Método para eliminar un FBT
  deleteFrequentlyBoughtTogether: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await apiClient.delete(`/frequently-bought-together/${id}`)
      set((state) => ({
        frequentlyBoughtTogether: state.frequentlyBoughtTogether.filter((item) => item.id !== id),
        loading: false,
      }))
    } catch (error) {
      set({ error: "Failed to delete frequently bought together item", loading: false })
      throw error
    }
  },

  // Mantener solo los métodos de creación y actualización para orders y refunds
  createOrder: async (data: any) => {
    set({ loading: true, error: null })
    try {
      if (!STORE_ID) {
        throw new Error("No store ID provided in environment variables")
      }

      // Asegurarse de que el storeId esté incluido en los datos
      const orderData = {
        ...data,
        storeId: STORE_ID,
      }

      const response = await apiClient.post<Order>("/orders", orderData)
      set((state) => ({
        orders: [...state.orders, response.data],
        loading: false,
      }))
      return response.data
    } catch (error) {
      set({ error: "Failed to create order", loading: false })
      throw error
    }
  },

  updateOrder: async (id: string, data: any) => {
    set({ loading: true, error: null })
    try {
      const response = await apiClient.put<Order>(`/orders/${id}`, data)
      set((state) => ({
        orders: state.orders.map((order) => (order.id === id ? { ...order, ...response.data } : order)),
        loading: false,
      }))
      return response.data
    } catch (error) {
      set({ error: "Failed to update order", loading: false })
      throw error
    }
  },

  createRefund: async (data: any) => {
    set({ loading: true, error: null })
    try {
      await apiClient.post("/refunds", data)
      set({ loading: false })
    } catch (error) {
      set({ error: "Failed to create refund", loading: false })
      throw error
    }
  },

  sendEmail: async (to, subject, html) => {
    try {
      const response = await apiClient.post("/email/send", {
        to,
        subject,
        html,
      })
      return response.data
    } catch (error) {
      console.error("Error sending email:", error)
      throw error
    }
  },
  submitFormEmail: async (formData) => {
    try {
      const response = await apiClient.post("/email/submit-form", formData)
      return response.data
    } catch (error) {
      console.error("Error submitting form email:", error)
      throw error
    }
  },

  // Utility functions
  refreshData: async () => {
    set({ loading: true, error: null })
    try {
      if (!STORE_ID) {
        throw new Error("No store ID provided in environment variables")
      }

      const [
        categoriesResponse,
        productsResponse,
        productVariantsResponse,
        collectionsResponse,
        ordersResponse,
        customersResponse,
        couponsResponse,
        shippingMethodsResponse,
        paymentProvidersResponse,
        contentsResponse,
        usersResponse,
        shopSettingsResponse,
        currenciesResponse,
        exchangeRatesResponse,
        heroSectionsResponse,
        cardSectionsResponse,
        teamSectionsResponse,
        frequentlyBoughtTogetherResponse,
      ] = await Promise.all([
        apiClient.get(`/categories/store/${STORE_ID}`),
        apiClient.get(`/products/store/${STORE_ID}`),
        apiClient.get(`/product-variants/store/${STORE_ID}`),
        apiClient.get(`/collections/store/${STORE_ID}`),
        apiClient.get(`/orders/store/${STORE_ID}`),
        apiClient.get(`/customers/store/${STORE_ID}`),
        apiClient.get(`/coupons/store/${STORE_ID}`),
        apiClient.get(`/shipping-methods/store/${STORE_ID}`),
        apiClient.get(`/payment-providers/store/${STORE_ID}`),
        apiClient.get(`/contents/store/${STORE_ID}`),
        apiClient.get(`/auth/store/${STORE_ID}`),
        apiClient.get(`/shop-settings/store/${STORE_ID}`),
        apiClient.get(`/currencies`),
        apiClient.get(`/exchange-rates`),
        apiClient.get(`/hero-sections/store/${STORE_ID}`),
        apiClient.get(`/card-section/store/${STORE_ID}`),
        apiClient.get(`/team-sections/store/${STORE_ID}`),
        apiClient.get(`/frequently-bought-together/store/${STORE_ID}`),
      ])

      const now = Date.now()
      set({
        categories: categoriesResponse.data,
        products: productsResponse.data,
        productVariants: productVariantsResponse.data,
        collections: collectionsResponse.data,
        heroSections: heroSectionsResponse.data,
        cardSections: cardSectionsResponse.data,
        teamSections: teamSectionsResponse.data,
        orders: ordersResponse.data,
        coupons: couponsResponse.data,
        shippingMethods: shippingMethodsResponse.data,
        paymentProviders: paymentProvidersResponse.data,
        contents: contentsResponse.data,
        users: usersResponse.data,
        shopSettings: Array.isArray(shopSettingsResponse.data)
          ? shopSettingsResponse.data
          : [shopSettingsResponse.data],
        currencies: currenciesResponse.data,
        exchangeRates: exchangeRatesResponse.data,
        frequentlyBoughtTogether: frequentlyBoughtTogetherResponse.data,
        loading: false,
        lastFetch: {
          categories: now,
          products: now,
          productVariants: now,
          collections: now,
          orders: now,
          customers: now,
          coupons: now,
          couponCode:now,
          heroSections: now,
          cardSections: now,
          teamMembers: now,
          shippingMethods: now,
          paymentProviders: now,
          contents: now,
          users: now,
          shopSettings: now,
          currencies: now,
          exchangeRates: now,
          frequentlyBoughtTogether: now,
        },
      })

      // Actualizar también la cookie de shop settings
      if (typeof window !== "undefined") {
        try {
          const shopSettingsData = Array.isArray(shopSettingsResponse.data)
            ? shopSettingsResponse.data[0]
            : shopSettingsResponse.data

          Cookies.set(SHOP_SETTINGS_COOKIE, JSON.stringify(shopSettingsData), { expires: 1 / 144 }) // 10 minutos
          Cookies.set(SHOP_SETTINGS_TIMESTAMP_COOKIE, now.toString(), { expires: 1 / 144 })
          console.log("[STORE] Shop settings actualizados en cookies durante refreshData")
        } catch (e) {
          console.error("[STORE] Error al actualizar cookies en refreshData:", e)
        }
      }
    } catch (error) {
      set({ error: "Failed to refresh data", loading: false })
      throw error
    }
  },

  getCategoryById: (id) => {
    const category = get().categories.find((category) => category.id === id)
    if (category) {
      return {
        ...category,
        parent: category.parentId ? get().categories.find((c) => c.id === category.parentId) : undefined,
        children: get().categories.filter((c) => c.parentId === category.id),
      }
    }
    return undefined
  },

  getProductById: (id) => {
    return get().products.find((product) => product.id === id)
  },

  getCollectionById: (id) => {
    return get().collections.find((collection) => collection.id === id)
  },

  getOrderById: (id) => {
    return get().orders.find((order) => order.id === id)
  },

  getCouponById: (id) => {
    return get().coupons.find((coupon) => coupon.id === id)
  },

  getCurrencyById: (id) => {
    return get().currencies.find((currency) => currency.id === id)
  },

  getExchangeRateById: (id) => {
    return get().exchangeRates.find((exchangeRate) => exchangeRate.id === id)
  },

  getFrequentlyBoughtTogetherById: (id) => {
    return get().frequentlyBoughtTogether.find((fbt) => fbt.id === id)
  },

  initializeStore: async () => {
    // if (get().products.length > 0 && get().shopSettings.length > 0) return;

    set({ loading: true })
    try {
      await Promise.all([
        get().fetchProducts(),
        get().fetchShopSettings(),
        get().fetchShippingMethods(),
        get().fetchCategories(),
        get().fetchCollections(),
        get().fetchPaymentProviders(),
        get().fetchFrequentlyBoughtTogether(), // Añadido para cargar FBT al inicializar
      ])
    } finally {
      set({ loading: false })
    }
  },
}))
