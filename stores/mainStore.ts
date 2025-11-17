import { create } from "zustand"
import apiClient from "@/lib/axiosConfig"
import { extractApiData, extractPaginatedData } from "@/lib/apiHelpers"
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
import type { HeroSection, CreateHeroSectionDto, UpdateHeroSectionDto } from "@/types/heroSection"
import type { CardSection, CreateCardSectionDto, UpdateCardSectionDto } from "@/types/card"
import type { TeamMember, TeamSection, CreateTeamSectionDto, UpdateTeamSectionDto } from "@/types/team"
import type { FrequentlyBoughtTogether, CreateFrequentlyBoughtTogetherDto, UpdateFrequentlyBoughtTogetherDto } from "@/types/fbt"
import type { CreateCollectionDto, UpdateCollectionDto } from "@/types/collection"
import type { 
  PaginatedResponse, 
  PaginationMeta,
  SearchCategoryParams, 
  SearchProductParams,
  SearchOrderParams,
  SearchCouponParams,
  SearchContentParams,
  SearchCollectionParams,
  SearchCurrencyParams,
  SearchExchangeRateParams,
  SearchHeroSectionParams,
  SearchFbtParams,
  SearchShippingMethodParams,
  SearchPaymentTransactionParams
} from "@/types/pagination"

// Obtener el storeId del entorno
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID
const debugLog =
  process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS === "true"
    ? console.log.bind(console)
    : () => {}

