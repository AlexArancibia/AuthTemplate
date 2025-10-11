import { create } from "zustand"
import apiClient from "@/lib/axiosConfig"
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

// Helper function para construir query params
const buildQueryParams = (params: any = {}) => {
  console.log("🔧 [buildQueryParams] Input params:", params)
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
            console.log(`🔧 [buildQueryParams] Adding array param (comma format): ${key} = ${joinedValue}`)
            queryParams.append(key, joinedValue)
          } else {
            // Para status y otros arrays: enviar múltiples valores con el mismo nombre
            value.forEach((item) => {
              console.log(`🔧 [buildQueryParams] Adding array param (multiple values): ${key} = ${item}`)
              queryParams.append(key, String(item))
            })
          }
        }
      } else {
        // Para strings, usar trim() antes de agregar
        const stringValue = typeof value === 'string' ? value.trim() : String(value)
        console.log(`🔧 [buildQueryParams] Adding param: ${key} = ${stringValue}`)
        queryParams.append(key, stringValue)
      }
    } else {
      console.log(`🔧 [buildQueryParams] Skipping param: ${key} (value is undefined/null/empty)`)
    }
  })
  
  const result = queryParams.toString()
  console.log("🔧 [buildQueryParams] Final query string:", result)
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
  getCategoryById: (id: string) => Promise<Category>
  getProductById: (id: string) => Promise<Product>
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
      
      set({
        categories: response.data.data,
        paginationMeta: { ...get().paginationMeta, categories: response.data.pagination },
        loading: false,
      })
      return response.data
    } catch (error) {
      set({ error: "Failed to fetch categories", loading: false })
      throw error
    }
  },

  // Método fetchProducts con paginación
  fetchProducts: async (params: SearchProductParams = {}, forceRefresh = false) => {
    console.log("🚀 [MainStore fetchProducts] START - Params received:", params)
    console.log("🔑 [MainStore fetchProducts] STORE_ID:", STORE_ID)
    
    if (!STORE_ID) {
      console.error("❌ [MainStore fetchProducts] No store ID provided in environment variables")
      throw new Error("No store ID provided in environment variables")
    }

    console.log("⏳ [MainStore fetchProducts] Setting loading to true")
    set({ loading: true, error: null })
    
    try {
      const queryParams = buildQueryParams(params)
      const url = `/products/store/${STORE_ID}${queryParams ? `?${queryParams}` : ''}`
      console.log("🌐 [MainStore fetchProducts] Full URL:", url)
      console.log("🌐 [MainStore fetchProducts] Query params:", queryParams)
      console.log("🌐 [MainStore fetchProducts] Base URL:", process.env.NEXT_PUBLIC_BACKEND_ENDPOINT)
      
      console.log("📡 [MainStore fetchProducts] Making API call...")
      const response = await apiClient.get<PaginatedResponse<Product>>(url)
      
      console.log("✅ [MainStore fetchProducts] Response received!")
      console.log("📊 [MainStore fetchProducts] Response status:", response.status)
      console.log("📊 [MainStore fetchProducts] Response headers:", response.headers)
      console.log("📦 [MainStore fetchProducts] Response data keys:", Object.keys(response.data))
      console.log("📦 [MainStore fetchProducts] Response data structure:", {
        hasData: !!response.data,
        hasPagination: !!response.data?.pagination,
        dataLength: response.data?.data?.length || 0,
        paginationDetails: response.data?.pagination,
      })
      console.log("📦 [MainStore fetchProducts] Full response.data:", JSON.stringify(response.data, null, 2))
      
      // Validar estructura de respuesta
      if (!response.data || !response.data.data) {
        console.error("❌ [MainStore fetchProducts] Invalid response structure:", response.data)
        throw new Error("Invalid response structure from API")
      }
      
      console.log("💾 [MainStore fetchProducts] Updating store state...")
      const newState = {
        products: response.data.data,
        paginationMeta: { ...get().paginationMeta, products: response.data.pagination || null },
        loading: false,
      }
      console.log("💾 [MainStore fetchProducts] New state:", {
        productsCount: newState.products.length,
        paginationMeta: newState.paginationMeta,
        loading: newState.loading,
      })
      
      set(newState)
      
      console.log("✅ [MainStore fetchProducts] Store updated successfully")
      console.log("🔍 [MainStore fetchProducts] Current store state after update:", {
        productsCount: get().products.length,
        paginationMeta: get().paginationMeta,
      })
      
      return response.data
    } catch (error: any) {
      console.error("❌ [MainStore fetchProducts] Error caught!")
      console.error("❌ [MainStore fetchProducts] Error object:", error)
      console.error("❌ [MainStore fetchProducts] Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
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
      const response = await apiClient.get<PaginatedResponse<ProductVariant>>(`/product-variants/store/${STORE_ID}${queryParams ? `?${queryParams}` : ''}`)
      
      set({
        productVariants: response.data.data,
        paginationMeta: { ...get().paginationMeta, productVariants: response.data.pagination },
        loading: false,
      })
      return response.data
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
      
      set({
        collections: response.data.data,
        paginationMeta: { ...get().paginationMeta, collections: response.data.pagination },
        loading: false,
      })
      return response.data
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
      
      set({
        heroSections: response.data.data,
        paginationMeta: { ...get().paginationMeta, heroSections: response.data.pagination },
        loading: false,
      })
      return response.data
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
      set({
        cardSections: response.data,
        loading: false,
      })
      return response.data
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
      const response = await apiClient.get<TeamSection[]>(`/team-section/store/${STORE_ID}`)
      set({
        teamSections: response.data,
        loading: false,
      })
      return response.data
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
      set({
        teamMembers: response.data,
        loading: false,
      })
      return response.data
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
      
      set({
        orders: response.data.data,
        paginationMeta: { ...get().paginationMeta, orders: response.data.pagination },
        loading: false,
      })
      return response.data
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
      
      set({
        coupons: response.data.data,
        paginationMeta: { ...get().paginationMeta, coupons: response.data.pagination },
        loading: false,
      })
      return response.data
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
      
      set({
        shippingMethods: response.data.data,
        paginationMeta: { ...get().paginationMeta, shippingMethods: response.data.pagination },
        loading: false,
      })
      return response.data
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
      const response = await apiClient.get<PaymentProvider[]>(`/payment-providers/store/${STORE_ID}`)
      set({
        paymentProviders: response.data,
        loading: false,
      })
      return response.data
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
      const response = await apiClient.get<PaginatedResponse<PaymentTransaction>>(`/payment-transactions/store/${STORE_ID}${queryParams ? `?${queryParams}` : ''}`)
      
      set({
        paymentTransactions: response.data.data,
        paginationMeta: { ...get().paginationMeta, paymentTransactions: response.data.pagination },
        loading: false,
      })
      return response.data
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
      
      set({
        contents: response.data.data,
        paginationMeta: { ...get().paginationMeta, contents: response.data.pagination },
        loading: false,
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
      })
      return response.data
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

      const response = await apiClient.get<ShopSettings>(`/shop-settings/store/${STORE_ID}`)
      set({
        shopSettings: [response.data],
        loading: false,
      })
      return response.data
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
      
      set({
        currencies: response.data.data,
        paginationMeta: { ...get().paginationMeta, currencies: response.data.pagination },
        loading: false,
      })
      return response.data
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
      
      set({
        exchangeRates: response.data.data,
        paginationMeta: { ...get().paginationMeta, exchangeRates: response.data.pagination },
        loading: false,
      })
      return response.data
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
      
      set({
        frequentlyBoughtTogether: response.data.data,
        paginationMeta: { ...get().paginationMeta, frequentlyBoughtTogether: response.data.pagination },
        loading: false,
      })
      return response.data
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

      const response = await apiClient.post<FrequentlyBoughtTogether>(`/fbt/${STORE_ID}`, fbtData)
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
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }

    set({ loading: true, error: null })
    try {
      const response = await apiClient.patch<FrequentlyBoughtTogether>(`/fbt/${STORE_ID}/${id}`, data)
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

      // Asegurarse de que el storeId esté incluido en los datos
      const orderData = {
        ...data,
        storeId: STORE_ID,
      }

      const response = await apiClient.post<Order>(`/orders/${STORE_ID}` , orderData)
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
        apiClient.get(`/team-section/store/${STORE_ID}`),
        apiClient.get(`/payment-providers/store/${STORE_ID}`),
        apiClient.get(`/auth/store/${STORE_ID}`),
        apiClient.get(`/shop-settings/store/${STORE_ID}`),
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
      return response.data
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
      return response.data
    } catch (error) {
      console.error("Failed to fetch product by id:", error)
      throw error
    }
  },

  getCollectionById: async (id) => {
    if (!STORE_ID) {
      throw new Error("No store ID provided in environment variables")
    }
    
    try {
      const response = await apiClient.get<Collection>(`/collections/${STORE_ID}/${id}`)
      return response.data
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
      return response.data
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
      return response.data
    } catch (error) {
      console.error("Failed to fetch coupon by id:", error)
      throw error
    }
  },

  getCurrencyById: async (id) => {
    try {
      const response = await apiClient.get<Currency>(`/currencies/${id}`)
      return response.data
    } catch (error) {
      console.error("Failed to fetch currency by id:", error)
      throw error
    }
  },

  getExchangeRateById: async (id) => {
    try {
      const response = await apiClient.get<ExchangeRate>(`/exchange-rates/${id}`)
      return response.data
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
      return response.data
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
