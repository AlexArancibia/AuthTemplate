"use client"

import type React from "react"
import { toast } from "sonner";
import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, Package, Truck, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { JSX } from "react"
import { PaymentProvider } from "@/types/payments"
import { ShippingMethod } from "@/types/shippingMethod"
import Image from "next/image"
import { loadCulqiScript, openCulqiCheckout, setCulqiCallback } from "@/components/checkout/cuqui-checkout";

export function watchCulqiClose(onClose: () => void) {
  const observer = new MutationObserver(() => {
    const iframeExists = !!document.querySelector("iframe[src*='culqi']");
    if (!iframeExists) {
      onClose();
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  return observer;
}
interface ShippingPaymentStepProps {
  formData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSelectChange: (name: string, value: string) => void
  prevStep: () => void
  submitOrder: () => void
  isSubmitting: boolean
  isLoading: boolean
  shippingMethods: ShippingMethod[]
  paymentProviders: PaymentProvider[]
  getPaymentIcon: (paymentName: string) => JSX.Element
  total: number
  resumeItems: string
  orderId: string | null
}

export function ShippingPaymentStep({
  formData,
  handleInputChange,
  handleSelectChange,
  prevStep,
  submitOrder,
  isSubmitting,
  isLoading,
  shippingMethods,
  paymentProviders,
  getPaymentIcon,
  total,
  resumeItems,
  orderId,
}: ShippingPaymentStepProps) {
  const selectedProvider = paymentProviders.find(
    (p) => p.id === formData.paymentMethod
  );
  const isCulqui = selectedProvider?.name?.toLowerCase() === "culqui";
  const [isOpeningCulqi, setIsOpeningCulqi] = useState(false);

  const handleCulqiPay = async () => {
    const amount = Math.round(Number(total) * 100);

    try {
      setIsOpeningCulqi(true);
      await loadCulqiScript();

      watchCulqiClose(() => {
        setIsOpeningCulqi(false);
      });

      setCulqiCallback(
        async (token) => {
          setIsOpeningCulqi(false);
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
                  address: formData.address,
                  city: formData.city,
                  countryCode: "PE",
                  orderNumber: orderId,
                }),
              });

              const data = await res.json();

              if (!res.ok) {
                toast.error(data.error || "Error procesando el pago");
                return;
              }

              handleSelectChange("culqiToken", token);
              await submitOrder();
            } catch (error) {
              console.error("Error de conexión con el backend", error);
              toast.error("Error de conexión con el backend");
            }
          }
        },
        (error) => {
          setIsOpeningCulqi(false);
          toast.error("Error en el pago con Culqi");
        }
      );

      await openCulqiCheckout(amount, "Pago de productos:\n" + resumeItems);
    } catch (err) {
      setIsOpeningCulqi(false);
      toast.error("No se pudo iniciar el pago con Culqi");    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
      {/* Shipping Method Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Método de envío</h2>

        {isLoading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <RadioGroup
            value={formData.shippingMethod}
            onValueChange={(value) => handleSelectChange("shippingMethod", value)}
            className="space-y-4"
          >
            {shippingMethods.map((method) => {
              const price = method.prices[0]?.price || 0
              const isFree = price === 0  

              return (
                <div
                  key={method.id}
                  className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                >
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center">
                      {method.name.toLowerCase().includes("express") ? (
                        <Package className="mr-3 h-5 w-5 text-primary" />
                      ) : (
                        <Truck className="mr-3 h-5 w-5 text-primary" />
                      )}
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-gray-500">{method.description || method.estimatedDeliveryTime}</p>
                      </div>
                    </div>
                  </Label>
                  {isFree ? (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 font-medium">
                      Gratis
                    </Badge>
                  ) : (
                    <span className="font-medium">
                      {paymentProviders[0]?.currency.symbol}
                      {Number(price).toFixed(2)}
                    </span>
                  )}
                </div>
              )
            })}
          </RadioGroup>
        )}
      </div>

      <Separator />

      {/* Payment Method Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Método de pago</h2>

        {isLoading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <RadioGroup
            value={formData.paymentMethod}
            onValueChange={(value) => handleSelectChange("paymentMethod", value)}
            className="space-y-4"
          >
            {paymentProviders.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              >
                <RadioGroupItem value={provider.id} id={provider.id} />
                <Label htmlFor={provider.id} className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    {/* Mostrar imagen del proveedor si existe, si no mostrar icono de tarjeta */}
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
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      {/* Mostrar descripción si existe */}
                      {provider.description && (
                        <p className="text-sm text-gray-500">{provider.description}</p>
                      )}
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

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
                  placeholder="John Doe"
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
      </div>

      {/* Additional Notes */}
      <div className="space-y-2 pt-4">
        <Label htmlFor="notes">Notas adicionales (opcional)</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Instrucciones especiales para la entrega"
          className="min-h-[100px]"
        />
      </div>
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Atrás
        </Button>
        <Button
          onClick={isCulqui ? handleCulqiPay : submitOrder}
          disabled={isSubmitting}
          className="px-8 py-2.5 bg-primary hover:bg-primary/90 transition-all shadow-md shadow-primary/10 hover:shadow-primary/20"
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
            <>{isCulqui ? "Pagar" : "Finalizar compra"}</>
          )}
        </Button>
      </div>
    </motion.div>
  )
}