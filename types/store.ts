import type { User } from "./user"
import type { HeroSection } from "./heroSection"
import type { Currency } from "./currency"
import type { Category } from "./category"
import type { Product } from "./product"
import type { Collection } from "./collection"
import type { Order } from "./order"
import type { ShippingMethod } from "./shippingMethod"
import type { PaymentProvider } from "./payments"
import type { Coupon } from "./coupon"
import type { Content } from "./content"
import type { FrequentlyBoughtTogether } from "./fbt"
import type { CardSection } from "./card"
import type { TeamSection } from "./team"

export interface Store {
  id: string
  name: string
  slug: string
  owner: User
  ownerId: string
  isActive: boolean
  maxProducts?: number | null
  planType?: string | null
  planExpiryDate?: Date | null
  apiKeys?: any | null // Json type
  createdAt: Date
  updatedAt: Date

  // Relaciones
  settings?: ShopSettings
 
  categories?: Category[]
  products?: Product[]
  collections?: Collection[]
  orders?: Order[]
  shippingMethods?: ShippingMethod[]
  paymentProviders?: PaymentProvider[]
  coupons?: Coupon[]
  contents?: Content[]
  heroSections?: HeroSection[]
  cardSections?: CardSection[]
  teamSections?: TeamSection[]
  frequentlyBoughtTogether?: FrequentlyBoughtTogether[]
}

export interface ShopSettings {
  id: string
  storeId: string
  store?: Store
  name: string
  domain: string
  email?: string 
  shopOwner?: string 
  logo?: string 
  logo2?: string 
  logo3?: string 
  description?: string 
  address1?: string 
  address2?: string 
  city?: string 
  province?: string 
  provinceCode?: string 
  country?: string 
  countryCode?: string 
  zip?: string 
  phone?: string 

  // Currency Settings
  defaultCurrency: Currency
  defaultCurrencyId: string
  acceptedCurrencies?: Currency[]
  multiCurrencyEnabled: boolean

  // Shipping Settings
  shippingZones?: string 
  defaultShippingRate?: number 
  freeShippingThreshold?: number 

  // Tax Settings
  taxesIncluded: boolean
  taxValue?: number 

  // Timezone & Measurement
  timezone?: string 
  weightUnit?: string 

  // Branding & Theme
  primaryColor?: string 
  secondaryColor?: string 
  theme?: string 

  // Social Media
  facebookUrl?: string 
  instagramUrl?: string 
  twitterUrl?: string 
  tiktokUrl?: string 
  youtubeUrl?: string 

  // Analytics
  googleAnalyticsId?: string 
  facebookPixelId?: string 

  // Support
  supportEmail?: string 
  supportPhone?: string 
  liveChatEnabled: boolean

  // Status & Settings
  status: string
  maintenanceMode: boolean
  multiLanguageEnabled: boolean
  cookieConsentEnabled?: boolean 
  gdprCompliant?: boolean 
  ccpaCompliant?: boolean 
  enableWishlist?: boolean 
  webhooks?: any  // Json type

  createdAt: Date
  updatedAt: Date
}

 