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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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
  formData: Record<string, any>
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSelectChange: (name: string, value: string) => void
  prevStep: () => void
  submitOrder: () => void
  isSubmitting: boolean
  isLoading: boolean
  shippingMethods: ShippingMethod[]
  paymentProviders: PaymentProvider[]
  getPaymentIcon: (paymentName: string) => JSX.Element
  total: number // Subtotal después de descuentos (sin envío)
  resumeItems: string
  orderId: string | null
  orderError: { title: string; description?: string } | null
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
  total, // Este es el subtotal después de descuentos (sin incluir envío)
  resumeItems,
  orderId,
  orderError,
}: ShippingPaymentStepProps) {
  const selectedProvider = paymentProviders.find(
    (p) => p.id === formData.paymentMethod
  );
  const isCulqui = selectedProvider?.name?.toLowerCase() === "culqui";
  const [isOpeningCulqi, setIsOpeningCulqi] = useState(false);

  const normalizeText = (value?: string) =>
    (value || "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .trim()
      .toLowerCase();

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


  const normalizedCity = normalizeText(formData.city)
  const normalizedState = normalizeText(formData.state)
  const normalizedStateCompact = normalizedState.replace(/\s+/g, "")
  const normalizedStateCode = normalizeText(formData.stateCode)
  const normalizedCountryCandidates = [formData.countryCode, formData.countryCode3, formData.country]
    .filter(Boolean)
    .map((code) => normalizeText(code))
  const numericTotal = Number(total || 0)

  const priceMatchesLocation = (price: ShippingMethod["prices"][number]) => {
    const cityNames = Array.isArray(price.cityNames) ? price.cityNames : []
    const stateCodes = Array.isArray(price.stateCodes) ? price.stateCodes : []
    const countryCodes = Array.isArray(price.countryCodes) ? price.countryCodes : []

    const hasCityRestriction = cityNames.length > 0
    const hasStateRestriction = stateCodes.length > 0
    const hasCountryRestriction = countryCodes.length > 0

    const matchesCity = hasCityRestriction
      ? cityNames.some((city) => normalizeText(city) === normalizedCity)
      : false

    const matchesState = hasStateRestriction
      ? stateCodes.some((code) => {
          const normalizedCode = normalizeText(code)
          if (normalizedStateCode && normalizedCode === normalizedStateCode) return true
          if (normalizedStateCompact) {
            const stateShort = normalizedStateCompact.slice(0, 3)
            if (normalizedCode === stateShort) return true
          }
          return false
        })
      : false

    const matchesCountry = hasCountryRestriction
      ? countryCodes.some((code) => {
          const normalizedCode = normalizeText(code)
          return normalizedCountryCandidates.includes(normalizedCode)
        })
      : false

    if (hasCityRestriction) return matchesCity
    if (hasStateRestriction) return matchesState
    if (hasCountryRestriction) return matchesCountry

    return true
  }

  const methodPriceCandidates = shippingMethods.reduce<
    Array<{
      method: ShippingMethod
      price: ShippingMethod["prices"][number]
      matchesLocation: boolean
    }>
  >((acc, method) => {
    if (!Array.isArray(method.prices) || method.prices.length === 0) {
      return acc
    }

    const locationPrice = method.prices.find((price) => priceMatchesLocation(price))
    const effectivePrice = locationPrice ?? method.prices[0]

    acc.push({
      method,
      price: effectivePrice,
      matchesLocation: Boolean(locationPrice),
    })

    return acc
  }, [])

  const hasMatches = methodPriceCandidates.some((item) => item.matchesLocation)

  let methodsToShow = (hasMatches
    ? methodPriceCandidates.filter((item) => item.matchesLocation)
    : methodPriceCandidates
  ).map(({ method, price }) => ({ method, price }))

  const appendMethodIfNeeded = (method?: ShippingMethod, condition = true) => {
    if (!method || !condition || !Array.isArray(method.prices) || method.prices.length === 0) {
      return
    }

    if (methodsToShow.some((item) => item.method.id === method.id)) {
      return
    }

    const locationPrice = method.prices.find((price) => priceMatchesLocation(price))
    methodsToShow.push({
      method,
      price: locationPrice ?? method.prices[0],
    })
  }

  const pickupMethod = shippingMethods.find((method) =>
    method.name.toLowerCase().includes("recojo")
  )
  appendMethodIfNeeded(pickupMethod)

  const agencyMethod = shippingMethods.find((method) =>
    method.name.toLowerCase().includes("envio solo hasta agencia") ||
    method.name.toLowerCase().includes("envío solo hasta agencia")
  )
  const isNotLimaProvincia = formData.state?.toLowerCase() !== "lima"
  appendMethodIfNeeded(agencyMethod, isNotLimaProvincia)

  methodsToShow.sort((a, b) => {
    const aIsPickup =
      a.method.name.toLowerCase().includes("recojo") ||
      a.method.name.toLowerCase().includes("pickup") ||
      a.method.name.toLowerCase().includes("tienda")
    const bIsPickup =
      b.method.name.toLowerCase().includes("recojo") ||
      b.method.name.toLowerCase().includes("pickup") ||
      b.method.name.toLowerCase().includes("tienda")

    if (aIsPickup && !bIsPickup) return -1
    if (!aIsPickup && bIsPickup) return 1
    return 0
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
      {orderError && (
        <Alert variant="destructive">
          <AlertTitle>{orderError.title}</AlertTitle>
          {orderError.description && (
            <AlertDescription>{orderError.description}</AlertDescription>
          )}
        </Alert>
      )}

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
            {methodsToShow.map(({ method, price }) => {
              const priceData = price
              const basePrice = Number(priceData?.price || 0)
              const hasThresholdDefined =
                priceData?.freeShippingThreshold !== null &&
                priceData?.freeShippingThreshold !== undefined
              const freeThreshold = hasThresholdDefined
                ? Number(priceData?.freeShippingThreshold)
                : undefined

              // Calcular si califica para envío gratis (usando subtotal después de descuentos)
              const qualifiesForFreeShipping = typeof freeThreshold === "number" && numericTotal >= freeThreshold
              const isFree = basePrice === 0 || qualifiesForFreeShipping
              const finalPrice = qualifiesForFreeShipping ? 0 : basePrice
              
              // Detectar si es recojo en tienda (múltiples variaciones)
              const methodName = method.name.toLowerCase()
              const isPickup = methodName.includes("recojo") || methodName.includes("pickup") || methodName.includes("tienda")

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
                      <div className="flex-1">
                        <p className="font-medium">{method.name}</p>
                        
                        {/* Información de tiempo de entrega (solo si NO es recojo) */}
                        {!isPickup && method.minDeliveryDays && method.maxDeliveryDays && method.availableDays && (
                          <p className="text-sm text-gray-600 mt-1">
                            {method.minDeliveryDays === method.maxDeliveryDays 
                              ? `${method.minDeliveryDays} ${getDayType(method.availableDays)}`
                              : `${method.minDeliveryDays}-${method.maxDeliveryDays} ${getDayType(method.availableDays)}`
                            } ({getDeliveryDateRange(method.minDeliveryDays, method.maxDeliveryDays, method.availableDays)})
                          </p>
                        )}
                        
                        {/* Descripción o tiempo estimado */}
                        {(() => {
                          // No mostrar si es solo "0" o vacío
                          const displayText = method.description || method.estimatedDeliveryTime
                          const textStr = String(displayText || "")
                          if (!displayText || textStr === "0" || textStr === "") return null
                          
                          return (
                            <p className="text-sm text-gray-500">
                              {displayText}
                            </p>
                          )
                        })()}
                        
                        {/* Mostrar progreso hacia envío gratis (solo si NO es recojo) */}
                        {!isPickup && typeof freeThreshold === "number" && !qualifiesForFreeShipping && (
                          <p className="text-xs text-blue-600 mt-1">
                            ¡Envío gratis desde {paymentProviders[0]?.currency.symbol}{freeThreshold.toFixed(2)}!
                            {numericTotal > 0 && (
                              <span className="ml-1 text-gray-500">
                                (Te faltan {paymentProviders[0]?.currency.symbol}{(freeThreshold - numericTotal).toFixed(2)})
                              </span>
                            )}
                          </p>
                        )}
                        
                        {/* Mensaje cuando ya califica (solo si NO es recojo) */}
                        {!isPickup && typeof freeThreshold === "number" && qualifiesForFreeShipping && (
                          <p className="text-xs text-green-600 mt-1 font-medium">
                            ✓ ¡Calificaste para envío gratis!
                          </p>
                        )}
                      </div>
                    </div>
                  </Label>
                  {/* Mostrar precio o badge de gratis */}
                  {isPickup ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 font-medium px-3 py-1">
                      Gratis
                    </Badge>
                  ) : isFree ? (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 font-medium">
                      Gratis
                    </Badge>
                  ) : (
                    <span className="font-medium">
                      {paymentProviders[0]?.currency.symbol}
                      {Number(finalPrice).toFixed(2)}
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
