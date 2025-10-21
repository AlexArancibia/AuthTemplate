"use client"

import { Separator } from "@/components/ui/separator"
import { CartItem } from "@/stores/cartStore"
import { useMainStore } from "@/stores/mainStore"
import { useState } from "react"
import { User } from "@/types/user"
import { ShippingMethod } from "@/types/shippingMethod"
import { PaymentProvider } from "@/types/payments"
import { Address } from "@/stores/userStore"

interface OrderSummaryProps {
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  currency: string
  currentStep: number
  formData: Record<string, any>
  totalDiscounts: number
  shippingMethods: ShippingMethod[]
  paymentProviders: PaymentProvider[]
  // Add new props for address handling
  isAuthenticated?: boolean
  currentUser?: (User & { addresses?: Address[] }) | null
  selectedShippingAddressId?: string | null
  selectedBillingAddressId?: string | null
  selectedCurrencyId?: string
}

interface AddressData {
  address: string
  apartment: string
  city: string
  state: string
  zipCode: string
  shippingPhone?: string
  billingPhone?: string
}

// Función para detectar el tipo de días disponibles
const getDayType = (availableDays: string[]) => {
  const allDays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const businessDays = ["mon", "tue", "wed", "thu", "fri"];
  
  if (!availableDays || availableDays.length === 0) return "días";
  
  const sortedAvailable = [...availableDays].sort();
  const sortedBusiness = [...businessDays].sort();
  const sortedAll = [...allDays].sort();
  
  if (JSON.stringify(sortedAvailable) === JSON.stringify(sortedBusiness)) {
    return "días hábiles";
  } else if (JSON.stringify(sortedAvailable) === JSON.stringify(sortedAll)) {
    return "días";
  } else {
    return "días disponibles";
  }
};

// Función para calcular el rango de fechas de entrega
const getDeliveryDateRange = (minDays: number, maxDays: number, availableDays: string[]) => {
  const dayMap: { [key: string]: number } = {
    sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6
  };
  
  const availableDayNumbers = availableDays.map(day => dayMap[day.toLowerCase()]);
  
  const calculateDeliveryDate = (daysToAdd: number) => {
    const today = new Date();
    let daysAdded = 0;
    let currentDate = new Date(today);
    
    while (daysAdded < daysToAdd) {
      currentDate.setDate(currentDate.getDate() + 1);
      const dayOfWeek = currentDate.getDay();
      
      if (availableDayNumbers.includes(dayOfWeek)) {
        daysAdded++;
      }
    }
    
    return currentDate;
  };
  
  const minDate = calculateDeliveryDate(minDays || 1);
  const maxDate = calculateDeliveryDate(maxDays || minDays || 1);
  
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleDateString('es-ES', { month: 'short' });
    return `${day} ${month}`;
  };
  
  if (minDays === maxDays) {
    return formatDate(minDate);
  }
  
  return `${formatDate(minDate)} - ${formatDate(maxDate)}`;
};

// Helper function to safely get price from variant
const getSafePrice = (variant: CartItem['variant'], currencyId?: string): number => {
  try {
    if (!variant) {
      console.warn("Variant is undefined or null")
      return 0
    }

    if (!variant.prices || !Array.isArray(variant.prices)) {
      console.warn("Variant prices is undefined or not an array:", variant)
      return 0
    }

    if (variant.prices.length === 0) {
      console.warn("Variant prices array is empty:", variant)
      return 0
    }

    // Si se proporciona currencyId, buscar precio específico para esa moneda
    let price = variant.prices[0]?.price
    if (currencyId) {
      const priceObj = variant.prices.find(p => p.currencyId === currencyId)
      price = priceObj?.price ?? variant.prices[0]?.price
    }
    
    // Convert to number and validate
    const numericPrice = Number(price)
    if (isNaN(numericPrice) || numericPrice < 0) {
      console.warn("Invalid price value:", price, "for variant:", variant)
      return 0
    }

    return numericPrice
  } catch (error) {
    console.error("Error getting price from variant:", error, variant)
    return 0
  }
}

