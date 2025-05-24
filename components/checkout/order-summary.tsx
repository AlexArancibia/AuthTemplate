import { Separator } from "@/components/ui/separator"

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
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 sticky top-24">
      <h2 className="text-xl font-semibold mb-4">Resumen del pedido</h2>

      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.variant.id} className="flex justify-between text-sm">
            <span>
              {item.product.title} ({item.quantity})
            </span>
            <span className="font-medium">
              {currency}
              {Number(item.variant.prices[0].price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>
            {currency}
            {Number(subtotal).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>IGV (18%)</span>
          <span>
            {currency}
            {Number(tax).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Envío</span>
          <span>
            {currency}
            {Number(shipping).toFixed(2)}
          </span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>
          {currency}
          {Number(total).toFixed(2)}
        </span>
      </div>

      {/* Shipping Address Summary (only show in payment step) */}
      {currentStep === 2 && (
        <div className="mt-6 pt-6 border-t">
          <div className="mb-4">
            <h3 className="font-medium mb-2">Dirección de envío</h3>
            <p className="text-sm text-gray-600">
              {formData.address}, {formData.apartment && `${formData.apartment}, `}
              {formData.city}, {formData.state} {formData.zipCode}
            </p>
            <p className="text-sm text-gray-600">Tel: {formData.shippingPhone}</p>
          </div>

          {/* Billing Address */}
          <div>
            <h3 className="font-medium mb-2">Dirección de facturación</h3>
            {formData.sameBillingAddress ? (
              <p className="text-sm text-gray-600 italic">Misma que la dirección de envío</p>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  {formData.billingAddress}, {formData.billingApartment && `${formData.billingApartment}, `}
                  {formData.billingCity}, {formData.billingState} {formData.billingZipCode}
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
