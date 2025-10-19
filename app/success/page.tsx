// Página de éxito: consulta el estado del pedido usando external_reference
'use client'

import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation'
import { motion } from "framer-motion"
import { CheckoutSteps } from "@/components/checkout/checkout-steps"
import apiClient from "@/lib/axiosConfig";
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShopSettings } from "@/types/store"
import { User } from "@/types/user"
import { Address } from "@/stores/userStore"
import { useCartStore } from "@/stores/cartStore"
import { useEmailStore } from "@/stores/emailStore"
import { CartItem } from "@/stores/cartStore"
import { ShippingMethod } from "@/types/shippingMethod"
import { usePersistedCheckoutFormDataStore } from '@/stores/persistedCheckoutFormDataStore'
import { usePersistedMainStore } from '@/stores/persistedMainStore'
import { useEmailOrderDataStore } from '@/stores/emailOrderDataStore'
import { Order } from "@/types/order";
import { extractApiData } from "@/lib/apiHelpers"

import { useMainStore } from "@/stores/mainStore"
import { type AddressCreateData, useUserStore } from "@/stores/userStore"

const STEPS = {
  CART_REVIEW: 0,
  CUSTOMER_INFO: 1,
  SHIPPING_PAYMENT: 2,
  CONFIRMATION: 3,
}
const checkoutSteps = [
  { step: STEPS.CART_REVIEW, label: "Carrito" },
  { step: STEPS.CUSTOMER_INFO, label: "Información" },
  { step: STEPS.SHIPPING_PAYMENT, label: "Envío y Pago" },
  { step: STEPS.CONFIRMATION, label: "Confirmación" },
]

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const { clearCart } = useCartStore()
  const { sendOrderEmails } = useEmailStore()
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [authCheckComplete, setAuthCheckComplete] = useState(false)
  const { shopSettings, shippingMethods } = usePersistedMainStore()
  const { currentUser, loading: userLoading, fetchUserByEmail  } = useUserStore()
  const { formDataPersist } = usePersistedCheckoutFormDataStore();
  const { updateOrder } = useMainStore();

  const { emailOrderDataPersist } = useEmailOrderDataStore();

  const storeId = process.env.NEXT_PUBLIC_STORE_ID;
  const temporalOrderId = searchParams.get("external_reference");
  const currentStep = 4
  // Obtener todos los parámetros
  const paramsObj: Record<string, string | null> = {}
  const keys = [
    'collection_id', 'collection_status', 'payment_id', 'status', 'external_reference',
    'payment_type', 'merchant_order_id', 'preference_id', 'site_id', 'processing_mode', 'merchant_account_id'
  ]
  keys.forEach(key => {
    paramsObj[key] = searchParams.get(key)
  })

  useEffect(() => {
    const fetchSessionAndUser = async () => {
      try {
        // For client components, we need to use a different approach to get the session
        // Instead of importing auth directly, we'll make a fetch request to an API endpoint
        const response = await fetch("/api/auth/session")

        if (!response.ok) {
          throw new Error(`Failed to fetch session: ${response.status}`)
        }

        const sessionData = await response.json()

        if (sessionData && sessionData.user && sessionData.user.email) {
          setSession(sessionData)
          setIsAuthenticated(true)

          // Fetch user data by email instead of ID
          const userData = await fetchUserByEmail(sessionData.user.email)
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        setIsAuthenticated(false)
      } finally {
        setAuthCheckComplete(true)
      }
    }

    fetchSessionAndUser()
  }, [fetchUserByEmail])

  useEffect(() => {
    if (storeId && temporalOrderId) {
      setLoading(true);
      apiClient
        .get(`/orders/${storeId}/temporal/${temporalOrderId}`)
        .then((res) => {
          setOrderData(res.data.data);
            clearCart();
        })
        .catch((err) => setError("No se encontró la orden"))
        .finally(() => setLoading(false));
    }
  }, [storeId, temporalOrderId]);

  useEffect(() => {
    const paymentId = searchParams.get("payment_id");
    if (paymentId && orderData?.id) {
      fetch(`/api/webhooks/mercadopago`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'payment',
          data: { id: paymentId }
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.allOk) {
            const patchBody = { financialStatus: 'PAID' };
            updateOrder(orderData.id, patchBody);
          }
        });
    }
  }, [searchParams, storeId, orderData?.id]);

  // Enviar email de orden al cargar la página si hay datos persistidos
  useEffect(() => {
    if (emailOrderDataPersist && shopSettings && shopSettings[0]) {
      sendOrderEmails(emailOrderDataPersist, shopSettings[0]);
    }
  }, [emailOrderDataPersist, shopSettings, sendOrderEmails]);

  // Helper function to get shipping method label
  const getShippingMethodLabel = () => {
    const selectedMethod = shippingMethods.find(m => m.id === formDataPersist.shippingMethod)
    if (!selectedMethod) return "Envío"
    
    const methodName = selectedMethod.name.toLowerCase()
    if (methodName.includes("recojo")) return "Recojo"
    if (methodName.includes("envio solo hasta agencia") || methodName.includes("envío solo hasta agencia")) {
      return "Envío solo hasta agencia"
    }
    return "Envío"
  }

  const getShippingAddressData = () => {
    if (isAuthenticated && currentUser && orderData.shippingAddress.id) {
      // If user has selected an existing address, get data from that address
      const selectedAddress = currentUser.addresses?.find(
        (addr: Address) => addr.id === orderData.shippingAddress.id
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
      address: formDataPersist.address || "",
      apartment: formDataPersist.apartment || "",
      city: formDataPersist.city || "",
      state: formDataPersist.state || "",
      zipCode: formDataPersist.zipCode || "",
      shippingPhone: formDataPersist.shippingPhone || "",
    }
  }

  const getBillingAddressData = () => {
    if (formDataPersist.sameBillingAddress) {
      return getShippingAddressData()
    }

    if (isAuthenticated && currentUser && orderData.shippingAddress.id) {
      // If user has selected an existing billing address, get data from that address
      const selectedAddress = currentUser.addresses?.find(
        (addr: Address) => addr.id === orderData.shippingAddress.id
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
      address: formDataPersist.billingAddress || "",
      apartment: formDataPersist.billingApartment || "",
      city: formDataPersist.billingCity || "",
      state: formDataPersist.billingState || "",
      zipCode: formDataPersist.billingZipCode || "",
      billingPhone: formDataPersist.billingPhone || "",
    }
  }

  // Mostrar loader mientras se carga orderData
  if (loading || !orderData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <svg className="animate-spin h-10 w-10 text-emerald-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <p className="text-gray-600 text-lg">Cargando información de tu pedido...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white n py-12">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        {/* Checkout Header */}
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
            Checkout
          </h1>

          {/* Progress Steps */}
          <CheckoutSteps steps={checkoutSteps} currentStep={currentStep} />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className={currentStep === STEPS.CONFIRMATION ? "lg:col-span-3" : "lg:col-span-2"}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-xl shadow-md border border-slate-100 p-6 sm:p-8"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center py-16 px-4 text-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.6, type: "spring" }}
                    className="w-24 h-24 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/10"
                  >
                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                  </motion.div>

                  <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                    ¡Gracias por tu compra!
                  </h2>

                  <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg">
                    Tu pedido ha sido recibido y está siendo procesado.
                    {isAuthenticated && currentUser ? " Hemos enviado un correo electrónico con los detalles de tu compra." : ""}
                  </p>

                  <div className="bg-gray-50 p-6 rounded-xl mb-10 w-full max-w-md border border-gray-100 shadow-sm">
                    <p className="text-gray-800 font-medium mb-2">
                      Número de pedido: <span className="font-bold">{orderData.id || `CL-${Math.floor(Math.random() * 10000)}`}</span>
                    </p>
                    <p className="text-gray-600 text-sm">Guarda este número para futuras referencias.</p>
                  </div>

                  <div className="w-full max-w-md mb-8">
                    {formDataPersist.paymentMethod === "pp_2c3f4080-1a54" ? (
                      <div className="flex flex-col items-center justify-center gap-4 bg-emerald-50 border border-emerald-100 rounded-xl p-6 shadow-lg shadow-emerald-500/10">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-emerald-500 mb-2"
                        >
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#10b981" />
                          <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" />
                        </svg>
                        <h3 className="text-xl font-semibold text-emerald-700">¡Pago recibido!</h3>
                        <p className="text-gray-700 text-center">
                          Hemos recibido tu pago y estamos esperando la verificación para procesar el envío de tu pedido.
                        </p>
                        <p className="text-gray-500 text-center text-sm">
                          Si deseas más información sobre tu pedido, comunícate con nosotros al{" "}
                          <a
                            href={`https://wa.me/${shopSettings[0].phone?.replace(/\s+/g, "") || ""}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 underline"
                          >
                            WhatsApp
                          </a>
                          .
                        </p>
                      </div>
                    ) : (
                      <a
                        href={`https://wa.me/${shopSettings?.[0]?.phone?.replace(/\s+/g, "") || ""}?text=${encodeURIComponent(
                          `Hola, acabo de realizar el pedido #${orderData?.id || `CL-${Math.floor(Math.random() * 10000)}`} y quisiera coordinar el pago.
                          *Detalles del pedido:*
                          ${orderData?.lineItems?.map(
                            (lineItems: any) => {
                              const priceObj = lineItems?.variant?.prices?.find((p: any) => p.currencyId === orderData?.currency?.id)
                              const price = priceObj?.price ?? lineItems?.variant?.prices?.[0]?.price ?? 0
                              return `- ${lineItems?.product?.title} - ${Object.entries(lineItems?.variant?.attributes || {})
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(", ")} (${lineItems?.quantity} x ${orderData?.currency}${Number(price).toFixed(2)})`
                            }
                          ).join("\n")}

                          *Subtotal:* ${orderData?.currency}${Number(orderData?.subtotalPrice ?? 0).toFixed(2)}
                          *IGV (18%):* ${orderData?.currency}${Number(orderData?.totalTax ?? 0).toFixed(2)}
                          *${getShippingMethodLabel()}:* ${orderData?.currency}${Number(orderData?.shippingStatus ?? 0).toFixed(2)}
                          *Total:* ${orderData?.currency}${Number(orderData?.totalPrice ?? 0).toFixed(2)}

                          *Dirección de envío:*
                          ${orderData?.firstName || ''} ${orderData?.lastName || ''}
                          ${(() => {
                            const shippingData = getShippingAddressData()
                            return `${shippingData.address}${shippingData.apartment ? `, ${shippingData.apartment}` : ""}
                          ${shippingData.city}, ${shippingData.state} ${shippingData.zipCode}`
                          })()}

                          ${
                            !orderData?.billingAddress
                              ? `*Dirección de facturación:*
                          ${(() => {
                            const billingData = getBillingAddressData()
                            return `${billingData.address}${billingData.apartment ? `, ${billingData.apartment}` : ""}
                          ${billingData.city}, ${billingData.state} ${billingData.zipCode}`
                          })()} `
                              : "*Dirección de facturación:* Misma que la dirección de envío"
                          }

                          Gracias.`,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-4 px-6 rounded-lg w-full transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="white"
                          stroke="currentColor"
                          strokeWidth="0"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Contactar por WhatsApp para gestionar el pago
                      </a>
                    )}
                    {formDataPersist.paymentMethod !== "pp_2c3f4080-1a54" && (
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        Nuestro equipo te ayudará a completar el proceso de pago y responderá todas tus dudas.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" asChild>
                      <Link href="/productos">Seguir comprando</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/">Volver al inicio</Link>
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
