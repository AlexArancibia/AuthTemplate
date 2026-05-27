"use client"

import type React from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Minus, Truck, Package, CreditCard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { AddressCard } from "@/components/ui/address-card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import Image from "next/image"
import { useGeographicDataStore } from "@/stores/locationStore"
import { useUserStore } from "@/stores/userStore"
import { useCurrencyStore } from "@/stores/currency"
import { useMainStore } from "@/stores/mainStore"

import type { Address } from "@/stores/userStore"
import { AddressType } from "@/types/auth"
import { User } from "@/types/user"
import type { ShippingMethod } from "@/types/shippingMethod"
import type { PaymentProvider } from "@/types/payments"

import { loadCulqiScript, openCulqiCheckout, setCulqiCallback } from "@/components/checkout/cuqui-checkout"
import { PayPalCheckoutButton, type PayPalPaymentResult } from "@/components/checkout/paypal-checkout-button"

// Helper function to watch for Culqi modal close
function watchCulqiClose(onClose: () => void) {
  const observer = new MutationObserver(() => {
    const iframeExists = !!document.querySelector("iframe[src*='culqi']")
    if (!iframeExists) {
      onClose()
      observer.disconnect()
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })

  return observer
}

interface UnifiedCheckoutFormProps {
  formData: Record<string, any>
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSelectChange: (name: string, value: string) => void
  isAuthenticated: boolean
  authCheckComplete: boolean
  currentUser: (User & { addresses?: Address[] }) | null
  showNewShippingAddress: boolean
  setShowNewShippingAddress: (value: boolean) => void
  showNewBillingAddress: boolean
  setShowNewBillingAddress: (value: boolean) => void
  selectedShippingAddressId: string | null
  selectedBillingAddressId: string | null
  handleSelectShippingAddress: (addressId: string) => void
  handleSelectBillingAddress: (addressId: string) => void
  handleDeselectShippingAddress: () => void
  handleDeselectBillingAddress: () => void
  handleBillingAddressToggle: (value: boolean) => void
  copyShippingToBilling: () => void
  onEditAddress: (addressId: string) => void
  onDeleteAddress: (addressId: string) => void
  shippingMethods: ShippingMethod[]
  paymentProviders: PaymentProvider[]
  submitOrder: () => void
  submitOrderMP: () => Promise<boolean>
  submitOrderPayPal: (details: PayPalPaymentResult) => Promise<void>
  isSubmitting: boolean
  isLoading: boolean
  total: number
  resumeItems: string
  orderId: string | null
  temporalOrderId: string | null
}

export function UnifiedCheckoutForm({
  formData,
  handleInputChange,
  handleSelectChange,
  isAuthenticated,
  authCheckComplete,
  currentUser,
  showNewShippingAddress,
  setShowNewShippingAddress,
  showNewBillingAddress,
  setShowNewBillingAddress,
  selectedShippingAddressId,
  selectedBillingAddressId,
  handleSelectShippingAddress,
  handleSelectBillingAddress,
  handleDeselectShippingAddress,
  handleDeselectBillingAddress,
  handleBillingAddressToggle,
  copyShippingToBilling,
  onEditAddress,
  onDeleteAddress,
  shippingMethods,
  paymentProviders,
  submitOrder,
  submitOrderMP,
  submitOrderPayPal,
  isSubmitting,
  isLoading,
  total,
  resumeItems,
  orderId,
  temporalOrderId,
}: UnifiedCheckoutFormProps) {
  const router = useRouter()
  const { updateAddress } = useUserStore()
  const { selectedCurrencyId, acceptedCurrencies } = useCurrencyStore()
  const selectedCurrency = acceptedCurrencies.find(
    (currency) => currency.id === selectedCurrencyId
  )
  const checkoutCurrencyCode = selectedCurrency?.code || "PEN"

  const [addressError, setAddressError] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [isOpeningCulqi, setIsOpeningCulqi] = useState(false)
  const [mpPreferenceId, setMpPreferenceId] = useState<string | null>(null)
  const [mpInitPoint, setMpInitPoint] = useState<string | null>(null)
  const [mpLoading, setMpLoading] = useState(false)

  const {
    countries,
    states,
    cities,
    fetchCountries,
    fetchStates,
    fetchCities
  } = useGeographicDataStore()

  // Initialize countries on mount
  useEffect(() => {
    fetchCountries()
  }, [fetchCountries])

  const allowedCountryCode3 = new Set(["PER", "ECU", "CHL"])
  const allowedCountries =
    countries && Array.isArray(countries)
      ? countries.filter((c) => allowedCountryCode3.has(String(c.code3 || "").toUpperCase()))
      : []

  // Initialize default country (Peru) if not set
  useEffect(() => {
    if (allowedCountries.length > 0 && !formData.countryCode3) {
      const peru = allowedCountries.find((c) => {
        const code3 = String(c.code3 || "").toUpperCase()
        const name = String(c.name || "").toLowerCase()
        return code3 === "PER" || name === "perú" || name === "peru"
      })
      if (peru) {
        handleInputChange({ target: { name: "country", value: peru.name } } as any)
        handleInputChange({ target: { name: "countryCode3", value: peru.code3 } } as any)
        handleInputChange({ target: { name: "countryId", value: peru.id } } as any)
      }
    }
  }, [allowedCountries, formData.countryCode3])

  // Fetch states when country changes
  useEffect(() => {
    if (formData.countryId) fetchStates(formData.countryId)
  }, [formData.countryId, fetchStates])

  // Fetch cities when state changes
  useEffect(() => {
    if (formData.countryId && formData.stateId) {
      fetchCities(formData.countryId, formData.stateId)
    }
  }, [formData.countryId, formData.stateId, fetchCities])

  // Handle billing address geography
  useEffect(() => {
    if (formData.billingCountryId) fetchStates(formData.billingCountryId)
  }, [formData.billingCountryId, fetchStates])

  useEffect(() => {
    if (formData.billingCountryId && formData.billingStateId) {
      fetchCities(formData.billingCountryId, formData.billingStateId)
    }
  }, [formData.billingCountryId, formData.billingStateId, fetchCities])

  const selectedProvider = paymentProviders.find(p => p.id === formData.paymentMethod)
  const isMercadoPago = selectedProvider?.name?.toLowerCase() === "mercadopago"
  const isCulqui = selectedProvider?.name?.toLowerCase() === "culqui"
  const isPayPal =
    selectedProvider?.type === "PAYPAL" ||
    selectedProvider?.name?.toLowerCase().includes("paypal")

  // Handle MercadoPago preference creation
  useEffect(() => {
    if (!isMercadoPago) {
      setMpPreferenceId(null)
      setMpInitPoint(null)
    } else {
      (async () => {
        setMpLoading(true)
        setMpPreferenceId(null)
        setMpInitPoint(null)
        try {
          await createPreferenceIdFromEndpoint()
        } catch (err) {
          toast.error("Error de conexión con MercadoPago")
        } finally {
          setMpLoading(false)
        }
      })()
    }
  }, [isMercadoPago, total, resumeItems, formData, orderId])

  const createPreferenceIdFromEndpoint = async () => {
    const checkoutOrigin =
      typeof window !== "undefined" ? window.location.origin : ""
    const backUrls = checkoutOrigin
      ? {
          success: `${checkoutOrigin}/success`,
          pending: `${checkoutOrigin}/pending`,
          failure: `${checkoutOrigin}/failure`,
        }
      : undefined

    const res = await fetch("/api/payments/mercadopago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Math.round(Number(total) * 100),
        currency: "PEN",
        description: resumeItems,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        ...(isPickupSelected ? {} : { address: formData.address, city: formData.city }),
        countryCode: "PE",
        temporalOrderId: temporalOrderId,
        backUrls,
      }),
    })
    const data = await res.json()

    if (data.success && data.preference_id && data.init_point) {
      setMpPreferenceId(data.preference_id)
      setMpInitPoint(data.init_point)
    } else {
      toast.error(data.error || "No se pudo crear la preferencia de MercadoPago")
    }
  }

  const handleMercadoPagoPay = async () => {
    if (!isFormValid()) {
      handleSubmit()
      return
    }

    if (!mpPreferenceId || !mpInitPoint) {
      toast.error("MercadoPago aun no esta listo. Intenta nuevamente.")
      return
    }

    const orderCreated = await submitOrderMP()
    if (orderCreated) {
      window.location.href = mpInitPoint
    }
  }

  const handleCulqiPay = async () => {
    const amount = Math.round(Number(total) * 100)

    try {
      setIsOpeningCulqi(true)
      await loadCulqiScript()

      watchCulqiClose(() => {
        setIsOpeningCulqi(false)
      })

      setCulqiCallback(
        async (token) => {
          setIsOpeningCulqi(false)
          if (token) {
            try {
              const res = await fetch("/api/payments/culqui", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  token,
                  amount: amount,
                  currency: "PEN",
                  description: resumeItems,
                  email: formData.email,
                  firstName: formData.firstName,
                  lastName: formData.lastName,
                  phone: formData.phone,
                  ...(isPickupSelected ? {} : { address: formData.address, city: formData.city }),
                  countryCode: "PE",
                  orderNumber: orderId,
                }),
              })

              const data = await res.json()

              if (!res.ok) {
                toast.error(data.error || "Error procesando el pago")
                return
              }

              handleSelectChange("culqiToken", token)
              await submitOrder()
            } catch (error) {
              console.error("Error de conexión con el backend", error)
              toast.error("Error de conexión con el backend")
            }
          }
        },
        (error) => {
          setIsOpeningCulqi(false)
          toast.error("Error en el pago con Culqi")
        }
      )

      await openCulqiCheckout(amount, "Pago de productos:\n" + resumeItems)
    } catch (err) {
      setIsOpeningCulqi(false)
      toast.error("No se pudo iniciar el pago con Culqi")
    }
  }

  // Geography handlers
  const handleCountryChange = (value: string) => {
    if (!allowedCountries || !Array.isArray(allowedCountries)) return
    
    const country = allowedCountries.find(c => String(c.code3 || "").toUpperCase() === String(value || "").toUpperCase())
    if (country) {
      handleInputChange({ target: { name: "country", value: country.name } } as any)
      handleInputChange({ target: { name: "countryCode3", value } } as any)
      handleInputChange({ target: { name: "countryId", value: country.id } } as any)
      // Limpiar estado y ciudad cuando cambia el país
      handleInputChange({ target: { name: "state", value: "" } } as any)
      handleInputChange({ target: { name: "stateId", value: "" } } as any)
      handleInputChange({ target: { name: "city", value: "" } } as any)
      handleInputChange({ target: { name: "cityId", value: "" } } as any)
    }
  }

  const handleStateChange = (value: string) => {
    if (!formData.countryId) return
    
    const stateList = states[formData.countryId]
    if (!stateList || !Array.isArray(stateList)) return
    
    const state = stateList.find(s => s.id === value)
    if (state) {
      handleInputChange({ target: { name: "state", value: state.name } } as any)
      handleInputChange({ target: { name: "stateId", value } } as any)
      // Limpiar ciudad cuando cambia la provincia
      handleInputChange({ target: { name: "city", value: "" } } as any)
      handleInputChange({ target: { name: "cityId", value: "" } } as any)
    }
  }

  const handleCityChange = (value: string) => {
    if (!formData.stateId) return
    
    const cityList = cities[formData.stateId]
    if (!cityList || !Array.isArray(cityList)) return
    
    const city = cityList.find(c => c.id === value)
    if (city) {
      handleInputChange({ target: { name: "city", value: city.name } } as any)
      handleInputChange({ target: { name: "cityId", value } } as any)
    }
  }

  // Filters for shipping methods
  const filteredShippingMethods = shippingMethods.filter((method) =>
    method.prices.some((price) =>
      price.cityNames?.some(
        (city) => city.toLowerCase() === formData.city.toLowerCase()
      )
    )
  )

  const pickupMethod = shippingMethods.find((method) =>
    method.name.toLowerCase().includes("recojo")
  )

  const agencyMethod = shippingMethods.find((method) =>
    method.name.toLowerCase().includes("envio solo hasta agencia") ||
    method.name.toLowerCase().includes("envío solo hasta agencia")
  )

  // Si NO hay ciudad seleccionada, mostrar todos los métodos disponibles
  let methodsToShow = formData.city && formData.city.trim() !== "" 
    ? [...filteredShippingMethods] 
    : [...shippingMethods]

  // Siempre agregar recojo si existe y no está ya en la lista
  if (pickupMethod && !methodsToShow.find(m => m.id === pickupMethod.id)) {
    methodsToShow.push(pickupMethod)
  }

  // Siempre agregar "agencia/coordinar" si existe y no está ya en la lista
  if (agencyMethod && !methodsToShow.find(m => m.id === agencyMethod.id)) {
    methodsToShow.push(agencyMethod)
  }

  methodsToShow.sort((a, b) => {
    const aIsPickup = a.name.toLowerCase().includes("recojo") || a.name.toLowerCase().includes("pickup") || a.name.toLowerCase().includes("tienda")
    const bIsPickup = b.name.toLowerCase().includes("recojo") || b.name.toLowerCase().includes("pickup") || b.name.toLowerCase().includes("tienda")

    if (aIsPickup && !bIsPickup) return -1
    if (!aIsPickup && bIsPickup) return 1
    return 0
  })

  const selectedShippingMethod = shippingMethods.find((m) => m.id === formData.shippingMethod)
  const selectedShippingName = selectedShippingMethod?.name?.toLowerCase() || ""
  const isPickupSelected =
    !!selectedShippingMethod &&
    (selectedShippingName.includes("recojo") ||
      selectedShippingName.includes("pickup") ||
      selectedShippingName.includes("tienda"))

  // Delivery date helpers
  const getDayType = (availableDays: string[]) => {
    const allDays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
    const businessDays = ["mon", "tue", "wed", "thu", "fri"]

    if (!availableDays || availableDays.length === 0) return "días"

    const sortedAvailable = [...availableDays].sort()
    const sortedBusiness = [...businessDays].sort()
    const sortedAll = [...allDays].sort()

    if (JSON.stringify(sortedAvailable) === JSON.stringify(sortedBusiness)) {
      return "días hábiles"
    } else if (JSON.stringify(sortedAvailable) === JSON.stringify(sortedAll)) {
      return "días"
    } else {
      return "días disponibles"
    }
  }

  const getDeliveryDateRange = (minDays: number, maxDays: number, availableDays: string[]) => {
    const dayMap: { [key: string]: number } = {
      sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6
    }

    const availableDayNumbers = availableDays.map(day => dayMap[day.toLowerCase()])

    const calculateDeliveryDate = (daysToAdd: number) => {
      const today = new Date()
      let daysAdded = 0
      let currentDate = new Date(today)

      while (daysAdded < daysToAdd) {
        currentDate.setDate(currentDate.getDate() + 1)
        const dayOfWeek = currentDate.getDay()

        if (availableDayNumbers.includes(dayOfWeek)) {
          daysAdded++
        }
      }

      return currentDate
    }

    const minDate = calculateDeliveryDate(minDays || 1)
    const maxDate = calculateDeliveryDate(maxDays || minDays || 1)

    const formatDate = (date: Date) => {
      const day = date.getDate()
      const month = date.toLocaleDateString('es-ES', { month: 'short' })
      return `${day} ${month}`
    }

    if (minDays === maxDays) {
      return formatDate(minDate)
    }

    return `${formatDate(minDate)} - ${formatDate(maxDate)}`
  }

  // Render address card
  const renderAddressCard = (address: Address, isSelected: boolean, onSelect: () => void) => (
    <AddressCard
      key={address.id}
      address={address}
      isSelected={isSelected}
      onSelect={onSelect}
      onEdit={() => onEditAddress(address.id)}
      onDelete={() => onDeleteAddress(address.id)}
      showRadioButton={true}
      showEditDeleteButtons={true}
      variant="checkout"
    />
  )

  // Form validation
  const isFormValid = () => {
    if (!authCheckComplete) return false

    const basicInfoValid = formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.phone

    const shippingValid = isPickupSelected
      ? true
      : (() => {
          if (isAuthenticated && currentUser?.addresses && currentUser.addresses.length > 0) {
            if (selectedShippingAddressId) return true
            if (showNewShippingAddress) {
              return (
                formData.address &&
                formData.shippingPhone &&
                formData.city &&
                formData.state
              )
            }
            return false
          }

          return (
            formData.address &&
            formData.shippingPhone &&
            formData.city &&
            formData.state
          )
        })()

    const billingValid = isPickupSelected
      ? true
      : (() => {
          if (formData.sameBillingAddress) return true

          if (isAuthenticated && currentUser?.addresses && currentUser.addresses.length > 0) {
            if (selectedBillingAddressId) return true
            if (showNewBillingAddress) {
              return (
                formData.billingAddress &&
                formData.billingPhone &&
                formData.billingCity &&
                formData.billingState
              )
            }
            return false
          }

          return (
            formData.billingAddress &&
            formData.billingPhone &&
            formData.billingCity &&
            formData.billingState
          )
        })()

    const shippingMethodValid = !!formData.shippingMethod
    const paymentMethodValid = !!formData.paymentMethod

    return basicInfoValid && shippingValid && billingValid && shippingMethodValid && paymentMethodValid
  }

  const handleSubmit = () => {
    if (!isFormValid()) {
      if (!formData.email) {
        toast.error("Por favor ingresa tu correo electrónico")
        return
      }
      if (!isPickupSelected && !formData.address) {
        toast.error("Por favor ingresa tu dirección de envío")
        return
      }
      if (!formData.shippingMethod) {
        toast.error("Por favor selecciona un método de envío")
        return
      }
      if (!formData.paymentMethod) {
        toast.error("Por favor selecciona un método de pago")
        return
      }
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    if (isCulqui) {
      handleCulqiPay()
    } else if (isMercadoPago) {
      // MercadoPago usa el mismo botón visual del checkout y redirige al init_point.
      return
    } else if (isPayPal) {
      // PayPal se maneja con los botones oficiales
      return
    } else {
      submitOrder()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Authentication Status */}
      {!authCheckComplete && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-gray-600">Verificando autenticación...</span>
            </div>
          </div>
        </div>
      )}

      {authCheckComplete && !isAuthenticated && (
        <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-pink-800">¿Ya tienes una cuenta?</h3>
              <p className="text-sm text-pink-700">Inicia sesión para un checkout más rápido</p>
            </div>
            <Button
              variant="outline"
              className="bg-white hover:bg-pink-50"
              onClick={() => router.push("/login?redirect=/checkout")}
            >
              Iniciar sesión
            </Button>
          </div>
        </div>
      )}

      {/* Contact Information */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Contacto</h2>
          {authCheckComplete && isAuthenticated && currentUser && (
            <span className="text-sm text-muted-foreground">{currentUser.email}</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Juan"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">
              Apellido <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Pérez"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">
              Correo electrónico <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email || currentUser?.email || ""}
              onChange={(e) => {
                handleInputChange(e)
                if (e.target.value.trim() !== "") setEmailError(false)
              }}
              placeholder="tu@email.com"
              className={emailError ? "border-destructive" : ""}
              disabled={!!currentUser?.email}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">
              Teléfono <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+51 999 999 999"
              required
            />
          </div>
        </div>
      </Card>

      {/* Shipping Method */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Método de envío</h2>

        {isLoading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : methodsToShow.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            <p className="font-medium mb-1">⚠️ No hay métodos de envío disponibles</p>
            <p>Por favor contacta con soporte o verifica tu dirección.</p>
          </div>
        ) : (
          <RadioGroup
            value={formData.shippingMethod}
            onValueChange={(value) => handleSelectChange("shippingMethod", value)}
            className="space-y-3"
          >
            {methodsToShow.map((method) => {
              const priceData = method.prices[0]
              const basePrice = Number(priceData?.price || 0)
              const freeThreshold = Number(priceData?.freeShippingThreshold || 100)

              const qualifiesForFreeShipping = freeThreshold && total >= freeThreshold
              const isFree = basePrice === 0 || qualifiesForFreeShipping
              const finalPrice = qualifiesForFreeShipping ? 0 : basePrice

              const methodName = method.name.toLowerCase()
              const isPickup = methodName.includes("recojo") || methodName.includes("pickup") || methodName.includes("tienda")
              const isCoordinateDelivery =
                methodName.includes("coordinar") ||
                methodName.includes("agencia") ||
                methodName.includes("envio solo hasta agencia") ||
                methodName.includes("envío solo hasta agencia")

              return (
                <div
                  key={method.id}
                  className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {method.name.toLowerCase().includes("express") ? (
                          <Package className="h-5 w-5 text-primary" />
                        ) : (
                          <Truck className="h-5 w-5 text-primary" />
                        )}
                        <div>
                          <p className="font-medium">{method.name}</p>
                          {!isPickup && !isCoordinateDelivery && method.minDeliveryDays && method.maxDeliveryDays && method.availableDays && (
                            <p className="text-sm text-gray-600">
                              {method.minDeliveryDays === method.maxDeliveryDays
                                ? `${method.minDeliveryDays} ${getDayType(method.availableDays)}`
                                : `${method.minDeliveryDays}-${method.maxDeliveryDays} ${getDayType(method.availableDays)}`
                              } ({getDeliveryDateRange(method.minDeliveryDays, method.maxDeliveryDays, method.availableDays)})
                            </p>
                          )}
                        </div>
                      </div>
                      {isCoordinateDelivery ? null : isPickup ? (
                        <Badge variant="outline" className="bg-pink-50 text-pink-600 border-pink-200">
                          Gratis
                        </Badge>
                      ) : isFree ? (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          Gratis
                        </Badge>
                      ) : (
                        <span className="font-medium">
                          {paymentProviders[0]?.currency.symbol}
                          {Number(finalPrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </Label>
                </div>
              )
            })}
          </RadioGroup>
        )}
      </Card>

      {/* Delivery Information */}
      {!isPickupSelected && (
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Dirección de envío</h2>

          {/* Saved Addresses for Authenticated Users */}
          {isAuthenticated && currentUser && currentUser.addresses && currentUser.addresses.length > 0 && (
            <div className="space-y-3">
              <Label>Direcciones guardadas</Label>
              <RadioGroup
                value={selectedShippingAddressId || ""}
                onValueChange={(value) => handleSelectShippingAddress(value)}
                className="space-y-2"
              >
                {currentUser.addresses
                  .filter((addr) => addr.addressType === AddressType.SHIPPING || addr.addressType === AddressType.BOTH)
                  .map((address) =>
                    renderAddressCard(
                      address,
                      selectedShippingAddressId === address.id,
                      () => handleSelectShippingAddress(address.id)
                    )
                  )}
              </RadioGroup>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  if (showNewShippingAddress) {
                    setShowNewShippingAddress(false)
                  } else {
                    setShowNewShippingAddress(true)
                    handleDeselectShippingAddress()
                  }
                }}
              >
                {showNewShippingAddress ? (
                  <>
                    <Minus className="h-4 w-4" />
                    Cancelar
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Usar nueva dirección
                  </>
                )}
              </Button>
            </div>
          )}

          {/* New Shipping Address Form */}
          {(showNewShippingAddress || !isAuthenticated || !currentUser?.addresses?.length) && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">
                  Dirección <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={(e) => {
                    handleInputChange(e)
                    if (e.target.value.trim() !== "") setAddressError(false)
                  }}
                  placeholder="Av. Principal 123"
                  className={addressError ? "border-destructive" : ""}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apartment">Apartamento, suite, etc. (opcional)</Label>
                <Input
                  id="apartment"
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleInputChange}
                  placeholder="Apt. 4B"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">
                    País <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.countryCode3 || ""}
                    onValueChange={handleCountryChange}
                  disabled={allowedCountries.length === 0}
                  >
                    <SelectTrigger>
                    <SelectValue placeholder={allowedCountries.length > 0 ? "Seleccionar país" : "Cargando países..."} />
                    </SelectTrigger>
                    <SelectContent>
                    {allowedCountries.length > 0 ? (
                      allowedCountries.map(c => (
                          <SelectItem key={c.id} value={c.code3}>{c.name}</SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">Cargando países...</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">
                    Departamento <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.stateId || ""}
                    onValueChange={handleStateChange}
                    disabled={!formData.countryCode3}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.countryCode3 ? "Seleccionar departamento" : "Selecciona país primero"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(states[formData.countryId] || []).map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">
                    Ciudad <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.cityId || ""}
                    onValueChange={handleCityChange}
                    disabled={!formData.stateId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.stateId ? "Seleccionar ciudad" : "Selecciona departamento primero"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(cities[formData.stateId] || []).map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">
                    Código postal <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="15001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingPhone">
                  Teléfono <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="shippingPhone"
                  name="shippingPhone"
                  value={formData.shippingPhone}
                  onChange={handleInputChange}
                  placeholder="+51 999 999 999"
                  required
                />
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Billing (hidden for pickup) */}
      {!isPickupSelected && (
        <>
          {/* Billing Address Toggle */}
          <div className="flex items-center space-x-2 p-4 bg-muted/20 rounded-lg">
            <Checkbox
              id="sameBillingAddress"
              checked={formData.sameBillingAddress}
              onCheckedChange={handleBillingAddressToggle}
            />
            <Label htmlFor="sameBillingAddress" className="text-sm cursor-pointer">
              Usar la misma dirección para facturación
            </Label>
          </div>

          {/* Billing Address */}
          {!formData.sameBillingAddress && (
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Dirección de facturación</h2>

              {/* Similar structure as shipping address */}
              {isAuthenticated && currentUser && currentUser.addresses && currentUser.addresses.length > 0 && (
                <div className="space-y-3">
                  <Label>Direcciones guardadas</Label>
                  <RadioGroup
                    value={selectedBillingAddressId || ""}
                    onValueChange={(value) => handleSelectBillingAddress(value)}
                    className="space-y-2"
                  >
                    {currentUser.addresses
                      .filter((addr) => addr.addressType === AddressType.BILLING || addr.addressType === AddressType.BOTH)
                      .map((address) =>
                        renderAddressCard(
                          address,
                          selectedBillingAddressId === address.id,
                          () => handleSelectBillingAddress(address.id)
                        )
                      )}
                  </RadioGroup>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => {
                      if (showNewBillingAddress) {
                        setShowNewBillingAddress(false)
                      } else {
                        setShowNewBillingAddress(true)
                        handleDeselectBillingAddress()
                      }
                    }}
                  >
                    {showNewBillingAddress ? (
                      <>
                        <Minus className="h-4 w-4" />
                        Cancelar
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Usar nueva dirección
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Billing Address Form */}
              {(showNewBillingAddress || !isAuthenticated || !currentUser?.addresses?.length) && (
                <div className="space-y-4">
                  {showNewBillingAddress && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyShippingToBilling}
                    >
                      Copiar dirección de envío
                    </Button>
                  )}

                  <Input
                    value={formData.billingAddress}
                    onChange={(e) =>
                      handleInputChange({ target: { name: "billingAddress", value: e.target.value } } as any)
                    }
                    placeholder="Dirección"
                    required={!formData.sameBillingAddress}
                  />
                  <Input
                    value={formData.billingApartment}
                    onChange={(e) =>
                      handleInputChange({ target: { name: "billingApartment", value: e.target.value } } as any)
                    }
                    placeholder="Apartamento (opcional)"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      value={formData.billingCity}
                      onChange={(e) =>
                        handleInputChange({ target: { name: "billingCity", value: e.target.value } } as any)
                      }
                      placeholder="Ciudad"
                    />
                    <Input
                      value={formData.billingState}
                      onChange={(e) =>
                        handleInputChange({ target: { name: "billingState", value: e.target.value } } as any)
                      }
                      placeholder="Provincia"
                    />
                    <Input
                      value={formData.billingZipCode}
                      onChange={(e) =>
                        handleInputChange({ target: { name: "billingZipCode", value: e.target.value } } as any)
                      }
                      placeholder="Código postal"
                    />
                  </div>
                  <Input
                    value={formData.billingPhone}
                    onChange={(e) =>
                      handleInputChange({ target: { name: "billingPhone", value: e.target.value } } as any)
                    }
                    placeholder="Teléfono"
                    required={!formData.sameBillingAddress}
                  />
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {/* Payment Method */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Método de pago</h2>
        <p className="text-sm text-muted-foreground">Todas las transacciones son seguras y encriptadas</p>

        {isLoading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <RadioGroup
            value={formData.paymentMethod}
            onValueChange={(value) => handleSelectChange("paymentMethod", value)}
            className="space-y-3"
          >
            {paymentProviders.map((provider) => {
              const providerIsPayPal =
                provider.type === "PAYPAL" ||
                provider.name.toLowerCase().includes("paypal")
              const providerIsSelected = formData.paymentMethod === provider.id

              return (
                <div
                  key={provider.id}
                  className={`rounded-lg border transition-colors ${
                    providerIsSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3 p-4">
                    <RadioGroupItem value={provider.id} id={provider.id} />
                    <Label htmlFor={provider.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        {provider.imgUrl ? (
                          <div className="relative h-10 w-10">
                            <Image
                              src={provider.imgUrl}
                              alt={provider.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <CreditCard className="h-5 w-5 text-primary" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{provider.name}</p>
                          </div>
                          {provider.description && !providerIsPayPal && (
                            <p className="text-sm text-gray-500">{provider.description}</p>
                          )}
                        </div>
                      </div>
                    </Label>
                  </div>

                  {providerIsPayPal && providerIsSelected && (
                    <div className="border-t bg-white/70 p-4 pt-5">
                      <PayPalCheckoutButton
                        amount={total}
                        currency={checkoutCurrencyCode}
                        description={resumeItems || "Compra Sportt"}
                        email={formData.email || currentUser?.email || ""}
                        temporalOrderId={temporalOrderId}
                        disabled={!isFormValid() || isSubmitting}
                        onSuccess={submitOrderPayPal}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </RadioGroup>
        )}

        {/* Card Form for Credit Card Payment */}
        {formData.paymentMethod &&
          paymentProviders
            .find((p) => p.id === formData.paymentMethod)
            ?.name.toLowerCase()
            .includes("tarjeta") && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Número de tarjeta</Label>
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName">Nombre en la tarjeta</Label>
                <Input
                  id="cardName"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  placeholder="JUAN PEREZ"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Fecha de expiración</Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/AA"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    required
                  />
                </div>
              </div>
            </div>
          )}
      </Card>

      {/* Additional Notes */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Notas adicionales (opcional)</h2>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Instrucciones especiales para la entrega..."
          className="min-h-[100px]"
        />
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/cart")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al carrito
        </Button>

        {isPayPal ? (
          <div className="max-w-sm rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Completa el pago desde los botones de PayPal mostrados arriba.
          </div>
        ) : isMercadoPago ? (
          <Button
            onClick={handleMercadoPagoPay}
            disabled={isSubmitting || mpLoading || !mpPreferenceId || !isFormValid()}
            size="lg"
            className="px-8"
          >
            {mpLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando MercadoPago...
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Completar pago"
            )}
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isOpeningCulqi || !isFormValid()}
            size="lg"
            className="px-8"
          >
            {isOpeningCulqi ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando Culqi...
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Completar pago"
            )}
          </Button>
        )}
      </div>
    </motion.div>
  )
}

