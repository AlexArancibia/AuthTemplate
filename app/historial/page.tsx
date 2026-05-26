"use client"

import { useUserStore } from "@/stores/userStore"
import { useMainStore } from "@/stores/mainStore"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getOrderPaymentStatusLabel } from "@/lib/order-payment-status"
import type { Order } from "@/types/order"

export default function HistorialPage() {
  const { currentUser, loading } = useUserStore()
  const { orders } = useMainStore()
  const router = useRouter()

  // Si no está logeado, mostrar mensaje centrado
  if (!currentUser && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md mx-auto border border-gray-200"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Historial de pedidos</h2>
          <p className="text-gray-500 mb-6">Debes iniciar sesión para ver tu historial de pedidos.</p>
          <Button onClick={() => router.push("/login")} className="bg-primary text-white px-6 py-2 rounded-md">Iniciar sesión</Button>
        </motion.div>
      </div>
    )
  }

  // Filtrar pedidos del usuario logeado
  const userOrders: Order[] = orders
    .filter(order => order.customerInfo?.userId === currentUser?.id)

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]">Cargando...</div>
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Historial de pedidos</h1>
      {userOrders.length === 0 ? (
        <div className="text-center text-gray-500">No tienes pedidos registrados.</div>
      ) : (
        <div className="relative max-w-2xl mx-auto">
          {/* Línea vertical */}
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-gray-200 rounded-full" />
          <ul className="space-y-8">
            {userOrders
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((order, idx) => (
                <li key={order.id} className="relative pl-16">
                  {/* Punto en la línea */}
                  <span className="absolute left-4 top-4 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <Clock className="w-3 h-3 text-white" />
                  </span>
                  <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-lg text-primary">Pedido #{order.orderNumber}</span>
                      <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-gray-700 mb-2">Total: <span className="font-bold">S/ {order.totalPrice}</span></div>
                    <div className="text-gray-500 text-sm">
                      Estado: {getOrderPaymentStatusLabel(order)}
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}
