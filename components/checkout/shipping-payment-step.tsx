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
import { useEffect, useRef } from "react";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { getPublicKey } from "@/lib/mercadopago-ac"

const publicKey = await getPublicKey();
initMercadoPago(publicKey, {locale: "es-PE"});

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
  submitOrderMP: () => void
  isSubmitting: boolean
  isLoading: boolean
  shippingMethods: ShippingMethod[]
  paymentProviders: PaymentProvider[]
  getPaymentIcon: (paymentName: string) => JSX.Element
  total: number // Subtotal después de descuentos (sin envío)
  resumeItems: string
  orderId: string | null
  temporalOrderId: string | null
}

export function ShippingPaymentStep({
  formData,
  handleInputChange,
  handleSelectChange,
  prevStep,
  submitOrder,
  submitOrderMP,
  isSubmitting,
  isLoading,
  shippingMethods,
  paymentProviders,
  getPaymentIcon,
  total, // Este es el subtotal después de descuentos (sin incluir envío)
  resumeItems,
  orderId,
  temporalOrderId,
}: ShippingPaymentStepProps) {
  const selectedProvider = paymentProviders.find(
    (p) => p.id === formData.paymentMethod
  );
  const isCulqui = selectedProvider?.name?.toLowerCase() === "culqui";
  const isMercadoPago = selectedProvider?.name?.toLowerCase() === "mercadopago";
  const [isOpeningCulqi, setIsOpeningCulqi] = useState(false);

  const [mpPreferenceId, setMpPreferenceId] = useState<string | null>(null);
  const [mpLoading, setMpLoading] = useState(false);
  const mpInitialized = useRef(false);

  // useEffect(() => {
  //   if (!(window as any).MercadoPago) {
  //     const script =document.createElement("script");
  //     script.src = "https://sdk.mercadopago.com/js/v2"
  //     script.async = true;
  //     script.onload = () =>{
  //       console.log("Ya se inicializo Mercado Pago")
  //     }
  //     document.body.appendChild(script);

  //     return () => {
  //         document.body.removeChild(script);
  //     }
  //   }
  // }, []);
  
  useEffect(() => {
    if (!isMercadoPago) {
      setMpPreferenceId(null);
    } else {
      if(!(window as any).MercadoPago){
        initMercadoPago(publicKey, {locale: "es-PE"});
      } else {
        console.log("Ya se inicializo")
      }
      (async () => {
        setMpLoading(true);
        setMpPreferenceId(null);
        try {
          createPreferenceIdFromEndpoint()
        } catch (err) {
          toast.error("Error de conexión con MercadoPago");
        } finally {
          setMpLoading(false);
        }
      })();
    }
  }, [isMercadoPago, total, resumeItems, formData, orderId]);

  const createPreferenceIdFromEndpoint = async () => {
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
        address: formData.address,
        city: formData.city,
        countryCode: "PE",
        temporalOrderId: temporalOrderId,
      }),
    });
    const data = await res.json();
    console.log("dataendpoint", data);
    
    if (data.success && data.preference_id) {
      console.log("data: ", data)
      setMpPreferenceId(data.preference_id);
      // OpenMPCheckout()
    } else {
      toast.error(data.error || "No se pudo crear la preferencia de MercadoPago");
    }
  }

  const OpenMPCheckout = () => {
    if((window as any).MercadoPago) {
      const mp = new (window as any).MercadoPago(publicKey, {
        locale: "es-PE",
      }) 

      mp.checkout({
        preference: {id: mpPreferenceId},
        autoOpen: true,
        iframe: true,
        render: {
          container: "mp-checkout",
          label: "pagar",
        },
      });
    } else {
      console.log("No se ha inicializado")
    }
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

  const isNotLimaProvincia = formData.state?.toLowerCase() !== "lima"

  let methodsToShow = [...filteredShippingMethods]
  
  if (pickupMethod && !methodsToShow.find(m => m.id === pickupMethod.id)) {
    methodsToShow.push(pickupMethod)
  }
  
  if (agencyMethod && isNotLimaProvincia && !methodsToShow.find(m => m.id === agencyMethod.id)) {
    methodsToShow.push(agencyMethod)
  }

  // Ordenar para que recojo aparezca primero
  methodsToShow.sort((a, b) => {
    const aIsPickup = a.name.toLowerCase().includes("recojo") || a.name.toLowerCase().includes("pickup") || a.name.toLowerCase().includes("tienda")
    const bIsPickup = b.name.toLowerCase().includes("recojo") || b.name.toLowerCase().includes("pickup") || b.name.toLowerCase().includes("tienda")
    
    if (aIsPickup && !bIsPickup) return -1
    if (!aIsPickup && bIsPickup) return 1
    return 0
  })

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
            {methodsToShow.map((method) => {
              const priceData = method.prices[0]
              const basePrice = Number(priceData?.price || 0)
              // TEMPORAL: Usar 100 como threshold por defecto mientras el backend no lo guarda
              // Convertir a número para asegurar que tenga el método .toFixed()
              const freeThreshold = Number(priceData?.freeShippingThreshold || 100)
              
              // DEBUG: Ver qué datos llegan
              console.log('🔍 DEBUG Método:', method.name)
              console.log('📦 priceData completo:', priceData)
              console.log('💰 freeThreshold:', freeThreshold)
              console.log('🛒 subtotal después de descuentos:', total)
              
              // Calcular si califica para envío gratis (usando subtotal después de descuentos)
              const qualifiesForFreeShipping = freeThreshold && total >= freeThreshold
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
                        {!isPickup && freeThreshold && !qualifiesForFreeShipping && (
                          <p className="text-xs text-pink-600 mt-1">
                            ¡Envío gratis desde {paymentProviders[0]?.currency.symbol}{freeThreshold.toFixed(2)}!
                            {total > 0 && (
                              <span className="ml-1 text-gray-500">
                                (Te faltan {paymentProviders[0]?.currency.symbol}{(freeThreshold - total).toFixed(2)})
                              </span>
                            )}
                          </p>
                        )}
                        
                        {/* Mensaje cuando ya califica (solo si NO es recojo) */}
                        {!isPickup && qualifiesForFreeShipping && (
                          <p className="text-xs text-green-600 mt-1 font-medium">
                            ✓ ¡Calificaste para envío gratis!
                          </p>
                        )}
                      </div>
                    </div>
                  </Label>
                  {/* Mostrar precio o badge de gratis */}
                  {isPickup ? (
                    <Badge variant="outline" className="bg-pink-50 text-pink-600 border-pink-200 font-medium px-3 py-1">
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
        {/* Botón de pago MercadoPago */}
        {isMercadoPago && mpPreferenceId ? (
          <div className="">
            {mpLoading ? (
              <Button disabled className="px-8 py-2.5 bg-primary">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando MercadoPago...
              </Button>
            ) : (
              // <button
              //   onClick={createPreferenceIdFromEndpoint}
              //   className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3"
              // >
              //   Pagar con Mercado Pago
              // </button>
              <div onClick={submitOrderMP} style={{ cursor: "pointer" }}>
                <Wallet initialization={{ preferenceId: mpPreferenceId! }} />
              </div>
            )}
            <div
              className="mp-checkout"
            >
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </motion.div>
  )
}
