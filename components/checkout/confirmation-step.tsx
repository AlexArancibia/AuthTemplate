"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShopSettings } from "@/types/store"

interface ConfirmationStepProps {
  orderId: string | null
  isAuthenticated: boolean
  currentUser: any
  formData: any
  items: any[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  currency: string
  shopSettings: ShopSettings[]
}

export function ConfirmationStep({
  orderId,
  isAuthenticated,
  currentUser,
  formData,
  items,
  subtotal,
  tax,
  shipping,
  total,
  currency,
  shopSettings,
}: ConfirmationStepProps) {
  return (
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
          Número de pedido: <span className="font-bold">{orderId || `CL-${Math.floor(Math.random() * 10000)}`}</span>
        </p>
        <p className="text-gray-600 text-sm">Guarda este número para futuras referencias.</p>
      </div>

      <div className="w-full max-w-md mb-8">
        {formData.paymentMethod === "pp_9c77d30e-6d2b" ? (
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
            href={`https://wa.me/${shopSettings[0].phone?.replace(/\s+/g, "") || ""}?text=${encodeURIComponent(
              `Hola, acabo de realizar el pedido #${orderId || `CL-${Math.floor(Math.random() * 10000)}`} y quisiera coordinar el pago.
              *Detalles del pedido:*
              ${items
                .map(
                  (item) =>
                    `- ${item.product.title} - ${Object.entries(item.variant.attributes || {})
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(", ")} (${item.quantity} x ${currency}${Number(item.variant.prices[0].price).toFixed(2)})`,
                )
                .join("\n")}

              *Subtotal:* ${currency}${Number(subtotal).toFixed(2)}
              *IGV (18%):* ${currency}${Number(tax).toFixed(2)}
              *Envío:* ${currency}${Number(shipping).toFixed(2)}
              *Total:* ${currency}${Number(total).toFixed(2)}

              *Dirección de envío:*
              ${formData.firstName} ${formData.lastName}
              ${formData.address}${formData.apartment ? `, ${formData.apartment}` : ""}
              ${formData.city}, ${formData.state} ${formData.zipCode}

              ${
                !formData.sameBillingAddress
                  ? `*Dirección de facturación:*
              ${formData.billingAddress}${formData.billingApartment ? `, ${formData.billingApartment}` : ""}
              ${formData.billingCity}, ${formData.billingState} ${formData.billingZipCode}`
                  : "*Dirección de facturación:* Misma que la dirección de envío"
              }

              Gracias.`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-4 px-6 rounded-lg w-full transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
          >
            {/* ...SVG y texto de WhatsApp... */}
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
        {formData.paymentMethod !== "pp_9c77d30e-6d2b" && (
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
  )
}
