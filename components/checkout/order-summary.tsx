"use client"

import { Separator } from "@/components/ui/separator"
import { CartItem } from "@/stores/cartStore"

interface OrderSummaryProps {
  items: any[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  currency: string
  currentStep: number
  formData: any
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
  shippingMethods,
  paymentProviders,
}: OrderSummaryProps) {
  // Validar que items sea un array válido
  const validItems = Array.isArray(items) ? items.filter((item) => item && item.variant && item.product) : []

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 sticky top-24">
      <h2 className="text-xl font-semibold mb-4">Resumen del pedido</h2>

      <div className="space-y-4 mb-6">
        {validItems.length > 0 ? (
          validItems.map((item : CartItem) => {
            const itemTotal = getSafeItemTotal(item)

            return (
              <div key={item.variant?.id || Math.random()} className="flex justify-between text-sm">
                <span>
                  {item.product?.title || "Producto"} ({item.quantity || 1})
                </span>
                <span className="font-medium pl-1">
                  {currency}
                  {(Number(item.variant.prices[0].price)*item.quantity).toFixed(2)}
                </span>
              </div>
            )
          })
        ) : (
          <div className="text-sm text-gray-500 italic">No hay productos en el carrito</div>
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
            <h3 className="font-medium mb-2">Dirección de envío</h3>
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
            <h3 className="font-medium mb-2">Dirección de facturación</h3>
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
