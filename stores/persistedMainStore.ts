import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ShopSettings } from '@/types/store'
import type { ShippingMethod } from '@/types/shippingMethod'
import type { PaymentProvider } from '@/types/payments'

interface PersistedMainState {
  shopSettings: ShopSettings[]
  shippingMethods: ShippingMethod[]
  paymentProviders: PaymentProvider[]
  couponCode: string
  setShopSettings: (settings: ShopSettings[]) => void
  setShippingMethods: (methods: ShippingMethod[]) => void
  setPaymentProviders: (providers: PaymentProvider[]) => void
  setCouponCode: (code: string) => void
}

export const usePersistedMainStore = create(
  persist<PersistedMainState>(
    (set) => ({
      shopSettings: [],
      shippingMethods: [],
      paymentProviders: [],
      couponCode: '',
      setShopSettings: (settings) => set({ shopSettings: settings }),
      setShippingMethods: (methods) => set({ shippingMethods: methods }),
      setPaymentProviders: (providers) => set({ paymentProviders: providers }),
      setCouponCode: (code) => set({ couponCode: code }),
    }),
    {
      name: 'persisted-main-store',
    }
  )
)
