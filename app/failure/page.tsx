// Página de fallo: muestra cuando el pago no se procesó correctamente o fue cancelado
'use client'

import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation'
import { motion } from "framer-motion"
import { CheckoutSteps } from "@/components/checkout/checkout-steps"
import apiClient from "@/lib/axiosConfig";
import Link from "next/link"
import { XCircle } from "lucide-react"
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

export default function FailurePage() {
  const searchParams = useSearchParams()
  const { clearCart } = useCartStore()
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
        })
        .catch((err) => setError("No se encontró la orden"))
        .finally(() => setLoading(false));
    }
  }, [storeId, temporalOrderId]);

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
    if (isAuthenticated && currentUser && orderData?.shippingAddress?.id) {
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

    if (isAuthenticated && currentUser && orderData?.shippingAddress?.id) {
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
        <svg className="animate-spin h-10 w-10 text-red-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <p className="text-gray-600 text-lg">Cargando información...</p>
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

        <div className="max-w-4xl mx-auto">
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
                    className="w-24 h-24 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-red-500/10"
                  >
                    <XCircle className="w-12 h-12 text-red-500" />
                  </motion.div>

                  <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-700">
                    ¡Ups! Algo salió mal
                  </h2>

                  <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg">
                    Su pago no se ha procesado correctamente o ha cancelado el proceso de pago.
                    No te preocupes, tu pedido se ha guardado y puedes intentar el pago nuevamente.
                  </p>

                  <div className="bg-red-50 p-6 rounded-xl mb-10 w-full max-w-md border border-red-100 shadow-sm">
                    <p className="text-red-800 font-medium mb-2">
                      Número de pedido: <span className="font-bold">{orderData.id || `CL-${Math.floor(Math.random() * 10000)}`}</span>
                    </p>
                    <p className="text-red-600 text-sm">Este pedido está pendiente de pago.</p>
                  </div>

                  <div className="w-full max-w-md mb-8">
                    <div className="flex flex-col items-center justify-center gap-4 bg-red-50 border border-red-100 rounded-xl p-6 shadow-lg shadow-red-500/10">
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
                        className="text-red-500 mb-2"
                      >
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#ef4444" />
                        <path d="M15 9l-6 6" stroke="#fff" strokeWidth="2" fill="none" />
                        <path d="M9 9l6 6" stroke="#fff" strokeWidth="2" fill="none" />
                      </svg>
                      <h3 className="text-xl font-semibold text-red-700">Pago no procesado</h3>
                      <p className="text-gray-700 text-center">
                        Tu pago no se pudo procesar correctamente. Esto puede deberse a problemas con tu tarjeta, 
                        fondos insuficientes o que hayas cancelado el proceso.
                      </p>
                      <p className="text-gray-500 text-center text-sm">
                        Si necesitas ayuda, comunícate con nosotros al{" "}
                        <a
                          href={`https://wa.me/${shopSettings?.[0]?.phone?.replace(/\s+/g, "") || ""}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 underline"
                        >
                          WhatsApp
                        </a>
                        .
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" asChild>
                      <Link href="/checkout">Reintentar pago</Link>
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
  )
}