// Helper function para construir query params
const buildQueryParams = (params: any = {}) => {
  debugLog("🔧 [buildQueryParams] Input params:", params)
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    // Validar que el valor no sea undefined, null, o string vacío/con solo espacios
    const isValidValue = value !== undefined && 
                        value !== null && 
                        (typeof value !== 'string' || value.trim() !== '')
    
    if (isValidValue) {
      // Manejar arrays
      if (Array.isArray(value)) {
        if (value.length > 0) {
          // Para categorySlugs y collectionIds: usar formato de comas
          if (['categorySlugs', 'collectionIds'].includes(key)) {
            const joinedValue = value.join(',')
            debugLog(`🔧 [buildQueryParams] Adding array param (comma format): ${key} = ${joinedValue}`)
            queryParams.append(key, joinedValue)
          } else {
            // Para status y otros arrays: enviar múltiples valores con el mismo nombre
            value.forEach((item) => {
              debugLog(`🔧 [buildQueryParams] Adding array param (multiple values): ${key} = ${item}`)
              queryParams.append(key, String(item))
            })
          }
        }
      } else {
        // Para strings, usar trim() antes de agregar
        const stringValue = typeof value === 'string' ? value.trim() : String(value)
        debugLog(`🔧 [buildQueryParams] Adding param: ${key} = ${stringValue}`)
        queryParams.append(key, stringValue)
      }
    } else {
      debugLog(`🔧 [buildQueryParams] Skipping param: ${key} (value is undefined/null/empty)`)
    }
  })
  
  const result = queryParams.toString()
  debugLog("🔧 [buildQueryParams] Final query string:", result)
  return result
}

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
  
  // Metadata de paginación para cada recurso
  paginationMeta: {
    categories: PaginationMeta | null
    products: PaginationMeta | null
    productVariants: PaginationMeta | null
    collections: PaginationMeta | null
    orders: PaginationMeta | null
    coupons: PaginationMeta | null
    shippingMethods: PaginationMeta | null
    paymentTransactions: PaginationMeta | null
    currencies: PaginationMeta | null
    exchangeRates: PaginationMeta | null
    contents: PaginationMeta | null
    heroSections: PaginationMeta | null
    frequentlyBoughtTogether: PaginationMeta | null
    users: PaginationMeta | null
  }

  setEndpoint: (endpoint: string) => void

  // Métodos actualizados con paginación
  fetchCategories: (params?: SearchCategoryParams, forceRefresh?: boolean) => Promise<PaginatedResponse<Category>>
  fetchProducts: (params?: SearchProductParams, forceRefresh?: boolean) => Promise<PaginatedResponse<Product>>
  fetchProductVariants: (params?: SearchProductParams, forceRefresh?: boolean) => Promise<PaginatedResponse<ProductVariant>>
  fetchCollections: (params?: SearchCollectionParams, forceRefresh?: boolean) => Promise<PaginatedResponse<Collection>>
  fetchHeroSections: (params?: SearchHeroSectionParams, forceRefresh?: boolean) => Promise<PaginatedResponse<HeroSection>>
  fetchCardSections: () => Promise<CardSection[]>
  fetchTeamSections: () => Promise<TeamSection[]>
  fetchTeamMembers: (teamSectionId: string) => Promise<TeamMember[]>
  fetchOrders: (params?: SearchOrderParams, forceRefresh?: boolean) => Promise<PaginatedResponse<Order>>
  fetchAllOrders: (params?: SearchOrderParams) => Promise<PaginatedResponse<Order>>
  fetchCoupons: (params?: SearchCouponParams, forceRefresh?: boolean) => Promise<PaginatedResponse<Coupon>>
  setCouponCode: (code: string) => Promise<void>
  clearCoupon: () =>  Promise<void>
  fetchShippingMethods: (params?: SearchShippingMethodParams, forceRefresh?: boolean) => Promise<PaginatedResponse<ShippingMethod>>
  fetchPaymentProviders: () => Promise<PaymentProvider[]>
  fetchPaymentTransactions: (params?: SearchPaymentTransactionParams, forceRefresh?: boolean) => Promise<PaginatedResponse<PaymentTransaction>>
  fetchContents: (params?: SearchContentParams, forceRefresh?: boolean) => Promise<PaginatedResponse<Content>>
  fetchUsers: () => Promise<User[]>
  fetchShopSettings: () => Promise<ShopSettings>
  fetchCurrencies: (params?: SearchCurrencyParams, forceRefresh?: boolean) => Promise<PaginatedResponse<Currency>>
  fetchExchangeRates: (params?: SearchExchangeRateParams, forceRefresh?: boolean) => Promise<PaginatedResponse<ExchangeRate>>
  fetchFrequentlyBoughtTogether: (params?: SearchFbtParams, forceRefresh?: boolean) => Promise<PaginatedResponse<FrequentlyBoughtTogether>>

  // Métodos adicionales para FBT
  fetchFrequentlyBoughtTogetherById: (id: string) => Promise<FrequentlyBoughtTogether>
  createFrequentlyBoughtTogether: (data: CreateFrequentlyBoughtTogetherDto) => Promise<FrequentlyBoughtTogether>
  updateFrequentlyBoughtTogether: (id: string, data: UpdateFrequentlyBoughtTogetherDto) => Promise<FrequentlyBoughtTogether>
  deleteFrequentlyBoughtTogether: (id: string) => Promise<void>

  // Mantener solo los métodos de creación y actualización para orders y refunds
  createOrder: (data: any) => Promise<Order>
  updateOrder: (id: string, data: any) => Promise<Order>
  createRefund: (data: any) => Promise<void>

  submitFormEmail: (formData: any) => Promise<void>
  sendEmail: (to: string, subject: string, html: string) => Promise<void>
  initializeStore: () => Promise<void>

  refreshData: () => Promise<void>
  getCategoryById: (id: string) => Promise<Category>
  getProductById: (id: string) => Promise<Product>
  getProductBySlug: (slug: string) => Promise<Product>
  getCollectionById: (id: string) => Promise<Collection>
  getOrderById: (id: string) => Promise<Order>
  getCouponById: (id: string) => Promise<Coupon>
  getCurrencyById: (id: string) => Promise<Currency>
  getExchangeRateById: (id: string) => Promise<ExchangeRate>
  getFrequentlyBoughtTogetherById: (id: string) => Promise<FrequentlyBoughtTogether>
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
  
  // Inicializar metadata de paginación
  paginationMeta: {
    categories: null,
    products: null,
    productVariants: null,
    collections: null,
    orders: null,
    coupons: null,
    shippingMethods: null,
    paymentTransactions: null,
    currencies: null,
    exchangeRates: null,
    contents: null,
    heroSections: null,
    frequentlyBoughtTogether: null,
    users: null,
  },

  setEndpoint: (endpoint) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("endpoint", endpoint)
    }
    set({ endpoint })
  },

  // Método fetchCategories con paginación
  fetchCategories: async (params: SearchCategoryParams = {}, forceRefresh = false) => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    set({ loading: true, error: null })
    try {
      // Construir parámetros de consulta (sin storeId, va en el path)
      const queryParams = buildQueryParams(params)
      
      const response = await apiClient.get<PaginatedResponse<Category>>(`/categories/${STORE_ID}${queryParams ? `?${queryParams}` : ''}`)
      
      const { data, pagination } = extractPaginatedData<Category[]>(response)
      set({
        categories: data,
        paginationMeta: { ...get().paginationMeta, categories: pagination },
        loading: false,
      })
      return { data, pagination }
    } catch (error) {
      set({ error: "Failed to fetch categories", loading: false })
      throw error
    }
  },

  // Método fetchProducts con paginación
  // Endpoint: GET /products/store/:storeId
  // Soporta filtros: query, categorySlugs, collectionIds, status, vendor, minPrice, maxPrice, currencyId
  // Paginación: page, limit, sortBy, sortOrder
  fetchProducts: async (params: SearchProductParams = {}, forceRefresh = false) => {
    debugLog("🚀 [MainStore fetchProducts] START - Params received:", params)
    debugLog("🔑 [MainStore fetchProducts] STORE_ID:", STORE_ID)
    
    if (!STORE_ID) {
      console.error("❌ [MainStore fetchProducts] No store ID provided in environment variables")
      throw new Error("No store ID provided in environment variables")
    }

    debugLog("⏳ [MainStore fetchProducts] Setting loading to true")
    set({ loading: true, error: null })
    
    try {
      const queryParams = buildQueryParams(params)
      const url = `/products/${STORE_ID}${queryParams ? `?${queryParams}` : ''}`
      debugLog("🌐 [MainStore fetchProducts] Full URL:", url)
      debugLog("🌐 [MainStore fetchProducts] Query params:", queryParams)
      
      debugLog("📡 [MainStore fetchProducts] Making API call...")
      const response = await apiClient.get<PaginatedResponse<Product>>(url)
      
      debugLog("✅ [MainStore fetchProducts] Response received!")
      debugLog("📦 [MainStore fetchProducts] Products count:", response.data?.data?.length || 0)
      debugLog("📦 [MainStore fetchProducts] Pagination:", response.data?.pagination)
      
      // Validar estructura de respuesta
      if (!response.data || !response.data.data) {
        console.error("❌ [MainStore fetchProducts] Invalid response structure:", response.data)
        throw new Error("Invalid response structure from API")
      }
      
      debugLog("💾 [MainStore fetchProducts] Updating store state...")
      const { data, pagination } = extractPaginatedData<Product[]>(response)
      const newState = {
        products: data,
        paginationMeta: { ...get().paginationMeta, products: pagination || null },
        loading: false,
      }
      
      set(newState)
      
      debugLog("✅ [MainStore fetchProducts] Store updated successfully")
      debugLog("🔍 [MainStore fetchProducts] Products in store:", get().products.length)
      
      return { data, pagination }
    } catch (error: any) {
      console.error("❌ [MainStore fetchProducts] Error caught!")
      console.error("❌ [MainStore fetchProducts] Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      set({ error: "Failed to fetch products", loading: false })
      throw error
    }
  },

  // Método fetchProductVariants con paginación
  fetchProductVariants: async (params: SearchProductParams = {}, forceRefresh = false) => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    set({ loading: true, error: null })
    try {
      const queryParams = buildQueryParams(params)
      const response = await apiClient.get<PaginatedResponse<ProductVariant>>(`/product-variants/${STORE_ID}${queryParams ? `?${queryParams}` : ''}`)
      
      const { data, pagination } = extractPaginatedData<ProductVariant[]>(response)
      set({
        productVariants: data,
        paginationMeta: { ...get().paginationMeta, productVariants: pagination },
        loading: false,
      })
      return { data, pagination }
    } catch (error) {
      set({ error: "Failed to fetch product variants", loading: false })
      throw error
    }
  },

  // Método fetchCollections con paginación
  fetchCollections: async (params: SearchCollectionParams = {}, forceRefresh = false) => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    set({ loading: true, error: null })
    try {
      const queryParams = buildQueryParams(params)
      const response = await apiClient.get<PaginatedResponse<Collection>>(`/collections/${STORE_ID}${queryParams ? `?${queryParams}` : ''}`)
      
      const { data, pagination } = extractPaginatedData<Collection[]>(response)
      set({
        collections: data,
        paginationMeta: { ...get().paginationMeta, collections: pagination },
        loading: false,
      })
      return { data, pagination }
    } catch (error) {
      set({ error: "Failed to fetch collections", loading: false })
      throw error
    }
  },

  // Método fetchHeroSections con paginación
  fetchHeroSections: async (params: SearchHeroSectionParams = {}, forceRefresh = false) => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    set({ loading: true, error: null })
    try {
      const queryParams = buildQueryParams(params)
      const response = await apiClient.get<PaginatedResponse<HeroSection>>(`/hero-sections/${STORE_ID}${queryParams ? `?${queryParams}` : ''}`)
      
      const { data, pagination } = extractPaginatedData<HeroSection[]>(response)
      set({
        heroSections: data,
        paginationMeta: { ...get().paginationMeta, heroSections: pagination },
        loading: false,
      })
      return { data, pagination }
    } catch (error) {
      set({ error: "Failed to fetch hero sections", loading: false })
      throw error
    }
  },

  // Método fetchCardSections
  fetchCardSections: async () => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    set({ loading: true, error: null })
    try {
      const response = await apiClient.get<CardSection[]>(`/card-section/${STORE_ID}`)
      const cardSections = extractApiData<CardSection[]>(response)
      set({
        cardSections,
        loading: false,
      })
      return cardSections
    } catch (error) {
      set({ error: "Failed to fetch card sections", loading: false })
      throw error
    }
  },

  // Método fetchTeamSections
  fetchTeamSections: async () => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    set({ loading: true, error: null })
    try {
      const response = await apiClient.get<TeamSection[]>(`/team-section/${STORE_ID}`)
      const teamSections = extractApiData<TeamSection[]>(response)
      set({
        teamSections,
        loading: false,
      })
      return teamSections
    } catch (error) {
      set({ error: "Failed to fetch team sections", loading: false })
      throw error
    }
  },

  // Método fetchTeamMembers
  fetchTeamMembers: async (teamSectionId: string) => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    set({ loading: true, error: null })
    try {
      const response = await apiClient.get<TeamMember[]>(
        `/team-members?teamSectionId=${teamSectionId}&storeId=${STORE_ID}`,
      )
      const teamMembers = extractApiData<TeamMember[]>(response)
      set({
        teamMembers,
        loading: false,
      })
      return teamMembers
    } catch (error) {
      set({ error: "Failed to fetch team members", loading: false })
      throw error
    }
  },

  // Método fetchOrders con paginación
  fetchOrders: async (params: SearchOrderParams = {}, forceRefresh = false) => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    set({ loading: true, error: null })
    try {
      const queryParams = buildQueryParams(params)
      const response = await apiClient.get<PaginatedResponse<Order>>(`/orders/${STORE_ID}${queryParams ? `?${queryParams}` : ''}`)
      
      const { data, pagination } = extractPaginatedData<Order[]>(response)
      set({
        orders: data,
        paginationMeta: { ...get().paginationMeta, orders: pagination },
        loading: false,
      })
      return { data, pagination }
    } catch (error) {
      set({ error: "Failed to fetch orders", loading: false })
      throw error
    }
  },

  // Método para obtener todas las órdenes sin depender de la paginación del backend
  fetchAllOrders: async (params: SearchOrderParams = {}) => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    set({ loading: true, error: null })

    try {
      const { page: _ignorePage, limit: _ignoreLimit, ...restParams } = params
      const limit = Math.max(1, params.limit ?? 100)
      let page = Math.max(1, params.page ?? 1)
      let hasNext = true
      const allOrders: Order[] = []
      let backendMeta: PaginationMeta | null = null

      while (hasNext) {
        const queryParams = buildQueryParams({
          ...restParams,
          page,
          limit,
        })

        const response = await apiClient.get<PaginatedResponse<Order>>(
          `/orders/${STORE_ID}${queryParams ? `?${queryParams}` : ""}`,
        )

        const { data, pagination } = extractPaginatedData<Order[]>(response)

        allOrders.push(...data)
        backendMeta = pagination
        hasNext = pagination.hasNext
        page += 1
      }

      const aggregatedMeta: PaginationMeta = {
        total: allOrders.length,
        page: 1,
        limit: allOrders.length > 0 ? allOrders.length : limit,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      }

      set({
        orders: allOrders,
        paginationMeta: { ...get().paginationMeta, orders: aggregatedMeta },
        loading: false,
      })

      return {
        data: allOrders,
        pagination: backendMeta ?? aggregatedMeta,
      }
    } catch (error) {
      set({ error: "Failed to fetch orders", loading: false })
      throw error
    }
  },

  // Método fetchCoupons con paginación
  fetchCoupons: async (params: SearchCouponParams = {}, forceRefresh = false) => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    set({ loading: true, error: null })
    try {
      const queryParams = buildQueryParams(params)
      const response = await apiClient.get<PaginatedResponse<Coupon>>(`/coupons/${STORE_ID}${queryParams ? `?${queryParams}` : ''}`)
      
      const { data, pagination } = extractPaginatedData<Coupon[]>(response)
      set({
        coupons: data,
        paginationMeta: { ...get().paginationMeta, coupons: pagination },
        loading: false,
      })
      return { data, pagination }
    } catch (error) {
      set({ error: "Failed to fetch coupons", loading: false })
      throw error
    }
  },

  setCouponCode: async (code: string) => set({ couponCode: code }),
  clearCoupon: async () => set({ couponCode: "" }),

  // Método fetchShippingMethods con paginación
  fetchShippingMethods: async (params: SearchShippingMethodParams = {}, forceRefresh = false) => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    set({ loading: true, error: null })
    try {
      const queryParams = buildQueryParams(params)
      const response = await apiClient.get<PaginatedResponse<ShippingMethod>>(`/shipping-methods/${STORE_ID}${queryParams ? `?${queryParams}` : ''}`)
      
      const { data, pagination } = extractPaginatedData<ShippingMethod[]>(response)
      set({
        shippingMethods: data,
        paginationMeta: { ...get().paginationMeta, shippingMethods: pagination },
        loading: false,
      })
      return { data, pagination }
    } catch (error) {
      set({ error: "Failed to fetch shipping methods", loading: false })
      throw error
    }
  },

  // Método fetchPaymentProviders
  fetchPaymentProviders: async () => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    set({ loading: true, error: null })
    try {
      const response = await apiClient.get<PaymentProvider[]>(`/payment-providers/${STORE_ID}`)
      const paymentProviders = extractApiData<PaymentProvider[]>(response)
      set({
        paymentProviders,
        loading: false,
      })
      return paymentProviders
    } catch (error) {
      set({ error: "Failed to fetch payment providers", loading: false })
      throw error
    }
  },

  // Método fetchPaymentTransactions con paginación
  fetchPaymentTransactions: async (params: SearchPaymentTransactionParams = {}, forceRefresh = false) => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    set({ loading: true, error: null })
    try {
      const queryParams = buildQueryParams(params)
      const response = await apiClient.get<PaginatedResponse<PaymentTransaction>>(`/payment-transactions/${STORE_ID}${queryParams ? `?${queryParams}` : ''}`)
      
      const { data, pagination } = extractPaginatedData<PaymentTransaction[]>(response)
      set({
        paymentTransactions: data,
        paginationMeta: { ...get().paginationMeta, paymentTransactions: pagination },
        loading: false,
      })
      return { data, pagination }
    } catch (error) {
      set({ error: "Failed to fetch payment transactions", loading: false })
      throw error
    }
  },

  // Método fetchContents con paginación
  fetchContents: async (params: SearchContentParams = {}, forceRefresh = false) => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    set({ loading: true, error: null })
    try {
      const queryParams = buildQueryParams(params)
      const response = await apiClient.get<PaginatedResponse<Content>>(`/contents/${STORE_ID}${queryParams ? `?${queryParams}` : ''}`)
      
      const { data, pagination } = extractPaginatedData<Content[]>(response)
      set({
        contents: data,
        paginationMeta: { ...get().paginationMeta, contents: pagination },
        loading: false,
      })
      return { data, pagination }
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
      const users = extractApiData<User[]>(response)
      set({
        users,
        loading: false,
      })
      return users
    } catch (error) {
      set({ error: "Failed to fetch users", loading: false })
      throw error
    }
  },

  // Método fetchShopSettings
  fetchShopSettings: async () => {
    set({ loading: true, error: null })
    try {
      if (!STORE_ID) {
        throw new Error("No store ID provided in environment variables")
      }

      const response = await apiClient.get<ShopSettings>(`/shop-settings/${STORE_ID}`)
      const shopSettings = extractApiData<ShopSettings>(response)
      set({
        shopSettings: [shopSettings],
        loading: false,
      })
      return shopSettings
    } catch (error) {
      set({ error: "Failed to fetch shop settings", loading: false })
      throw error
    }
  },

  // Método fetchCurrencies con paginación
  fetchCurrencies: async (params: SearchCurrencyParams = {}, forceRefresh = false) => {
    set({ loading: true, error: null })
    try {
      const queryParams = buildQueryParams(params)
      const response = await apiClient.get<PaginatedResponse<Currency>>(`/currencies${queryParams ? `?${queryParams}` : ''}`)
      
      const { data, pagination } = extractPaginatedData<Currency[]>(response)
      set({
        currencies: data,
        paginationMeta: { ...get().paginationMeta, currencies: pagination },
        loading: false,
      })
      return { data, pagination }
    } catch (error) {
      set({ error: "Failed to fetch currencies", loading: false })
      throw error
    }
  },

  // Método fetchExchangeRates con paginación
  fetchExchangeRates: async (params: SearchExchangeRateParams = {}, forceRefresh = false) => {
    set({ loading: true, error: null })
    try {
      const queryParams = buildQueryParams(params)
      const response = await apiClient.get<PaginatedResponse<ExchangeRate>>(`/exchange-rates${queryParams ? `?${queryParams}` : ''}`)
      
      const { data, pagination } = extractPaginatedData<ExchangeRate[]>(response)
      set({
        exchangeRates: data,
        paginationMeta: { ...get().paginationMeta, exchangeRates: pagination },
        loading: false,
      })
      return { data, pagination }
    } catch (error) {
      set({ error: "Failed to fetch exchange rates", loading: false })
      throw error
    }
  },

  // Método fetchFrequentlyBoughtTogether con paginación
  fetchFrequentlyBoughtTogether: async (params: SearchFbtParams = {}, forceRefresh = false) => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    set({ loading: true, error: null })
    try {
      const queryParams = buildQueryParams(params)
      const response = await apiClient.get<PaginatedResponse<FrequentlyBoughtTogether>>(`/fbt/${STORE_ID}${queryParams ? `?${queryParams}` : ''}`)
      
      const { data, pagination } = extractPaginatedData<FrequentlyBoughtTogether[]>(response)
      set({
        frequentlyBoughtTogether: data,
        paginationMeta: { ...get().paginationMeta, frequentlyBoughtTogether: pagination },
        loading: false,
      })
      return { data, pagination }
    } catch (error) {
      set({ error: "Failed to fetch frequently bought together items", loading: false })
      throw error
    }
  },

  // Método para obtener un FBT específico por ID
  fetchFrequentlyBoughtTogetherById: async (id: string) => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    set({ loading: true, error: null })
    try {
      const response = await apiClient.get<FrequentlyBoughtTogether>(`/fbt/${STORE_ID}/${id}`)
      const fbtItem = extractApiData<FrequentlyBoughtTogether>(response)
      set({ loading: false })
      return fbtItem
    } catch (error) {
      set({ error: "Failed to fetch frequently bought together item", loading: false })
      throw error
    }
  },

  // Método para crear un nuevo FBT
  createFrequentlyBoughtTogether: async (data: CreateFrequentlyBoughtTogetherDto) => {
    set({ loading: true, error: null })
    try {
      if (!STORE_ID) {
        throw new Error("No store ID provided in environment variables")
      }

      // FBT NO requiere storeId en body, solo en URL
      const response = await apiClient.post<FrequentlyBoughtTogether>(`/fbt/${STORE_ID}`, data)
      const newFbt = extractApiData<FrequentlyBoughtTogether>(response)
      set((state) => ({
        frequentlyBoughtTogether: [...state.frequentlyBoughtTogether, newFbt],
        loading: false,
      }))
      return newFbt
    } catch (error) {
      set({ error: "Failed to create frequently bought together item", loading: false })
      throw error
    }
  },

  // Método para actualizar un FBT existente
  updateFrequentlyBoughtTogether: async (id: string, data: UpdateFrequentlyBoughtTogetherDto) => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    set({ loading: true, error: null })
    try {
      // FBT NO requiere storeId en body, solo en URL
      const response = await apiClient.patch<FrequentlyBoughtTogether>(`/fbt/${STORE_ID}/${id}`, data)
      const updatedFbt = extractApiData<FrequentlyBoughtTogether>(response)
      set((state) => ({
        frequentlyBoughtTogether: state.frequentlyBoughtTogether.map((item) =>
          item.id === id ? { ...item, ...updatedFbt } : item,
        ),
        loading: false,
      }))
      return updatedFbt
    } catch (error) {
      set({ error: "Failed to update frequently bought together item", loading: false })
      throw error
    }
  },

  // Método para eliminar un FBT
  deleteFrequentlyBoughtTogether: async (id: string) => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    set({ loading: true, error: null })
    try {
      await apiClient.delete(`/fbt/${STORE_ID}/${id}`)
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

      const { storeId, ...orderPayload } = data ?? {}
      const response = await apiClient.post<Order>(`/orders/${STORE_ID}`, orderPayload)
      const newOrder = extractApiData<Order>(response)
      set((state) => ({
        orders: [...state.orders, newOrder],
        loading: false,
      }))
      return newOrder
    } catch (error) {
      set({ error: "Failed to create order", loading: false })
      throw error
    }
  },

  updateOrder: async (id: string, data: any) => {
    console.log("[UPDATE_ORDER] 🔄 Iniciando actualización de orden");
    console.log("[UPDATE_ORDER] 📋 Parámetros:", {
      orderId: id,
      storeId: STORE_ID,
      data: data,
    });
    
    set({ loading: true, error: null })
    try {
      if (!STORE_ID) {
        console.error("[UPDATE_ORDER] ❌ STORE_ID no está definido");
        throw new Error("No store ID provided in environment variables")
      }
      
      // ✅ CORRECCIÓN: Agregar STORE_ID en la URL según la documentación del API
      const url = `/orders/${STORE_ID}/${id}`;
      console.log("[UPDATE_ORDER] 📤 URL de actualización:", url);
      console.log("[UPDATE_ORDER] 📤 Payload:", data);
      
      const response = await apiClient.put<Order>(url, data)
      console.log("[UPDATE_ORDER] 📥 Respuesta recibida:", {
        status: response.status,
        statusText: response.statusText,
      });
      
      const updatedOrder = extractApiData<Order>(response)
      console.log("[UPDATE_ORDER] ✅ Orden actualizada exitosamente:", {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        paymentStatus: updatedOrder.paymentStatus,
        financialStatus: updatedOrder.financialStatus,
      });
      
      set((state) => ({
        orders: state.orders.map((order) => (order.id === id ? { ...order, ...updatedOrder } : order)),
        loading: false,
      }))
      return updatedOrder
    } catch (error: any) {
      console.error("[UPDATE_ORDER] ❌ Error al actualizar orden:", error);
      console.error("[UPDATE_ORDER] ❌ Detalles del error:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
        method: error?.config?.method,
      });
      
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

      // Usar los métodos fetch existentes con límites altos para obtener todos los datos
      // Esto aprovecha el sistema de paginación pero obtiene grandes cantidades
      const [
        categoriesResponse,
        productsResponse,
        productVariantsResponse,
        collectionsResponse,
        ordersResponse,
        couponsResponse,
        shippingMethodsResponse,
        contentsResponse,
        currenciesResponse,
        exchangeRatesResponse,
        heroSectionsResponse,
        frequentlyBoughtTogetherResponse,
      ] = await Promise.all([
        get().fetchCategories({ limit: 1000 }, true),
        get().fetchProducts({ limit: 1000 }, true),
        get().fetchProductVariants({ limit: 1000 }, true),
        get().fetchCollections({ limit: 1000 }, true),
        get().fetchOrders({ limit: 1000 }, true),
        get().fetchCoupons({ limit: 1000 }, true),
        get().fetchShippingMethods({ limit: 1000 }, true),
        get().fetchContents({ limit: 1000 }, true),
        get().fetchCurrencies({ limit: 1000 }, true),
        get().fetchExchangeRates({ limit: 1000 }, true),
        get().fetchHeroSections({ limit: 1000 }, true),
        get().fetchFrequentlyBoughtTogether({ limit: 1000 }, true),
      ])

      // Para endpoints que no tienen paginación, hacer fetch directo
      const [
        cardSectionsResponse,
        teamSectionsResponse,
        paymentProvidersResponse,
        usersResponse,
        shopSettingsResponse,
      ] = await Promise.all([
        apiClient.get(`/card-section/${STORE_ID}`),
        apiClient.get(`/team-section/${STORE_ID}`),
        apiClient.get(`/payment-providers/${STORE_ID}`),
        apiClient.get(`/auth/store/${STORE_ID}`),
        apiClient.get(`/shop-settings/${STORE_ID}`),
      ])

      set({
        // Los datos paginados vienen en .data
        categories: categoriesResponse.data,
        products: productsResponse.data,
        productVariants: productVariantsResponse.data,
        collections: collectionsResponse.data,
        heroSections: heroSectionsResponse.data,
        orders: ordersResponse.data,
        coupons: couponsResponse.data,
        shippingMethods: shippingMethodsResponse.data,
        contents: contentsResponse.data,
        currencies: currenciesResponse.data,
        exchangeRates: exchangeRatesResponse.data,
        frequentlyBoughtTogether: frequentlyBoughtTogetherResponse.data,
        
        // Datos no paginados
        cardSections: cardSectionsResponse.data,
        teamSections: teamSectionsResponse.data,
        paymentProviders: paymentProvidersResponse.data,
        users: usersResponse.data,
        shopSettings: Array.isArray(shopSettingsResponse.data)
          ? shopSettingsResponse.data
          : [shopSettingsResponse.data],
        
        loading: false,
      })
    } catch (error) {
      set({ error: "Failed to refresh data", loading: false })
      throw error
    }
  },

  getCategoryById: async (id) => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }
    
    try {
      const response = await apiClient.get<Category>(`/categories/${STORE_ID}/${id}`)
      return extractApiData<Category>(response)
    } catch (error) {
      console.error("Failed to fetch category by id:", error)
      throw error
    }
  },

  getProductById: async (id) => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }
    
    try {
      const response = await apiClient.get<Product>(`/products/${STORE_ID}/${id}`)
      return extractApiData<Product>(response)
    } catch (error) {
      console.error("Failed to fetch product by id:", error)
      throw error
    }
  },

  getProductBySlug: async (slug) => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }
    
    try {
      const response = await apiClient.get<Product>(`/products/by-slug/${STORE_ID}/${slug}`)
      return extractApiData<Product>(response)
    } catch (error) {
      console.error("Failed to fetch product by slug:", error)
      throw error
    }
  },

  getCollectionById: async (id) => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }
    
    try {
      const response = await apiClient.get<Collection>(`/collections/${STORE_ID}/${id}`)
      return extractApiData<Collection>(response)
    } catch (error) {
      console.error("Failed to fetch collection by id:", error)
      throw error
    }
  },

  getOrderById: async (id) => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }
    
    try {
      const response = await apiClient.get<Order>(`/orders/${STORE_ID}/${id}`)
      return extractApiData<Order>(response)
    } catch (error) {
      console.error("Failed to fetch order by id:", error)
      throw error
    }
  },

  getCouponById: async (id) => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }
    
    try {
      const response = await apiClient.get<Coupon>(`/coupons/${STORE_ID}/${id}`)
      return extractApiData<Coupon>(response)
    } catch (error) {
      console.error("Failed to fetch coupon by id:", error)
      throw error
    }
  },

  getCurrencyById: async (id) => {
    try {
      const response = await apiClient.get<Currency>(`/currencies/${id}`)
      return extractApiData<Currency>(response)
    } catch (error) {
      console.error("Failed to fetch currency by id:", error)
      throw error
    }
  },

  getExchangeRateById: async (id) => {
    try {
      const response = await apiClient.get<ExchangeRate>(`/exchange-rates/${id}`)
      return extractApiData<ExchangeRate>(response)
    } catch (error) {
      console.error("Failed to fetch exchange rate by id:", error)
      throw error
    }
  },

  getFrequentlyBoughtTogetherById: async (id) => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }
    
    try {
      const response = await apiClient.get<FrequentlyBoughtTogether>(`/fbt/${STORE_ID}/${id}`)
      return extractApiData<FrequentlyBoughtTogether>(response)
    } catch (error) {
      console.error("Failed to fetch frequently bought together by id:", error)
      throw error
    }
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
