"use client"

import { Separator } from "@/components/ui/separator"
import { CartItem } from "@/stores/cartStore"
import { useMainStore } from "@/stores/mainStore"
import { useState } from "react"

interface OrderSummaryProps {
  items: any[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  currency: string
  currentStep: number
  formData: any
  totalDiscounts: number
  shippingMethods: any[]
  paymentProviders: any[]
}

// Helper function to safely get price from variant
const getSafePrice = (variant: any): number => {
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
    if (typeof price !== "number" || isNaN(price)) {
      console.warn("Invalid price value:", price, "for variant:", variant)
      return 0
    }

    return price
  } catch (error) {
    console.error("Error getting price from variant:", error, variant)
    return 0
  }
}

// Helper function to safely get item total
const getSafeItemTotal = (item: any): number => {
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

  // Determinar si mostrar mensaje de cupón y su estilo
  const showCouponMessage = couponCode && (totalDiscounts > 0 || inputValue)
  const couponMessageStyle = totalDiscounts > 0 
    ? "text-green-600" 
    : "text-gray-500"

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
              : "Cupón inválido"}
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
            <p className="text-sm text-gray-600">
              {formData.address || "No especificada"}
              {formData.apartment && `, ${formData.apartment}`}
              {formData.city && `, ${formData.city}`}
              {formData.state && `, ${formData.state}`}
              {formData.zipCode && ` ${formData.zipCode}`}
            </p>
            {formData.shippingPhone && <p className="text-sm text-gray-600">Tel: {formData.shippingPhone}</p>}
          </div>

          {/* Billing Address */}
          <div>
            <h3 className="font-medium mb-2 text-base">Dirección de facturación</h3>
            {formData.sameBillingAddress ? (
              <p className="text-sm text-gray-600 italic">Misma que la dirección de envío</p>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  {formData.billingAddress || "No especificada"}
                  {formData.billingApartment && `, ${formData.billingApartment}`}
                  {formData.billingCity && `, ${formData.billingCity}`}
                  {formData.billingState && `, ${formData.billingState}`}
                  {formData.billingZipCode && ` ${formData.billingZipCode}`}
                </p>
                {formData.billingPhone && <p className="text-sm text-gray-600">Tel: {formData.billingPhone}</p>}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}