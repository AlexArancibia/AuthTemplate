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

// Helper function to safely get price from variant
const getSafePrice = (variant: CartItem['variant']): number => {
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

    const price = variant.prices[0]?.price
    
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
const getSafeItemTotal = (item: CartItem): number => {
  try {
    if (!item) {
      console.warn("Item is undefined or null")
      return 0
    }

    const price = getSafePrice(item.variant)
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
            const itemTotal = getSafeItemTotal(item)

            return (
              <div key={item.variant?.id || Math.random()} className="flex justify-between text-sm">
                <span>
                  {item.product?.title || "Producto"} ({item.quantity || 1})
                </span>
                <span className="font-medium pl-1">
                  {currency}
                  {(Number(item.variant.prices[0].price) * item.quantity).toFixed(2)}
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
            className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Ingresa tu código"
          />
          <button
            type="button"
            onClick={handleApplyCoupon}
            className="bg-primary cursor-pointer text-white px-4 py-2 rounded-r-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
        <div className="flex justify-between">
          <span>IGV (18%)</span>
          <span>
            {currency}
            {(typeof tax === "number" && !isNaN(tax) ? tax : 0).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Envío</span>
          <span>
            {currency}
            {(typeof shipping === "number" && !isNaN(shipping) ? shipping : 0).toFixed(2)}
          </span>
        </div>
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