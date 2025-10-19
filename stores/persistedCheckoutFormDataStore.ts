import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CheckoutFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  address: string
  apartment: string
  city: string
  state: string
  zipCode: string
  shippingPhone: string
  country: string
  countryId: string
  countryCode3: string
  stateId: string
  cityId: string
  sameBillingAddress: boolean
  billingAddress: string
  billingApartment: string
  billingCity: string
  billingState: string
  billingZipCode: string
  billingPhone: string
  billingCountry: string
  billingCountryId: string
  billingCountryCode3: string
  billingStateId: string
  billingCityId: string
  shippingMethod: string
  paymentMethod: string
  cardNumber: string
  cardName: string
  expiryDate: string
  cvv: string
  notes: string
  preferredDeliveryDate: string
}

interface PersistedCheckoutFormDataState {
  formDataPersist: CheckoutFormData
  setFormDataPersist: (data: Partial<CheckoutFormData>) => void
}

const initialFormData: CheckoutFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  apartment: "",
  city: "",
  state: "",
  zipCode: "",
  shippingPhone: "",
  country: "",
  countryId: "",
  countryCode3: "",
  stateId: "",
  cityId: "",
  sameBillingAddress: true,
  billingAddress: "",
  billingApartment: "",
  billingCity: "",
  billingState: "",
  billingZipCode: "",
  billingPhone: "",
  billingCountry: "",
  billingCountryId: "",
  billingCountryCode3: "",
  billingStateId: "",
  billingCityId: "",
  shippingMethod: "",
  paymentMethod: "",
  cardNumber: "",
  cardName: "",
  expiryDate: "",
  cvv: "",
  notes: "",
  preferredDeliveryDate: new Date().toISOString(),
}

export const usePersistedCheckoutFormDataStore = create(
  persist<PersistedCheckoutFormDataState>(
    (set) => ({
      formDataPersist: initialFormData,
      setFormDataPersist: (data) => set((state) => ({ formDataPersist: { ...state.formDataPersist, ...data } })),
    }),
    {
      name: 'persisted-checkout-form-data',
    }
  )
)