// Helper function to safely get item total
const getSafeItemTotal = (item: CartItem, currencyId?: string): number => {
  try {
    if (!item) {
      console.warn("Item is undefined or null")
      return 0
    }

    const price = getSafePrice(item.variant, currencyId)
    const quantity = item.quantity || 1

    if (typeof quantity !== "number" || isNaN(quantity) || quantity < 0) {
      console.warn("Invalid quantity:", quantity, "for item:", item)
      return 0
    }

    return price * quantity
  } catch (error) {
    console.error("Error calculating item total:", error, item)
    return 0
  }
}

export function OrderSummary({
  items,
  subtotal,
  tax,
  shipping,
  total,
  currency,
  currentStep,
  formData,
  totalDiscounts,
  shippingMethods,
  paymentProviders,
  isAuthenticated = false,
  currentUser = null,
  selectedShippingAddressId = null,
  selectedBillingAddressId = null,
  selectedCurrencyId,
}: OrderSummaryProps) {
  const { couponCode, setCouponCode } = useMainStore()
  const [inputValue, setInputValue] = useState("")
  const validItems = Array.isArray(items) ? items.filter((item) => item && item.variant && item.product) : []

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleApplyCoupon = () => {
    setCouponCode(inputValue)
  }

  // Helper function to get shipping address data
  const getShippingAddressData = (): AddressData => {
    if (isAuthenticated && currentUser && selectedShippingAddressId) {
      // If user has selected an existing address, get data from that address
      const selectedAddress = currentUser.addresses?.find(
        (addr: Address) => addr.id === selectedShippingAddressId
      )
      if (selectedAddress) {
        return {
          address: selectedAddress.address1,
          apartment: selectedAddress.address2 || "",
          city: selectedAddress.city,
          state: selectedAddress.province || "",
          zipCode: selectedAddress.zip || "",
          shippingPhone: selectedAddress.phone || "",
        }
      }
    }
    // Fallback to form data
    return {
      address: formData.address || "",
      apartment: formData.apartment || "",
      city: formData.city || "",
      state: formData.state || "",
      zipCode: formData.zipCode || "",
      shippingPhone: formData.shippingPhone || "",
    }
  }

  // Helper function to get billing address data
  const getBillingAddressData = (): AddressData => {
    if (formData.sameBillingAddress) {
      return getShippingAddressData()
    }

    if (isAuthenticated && currentUser && selectedBillingAddressId) {
      // If user has selected an existing billing address, get data from that address
      const selectedAddress = currentUser.addresses?.find(
        (addr: Address) => addr.id === selectedBillingAddressId
      )
      if (selectedAddress) {
        return {
          address: selectedAddress.address1,
          apartment: selectedAddress.address2 || "",
          city: selectedAddress.city,
          state: selectedAddress.province || "",
          zipCode: selectedAddress.zip || "",
          billingPhone: selectedAddress.phone || "",
        }
      }
    }
    // Fallback to form data
    return {
      address: formData.billingAddress || "",
      apartment: formData.billingApartment || "",
      city: formData.billingCity || "",
      state: formData.billingState || "",
      zipCode: formData.billingZipCode || "",
      billingPhone: formData.billingPhone || "",
    }
  }

  // Determinar si mostrar mensaje de cupón y su estilo
  const showCouponMessage = couponCode && couponCode.trim() !== ""
  const couponMessageStyle = totalDiscounts > 0 
    ? "text-green-600" 
    : "text-red-500"

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 sticky top-24">
      <h2 className="text-xl font-semibold mb-4">Resumen del pedido</h2>

      <div className="space-y-4 mb-6">
        {validItems.length > 0 ? (
          validItems.map((item: CartItem) => {
            const itemTotal = getSafeItemTotal(item, selectedCurrencyId)

            return (
              <div key={item.variant?.id || Math.random()} className="flex justify-between text-sm">
                <span>
                  {item.product?.title || "Producto"} ({item.quantity || 1})
                </span>
                <span className="font-medium pl-1">
                  {currency}
                  {itemTotal.toFixed(2)}
                </span>
              </div>
            )
          })
        ) : (
          <div className="text-sm text-gray-500 italic">No hay productos en el carrito</div>
        )}
      </div>

      <Separator className="my-4" />

      {/* Coupon Code Section */}
      <div className="mb-4">
        <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-1">
          Código de descuento
        </label>
        <div className="flex">
          <input
            type="text"
            id="coupon"
            value={inputValue}
            onChange={handleCouponChange}
            className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
            placeholder="Ingresa tu código"
          />
          <button
            type="button"
            onClick={handleApplyCoupon}
            className="bg-primary cursor-pointer text-white px-4 py-2 rounded-r-md text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
          >
            Aplicar
          </button>
        </div>
        {showCouponMessage && (
          <p className={`mt-1 text-sm ${couponMessageStyle}`}>
            {totalDiscounts > 0 
              ? `Cupón aplicado: ${couponCode}` 
              : "Cupón no válido o no aplicable"}
          </p>
        )}
      </div>

      <Separator className="my-4" />

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>
            {currency}
            {(typeof subtotal === "number" && !isNaN(subtotal) ? subtotal : 0).toFixed(2)}
          </span>
        </div>
        {couponCode && totalDiscounts > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Descuento ({couponCode})</span>
            <span>-{currency}{totalDiscounts.toFixed(2)}</span>
          </div>
        )}
        {tax > 0 && (
          <div className="flex justify-between">
            <span>IGV (18%)</span>
            <span>
              {currency}
              {(typeof tax === "number" && !isNaN(tax) ? tax : 0).toFixed(2)}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span>
            {(() => {
              const selectedMethod = shippingMethods.find(m => m.id === formData.shippingMethod)
              if (!selectedMethod) return "Envío"
              
              const methodName = selectedMethod.name.toLowerCase()
              if (methodName.includes("recojo") || methodName.includes("pickup") || methodName.includes("tienda")) {
                return "Recojo en tienda"
              }
              if (methodName.includes("envio solo hasta agencia") || methodName.includes("envío solo hasta agencia")) {
                return "Envío solo hasta agencia"
              }
              return "Envío"
            })()}
          </span>
          {(() => {
            if (!formData.shippingMethod) {
              return <span className="text-gray-400 italic">--</span>
            }
            
            const selectedMethod = shippingMethods.find(m => m.id === formData.shippingMethod)
            if (!selectedMethod) {
              return <span className="text-gray-400 italic">--</span>
            }
            
            const methodName = selectedMethod.name.toLowerCase()
            const isPickup = methodName.includes("recojo") || methodName.includes("pickup") || methodName.includes("tienda")
            
            // Si es recojo, mostrar "Gratis" en azul
            if (isPickup) {
              return <span className="text-pink-600 font-semibold">Gratis</span>
            }
            
            // Si el shipping es 0, mostrar "Gratis" en verde
            if (shipping === 0) {
              return <span className="text-green-600 font-semibold">Gratis</span>
            }
            
            return <span>{currency}{(typeof shipping === "number" && !isNaN(shipping) ? shipping : 0).toFixed(2)}</span>
          })()}
        </div>
        {/* Mensaje de envío gratis (solo si NO es recojo) */}
        {formData.shippingMethod && (() => {
          const selectedMethod = shippingMethods.find(m => m.id === formData.shippingMethod)
          if (!selectedMethod) return null
          
          const methodName = selectedMethod.name.toLowerCase()
          const isPickup = methodName.includes("recojo") || methodName.includes("pickup") || methodName.includes("tienda")
          if (isPickup) return null // No mostrar mensajes de envío gratis en recojo
          
          const priceData = selectedMethod.prices[0]
          // Convertir a número para asegurar comparaciones y .toFixed()
          const freeThreshold = Number(priceData?.freeShippingThreshold || 100)
          const subtotalAfterDiscount = subtotal - totalDiscounts
          
          if (shipping === 0 && subtotalAfterDiscount >= freeThreshold) {
            return (
              <div className="text-xs text-green-600 mt-1 font-medium">
                ✓ ¡Calificaste para envío gratis!
              </div>
            )
          } else if (freeThreshold && subtotalAfterDiscount < freeThreshold) {
            const remaining = freeThreshold - subtotalAfterDiscount
            return (
              <div className="text-xs text-pink-600 mt-1">
                Envío gratis desde {currency}{freeThreshold.toFixed(2)} (Te faltan {currency}{remaining.toFixed(2)})
              </div>
            )
          }
          return null
        })()}
        
        {/* Fecha de entrega estimada */}
        {formData.shippingMethod && (() => {
          const selectedMethod = shippingMethods.find(m => m.id === formData.shippingMethod)
          if (!selectedMethod) return null
          
          const methodName = selectedMethod.name.toLowerCase()
          const isPickup = methodName.includes("recojo") || methodName.includes("pickup") || methodName.includes("tienda")
          
          // Si es recojo, mostrar mensaje diferente
          if (isPickup) {
            return (
              <div className="text-xs text-gray-600 mt-1">
                Disponible para recoger inmediatamente
              </div>
            )
          }
          
          // Si tiene información de días de entrega, mostrarla
          if (selectedMethod.minDeliveryDays && selectedMethod.maxDeliveryDays && selectedMethod.availableDays) {
            const dayTypeText = getDayType(selectedMethod.availableDays)
            const dateRange = getDeliveryDateRange(
              selectedMethod.minDeliveryDays, 
              selectedMethod.maxDeliveryDays, 
              selectedMethod.availableDays
            )
            
            return (
              <div className="text-xs text-gray-600 mt-1">
                <span className="font-medium">Llegada estimada:</span> {dateRange}
                {selectedMethod.minDeliveryDays === selectedMethod.maxDeliveryDays 
                  ? ` (${selectedMethod.minDeliveryDays} ${dayTypeText})`
                  : ` (${selectedMethod.minDeliveryDays}-${selectedMethod.maxDeliveryDays} ${dayTypeText})`
                }
              </div>
            )
          }
          
          return null
        })()}
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>
          {currency}
          {(typeof total === "number" && !isNaN(total) ? total : 0).toFixed(2)}
        </span>
      </div>

      {/* Shipping Address Summary (only show in payment step) */}
      {currentStep === 2 && formData && (
        <div className="mt-6 pt-6 border-t">
          <div className="mb-4">
            <h3 className="font-medium text-base mb-2">Dirección de envío</h3>
            {(() => {
              const shippingData = getShippingAddressData()
              return (
                <>
                  <p className="text-sm text-gray-600">
                    {shippingData.address || "No especificada"}
                    {shippingData.apartment && `, ${shippingData.apartment}`}
                    {shippingData.city && `, ${shippingData.city}`}
                    {shippingData.state && `, ${shippingData.state}`}
                    {shippingData.zipCode && ` ${shippingData.zipCode}`}
                  </p>
                  {shippingData.shippingPhone && <p className="text-sm text-gray-600">Tel: {shippingData.shippingPhone}</p>}
                </>
              )
            })()}
          </div>

          {/* Billing Address */}
          <div>
            <h3 className="font-medium mb-2 text-base">Dirección de facturación</h3>
            {formData.sameBillingAddress ? (
              <p className="text-sm text-gray-600 italic">Misma que la dirección de envío</p>
            ) : (
              (() => {
                const billingData = getBillingAddressData()
                return (
                  <>
                    <p className="text-sm text-gray-600">
                      {billingData.address || "No especificada"}
                      {billingData.apartment && `, ${billingData.apartment}`}
                      {billingData.city && `, ${billingData.city}`}
                      {billingData.state && `, ${billingData.state}`}
                      {billingData.zipCode && ` ${billingData.zipCode}`}
                    </p>
                    {billingData.billingPhone && <p className="text-sm text-gray-600">Tel: {billingData.billingPhone}</p>}
                  </>
                )
              })()
            )}
          </div>
        </div>
      )}
    </div>
  )
}
